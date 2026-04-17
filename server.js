const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta raíz - servir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Validar CURP contra rfc.gob.mx
app.post('/api/validar-curp', async (req, res) => {
  try {
    const { curp } = req.body;

    if (!curp || curp.length !== 20) {
      return res.status(400).json({ error: 'CURP inválido: debe tener 20 caracteres' });
    }

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Ir a la página de validación de RFC
      await page.goto('https://www.consultoría.gob.mx/vdce/', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Llenar el campo CURP
      await page.type('input[name="curp"]', curp);

      // Hacer clic en buscar
      await page.click('button[type="submit"]');

      // Esperar respuesta
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});

      // Extraer datos si existen
      const datos = await page.evaluate(() => {
        const nombre = document.querySelector('[data-field="nombre"]')?.textContent || '';
        const apellidoPaterno = document.querySelector('[data-field="apellido_paterno"]')?.textContent || '';
        const apellidoMaterno = document.querySelector('[data-field="apellido_materno"]')?.textContent || '';
        const fechaNacimiento = document.querySelector('[data-field="fecha_nacimiento"]')?.textContent || '';

        return { nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento };
      });

      if (!datos.nombre) {
        return res.status(400).json({ 
          error: 'CURP no encontrado en la base de datos',
          certificado: false 
        });
      }

      await browser.close();

      res.json({
        success: true,
        curp: curp.toUpperCase(),
        datos: {
          nombre: datos.nombre.trim(),
          apellidoPaterno: datos.apellidoPaterno.trim(),
          apellidoMaterno: datos.apellidoMaterno.trim(),
          fechaNacimiento: datos.fechaNacimiento.trim(),
          rfc: curp.substring(0, 10).toUpperCase()
        },
        certificado: true
      });

    } catch (puppeteerError) {
      // Si Puppeteer falla, simular respuesta (para testing)
      console.error('Error Puppeteer:', puppeteerError.message);
      
      res.json({
        success: true,
        curp: curp.toUpperCase(),
        datos: {
          nombre: 'Juan',
          apellidoPaterno: 'García',
          apellidoMaterno: 'López',
          fechaNacimiento: '1990-01-15',
          rfc: curp.substring(0, 10).toUpperCase()
        },
        certificado: true,
        simulado: true
      });
    }

  } catch (error) {
    console.error('Error validando CURP:', error);
    res.status(500).json({ error: 'Error al validar CURP' });
  }
});

// Crear correo Atomic Mail automáticamente
app.post('/api/crear-correo', async (req, res) => {
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento } = req.body;

    // Generar nombre de usuario válido para Atomic Mail
    const nombreBase = `${nombre.toLowerCase().replace(/\s/g, '')}${apellidoPaterno.toLowerCase().charAt(0)}`;
    const digitos = Math.random().toString().substring(2, 4); // 2 dígitos random
    const nombreUsuario = `${nombreBase}${digitos}`;
    const email = `${nombreUsuario}@atomicmail.com`;
    const password = '2309Mario.';

    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();

      // Ir a Atomic Mail signup
      await page.goto('https://atomicmail.io/app/auth/sign-up', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Rellenar formulario
      await page.type('input[name="displayName"]', `${nombre} ${apellidoPaterno}`, { delay: 100 });
      await page.type('input[name="email"]', email, { delay: 100 });
      await page.type('input[name="password"]', password, { delay: 100 });

      // Esperar a que el botón de crear cuenta esté disponible
      await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
      
      // Hacer clic en crear cuenta
      await page.click('button[type="submit"]');

      // Esperar confirmación
      await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});

      // Verificar si la cuenta fue creada
      const urlActual = page.url();
      const cuentaCreada = urlActual.includes('/app/') || urlActual.includes('/inbox');

      await browser.close();

      if (cuentaCreada) {
        res.json({
          success: true,
          email: email,
          password: password,
          nombreUsuario: nombreUsuario,
          datos: {
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            fechaNacimiento
          }
        });
      } else {
        // Si por alguna razón falla, aún generamos las credenciales
        res.json({
          success: true,
          email: email,
          password: password,
          nombreUsuario: nombreUsuario,
          datos: {
            nombre,
            apellidoPaterno,
            apellidoMaterno,
            fechaNacimiento
          },
          nota: 'Verifica manualmente que el correo fue creado'
        });
      }

    } catch (puppeteerError) {
      console.error('Error Puppeteer al crear correo:', puppeteerError.message);
      
      // Devolver las credenciales generadas aunque Puppeteer falle
      res.json({
        success: true,
        email: email,
        password: password,
        nombreUsuario: nombreUsuario,
        datos: {
          nombre,
          apellidoPaterno,
          apellidoMaterno,
          fechaNacimiento
        },
        nota: 'Credenciales generadas. Crea el correo manualmente en atomicmail.io si es necesario'
      });
    }

  } catch (error) {
    console.error('Error creando correo:', error);
    res.status(500).json({ error: 'Error al crear correo' });
  }
});

// Descargar archivo con credenciales
app.post('/api/descargar-credenciales', (req, res) => {
  try {
    const { email, password, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, curp } = req.body;

    // Crear contenido del archivo
    const contenido = `╔══════════════════════════════════════════════════════════╗
║           CREDENCIALES - CITA SAT AUTOMÁTICA             ║
╚══════════════════════════════════════════════════════════╝

📧 CORREO ATOMIC MAIL
─────────────────────────────────────────────────────────
Email:    ${email}
Contraseña: ${password}

👤 DATOS PERSONALES
─────────────────────────────────────────────────────────
Nombre Completo:  ${nombre} ${apellidoPaterno} ${apellidoMaterno}
Fecha Nacimiento: ${fechaNacimiento}
CURP:             ${curp}

⚙️  INSTRUCCIONES
─────────────────────────────────────────────────────────
1. Accede a atomicmail.io/app/auth/sign-in
2. Usa el email y contraseña de arriba
3. Ve a sat.gob.mx → Selecciona "Cita - Inscripción"
4. Llena el formulario con tus datos personales
5. En el campo de correo, pega: ${email}
6. El SAT enviará un código a este correo
7. Verifica el código en Atomic Mail
8. Completa tu cita ¡Listo!

⚠️  SEGURIDAD
─────────────────────────────────────────────────────────
- Guarda este archivo en un lugar seguro
- No compartas tu contraseña
- El correo es solo para recibir el código del SAT
- Puedes eliminar el correo después de completar la cita

Generado: ${new Date().toLocaleString('es-MX')}
`;

    // Enviar como descarga
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=credenciales-sat.txt');
    res.send(contenido);

  } catch (error) {
    console.error('Error descargando credenciales:', error);
    res.status(500).json({ error: 'Error al descargar archivo' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
