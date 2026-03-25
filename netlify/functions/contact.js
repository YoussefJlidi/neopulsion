const nodemailer = require('nodemailer');

// Simple in-memory rate limiter (resets on cold start)
const requests = new Map();
const RATE_LIMIT = 5;       // max requests
const RATE_WINDOW = 60000;  // per 60s

function isRateLimited(ip) {
  const now = Date.now();
  const entry = requests.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW) {
    requests.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  requests.set(ip, { count: entry.count + 1, start: entry.start });
  return false;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.handler = async (event) => {
  // CORS — only allow requests from neopulsion.com
  const origin = event.headers.origin || '';
  const allowed = ['https://neopulsion.com', 'https://www.neopulsion.com', 'https://neopulsion.netlify.app'];
  const corsOrigin = allowed.includes(origin) ? origin : allowed[0];

  const corsHeaders = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  // Rate limiting
  const ip = event.headers['x-forwarded-for']?.split(',')[0].trim() || 'unknown';
  if (isRateLimited(ip)) {
    return { statusCode: 429, headers: corsHeaders, body: 'Too Many Requests' };
  }

  const params = new URLSearchParams(event.body);
  const prenom     = params.get('prenom')?.slice(0, 100) || '';
  const nom        = params.get('nom')?.slice(0, 100) || '';
  const email      = params.get('email')?.slice(0, 200) || '';
  const entreprise = params.get('entreprise')?.slice(0, 200) || '';
  const besoin     = params.get('besoin')?.slice(0, 50) || '';
  const message    = params.get('message')?.slice(0, 5000) || '';
  const budget     = params.get('budget')?.slice(0, 50) || '';
  const delai      = params.get('delai')?.slice(0, 50) || '';

  // Validate required fields
  if (!prenom || !nom || !email || !message) {
    return { statusCode: 400, headers: corsHeaders, body: 'Missing required fields' };
  }
  if (!isValidEmail(email)) {
    return { statusCode: 400, headers: corsHeaders, body: 'Invalid email' };
  }

  // Escape all user inputs before inserting in HTML
  const safe = {
    prenom:     escapeHtml(prenom),
    nom:        escapeHtml(nom),
    email:      escapeHtml(email),
    entreprise: escapeHtml(entreprise),
    besoin:     escapeHtml(besoin),
    message:    escapeHtml(message).replace(/\n/g, '<br>'),
    budget:     escapeHtml(budget),
    delai:      escapeHtml(delai),
  };

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
    subject: `[Neopulsion] ${safe.besoin ? safe.besoin.toUpperCase() : 'Nouveau message'} — ${safe.prenom} ${safe.nom}`,
    html: `
      <h2>Nouveau message via neopulsion.com</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Contact</td><td style="padding:8px;">${safe.prenom} ${safe.nom}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Email</td><td style="padding:8px;"><a href="mailto:${safe.email}">${safe.email}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Entreprise</td><td style="padding:8px;">${safe.entreprise || '—'}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Besoin</td><td style="padding:8px;">${safe.besoin || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Budget</td><td style="padding:8px;">${safe.budget || '—'}</td></tr>
        <tr style="background:#f9f9f9;"><td style="padding:8px;font-weight:bold;color:#555;">Délai</td><td style="padding:8px;">${safe.delai || '—'}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;color:#555;">Message</td><td style="padding:8px;">${safe.message}</td></tr>
      </table>
    `,
  });

  return { statusCode: 200, headers: corsHeaders, body: 'OK' };
};
