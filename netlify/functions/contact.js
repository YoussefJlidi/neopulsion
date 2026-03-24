const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const params = new URLSearchParams(event.body);
  const prenom    = params.get('prenom') || '';
  const nom       = params.get('nom') || '';
  const email     = params.get('email') || '';
  const entreprise = params.get('entreprise') || '';
  const besoin    = params.get('besoin') || '';
  const message   = params.get('message') || '';
  const budget    = params.get('budget') || '';
  const delai     = params.get('delai') || '';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Neopulsion Contact" <${process.env.GMAIL_USER}>`,
    to: 'jlidi.youssef@gmail.com',
    replyTo: email,
    subject: `[Neopulsion] ${besoin ? besoin.toUpperCase() : 'Nouveau message'} — ${prenom} ${nom}`,
    html: `
      <h2>Nouveau message via neopulsion.com</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Contact</td><td style="padding:8px;">${prenom} ${nom}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Email</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Entreprise</td><td style="padding:8px;">${entreprise || '—'}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Besoin</td><td style="padding:8px;">${besoin || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Budget</td><td style="padding:8px;">${budget || '—'}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Délai</td><td style="padding:8px;">${delai || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Message</td><td style="padding:8px;">${message.replace(/\n/g, '<br>')}</td></tr>
      </table>
    `,
  });

  return { statusCode: 200, body: 'OK' };
};
