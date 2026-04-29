const nodemailer = require('nodemailer');

let transporterPromise = null;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } =
    process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT) || 587,
        secure: String(SMTP_SECURE).toLowerCase() === 'true',
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    );
  } else {
    console.warn(
      '[mailer] Aucune config SMTP trouvée — création d\'un compte Ethereal de test...'
    );
    transporterPromise = nodemailer.createTestAccount().then((account) => {
      console.log('[mailer] Ethereal user:', account.user);
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: account.user, pass: account.pass },
      });
    });
  }

  return transporterPromise;
}

async function sendEmail({ to, subject, html, text }) {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@agence-voyage.com',
    to,
    subject,
    text,
    html,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log('[mailer] Aperçu (Ethereal) :', preview);
  } else {
    console.log('[mailer] Email envoyé à', to, '— id:', info.messageId);
  }

  return info;
}

module.exports = { sendEmail };
