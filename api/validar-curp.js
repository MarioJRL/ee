export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { curp } = req.body;
    const c = curp?.toUpperCase().trim();
    if (!c || c.length !== 18) return res.status(400).json({ error: 'CURP debe tener exactamente 18 caracteres' });
    const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
    if (!curpRegex.test(c)) return res.status(400).json({ error: 'Formato de CURP invalido. Verifica que este correcto.' });
    const sexo = c[10] === 'H' ? 'Masculino' : 'Femenino';
    const anio = c.substring(4, 6);
    const mes = c.substring(6, 8);
    const dia = c.substring(8, 10);
    const anioFull = parseInt(anio) > 24 ? '19' + anio : '20' + anio;
    const fechaNacimiento = dia + '/' + mes + '/' + anioFull;
    return res.status(200).json({
      success: true,
      curp: c,
      datos: { nombre: '', apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento, sexo, rfc: c.substring(0, 10) },
      certificado: true
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno: ' + error.message });
  }
}