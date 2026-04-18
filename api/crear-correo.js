export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento } = req.body;
    if (!nombre || !apellidoPaterno) return res.status(400).json({ error: 'Nombre y apellido paterno son requeridos' });
    const base = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '').substring(0, 8);
    const inicialAP = apellidoPaterno.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '').charAt(0);
    const digitos = Math.floor(10 + Math.random() * 89).toString();
    const nombreUsuario = base + inicialAP + digitos;
    const email = nombreUsuario + '@atomicmail.io';
    const password = '2309Mario.';
    return res.status(200).json({ success: true, email, password, nombreUsuario, datos: { nombre, apellidoPaterno, apellidoMaterno, fechaNacimiento } });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno: ' + error.message });
  }
}