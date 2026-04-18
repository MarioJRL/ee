export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password, nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento, curp } = req.body;
    const contenido = 'CREDENCIALES - CITA SAT\n======================\n\nEmail:      ' + email + '\nContrasena: ' + password + '\nNombre:     ' + nombre + ' ' + apellidoPaterno + ' ' + apellidoMaterno + '\nFecha Nac:  ' + fechaNacimiento + '\nCURP:       ' + curp + '\n\nPASOS:\n1. Crea cuenta en: atomicmail.io/app/auth/sign-up\n   Email: ' + email + '\n   Contrasena: ' + password + '\n2. Ve a sat.gob.mx - Citas - Inscripcion RFC\n3. Usa ' + email + ' en el campo de correo\n4. SAT enviara codigo - copialo de Atomic Mail y pegalo en SAT';
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=credenciales-sat.txt');
    return res.send(contenido);
  } catch (error) {
    return res.status(500).json({ error: 'Error: ' + error.message });
  }
}