# 🎯 Cita SAT - Automática

Automatización completa para solicitar citas en el SAT. Valida CURP, crea correo Atomic Mail y descarga credenciales automáticamente.

## ✨ Características

✅ **Validación automática de CURP** contra rfc.gob.mx  
✅ **Creación automática de correo Atomic Mail**  
✅ **Contraseña fija**: `2309Mario.` (configurable)  
✅ **Descarga de credenciales** en archivo TXT  
✅ **Funciona desde celular y computadora**  
✅ **Acceso desde cualquier dispositivo vía URL web**  

---

## 🚀 Despliegue en Vercel (5 minutos)

### Opción 1: Deploy automático (Más fácil)

1. **Copia todos los archivos** a una carpeta en tu computadora:
   ```
   sat-cita-app/
   ├── server.js
   ├── package.json
   ├── vercel.json
   ├── .env.example
   └── public/
       └── index.html
   ```

2. **Ve a https://vercel.com** y crea una cuenta (gratis)

3. **Conecta tu GitHub** (o crea un nuevo repo)

4. **Sube los archivos** a tu repositorio

5. **En Vercel**, haz click en "New Project"

6. **Selecciona tu repositorio**

7. **Vercel detectará automáticamente** que es un proyecto Node.js

8. **Click en "Deploy"** ¡Listo!

Vercel te dará una URL como: `https://tu-proyecto.vercel.app`

---

### Opción 2: Despliegue local (para testing)

1. **Instala Node.js** desde https://nodejs.org (versión 18+)

2. **Abre terminal** en la carpeta del proyecto

3. **Instala dependencias:**
   ```bash
   npm install
   ```

4. **Crea archivo `.env`:**
   ```bash
   cp .env.example .env
   ```

5. **Ejecuta el servidor:**
   ```bash
   npm start
   ```

6. **Abre en el navegador:**
   ```
   http://localhost:3000
   ```

---

## 📱 Cómo usar

### Desde tu teléfono:
1. Accede a tu URL de Vercel (ej: `https://tu-proyecto.vercel.app`)
2. Ingresa tu CURP (20 caracteres)
3. Click en "Validar CURP"
4. Revisa datos extraídos
5. Click en "Crear Correo Atomic Mail"
6. Click en "Descargar Credenciales"
7. Usa el correo en el formulario del SAT

### Desde tu computadora:
1. Mismo proceso que arriba
2. Puedes tener la app abierta en una pestaña mientras completas el formulario del SAT en otra

---

## 📋 Archivos incluidos

| Archivo | Descripción |
|---------|-------------|
| `server.js` | Backend Node.js con Express + Puppeteer |
| `public/index.html` | Frontend React |
| `package.json` | Dependencias del proyecto |
| `vercel.json` | Configuración para Vercel |
| `.env.example` | Variables de entorno |

---

## 🔧 Personalización

### Cambiar la contraseña fija

En `server.js`, línea ~95, cambia:
```javascript
const password = '2309Mario.';
```

a tu contraseña deseada.

### Cambiar el dominio de correo Atomic Mail

En `server.js`, línea ~92:
```javascript
const email = `${nombreUsuario}@atomicmail.com`;
```

Si usas otro dominio, cambia `atomicmail.com` al tuyo.

---

## ⚠️ Notas importantes

1. **Puppeteer necesita Chromium**: Vercel tiene soporte nativo, pero toma más tiempo en el primer despliegue (~3 min)

2. **El servidor de validación de CURP es lento**: La validación de rfc.gob.mx puede tardar 10-15 segundos. Es normal.

3. **Si el CURP no se encuentra**: Verifica que esté certificado en el SAT

4. **La creación de correo puede fallar si Atomic Mail tiene protecciones**: En ese caso, el app te dará las credenciales para crear el correo manualmente (toma 30 segundos)

---

## 🆘 Troubleshooting

### "Error: Puppeteer timeout"
- Espera 10-15 segundos, es normal en la validación de CURP
- Si persiste, reinicia el servidor

### "CURP no encontrado"
- Verifica que el CURP esté correctamente certificado en el SAT
- Intenta de nuevo en 5 minutos

### "Error creando correo"
- Crea el correo manualmente en atomicmail.io
- El app te mostrará las credenciales para usarlas

### La URL no funciona
- Verifica que el despliegue en Vercel haya terminado (puede tomar 3-5 minutos)
- Recarga la página (Ctrl+Shift+R en Chrome)

---

## 📚 Estructura de respuestas del servidor

### Validación CURP
```json
{
  "success": true,
  "curp": "ABCD870101HDFMNN09",
  "datos": {
    "nombre": "Juan",
    "apellidoPaterno": "García",
    "apellidoMaterno": "López",
    "fechaNacimiento": "1990-01-15",
    "rfc": "ABCD870101"
  },
  "certificado": true
}
```

### Creación de correo
```json
{
  "success": true,
  "email": "juan01@atomicmail.com",
  "password": "2309Mario.",
  "nombreUsuario": "juan01",
  "datos": {...}
}
```

---

## 🔐 Seguridad

- ✅ Las credenciales se generan localmente
- ✅ No se guardan en el servidor
- ✅ Se descargan directamente en tu dispositivo
- ✅ Puedes eliminar el correo después de usarlo

---

## 📞 Soporte

Si tienes problemas:
1. Revisa el console del navegador (F12)
2. Verifica logs de Vercel
3. Intenta de nuevo en 5 minutos
4. Contacta a soporte del SAT si el CURP no se valida

---

## 📄 Licencia

Uso personal. No distribuir sin permiso.

---

**¿Necesitas ayuda?** Revisa que todos los archivos estén en la carpeta correcta antes de desplegar.
