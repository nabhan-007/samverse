const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

const sendOtpMail = async (to, code, purpose = "signup") => {
  if (!process.env.SMTP_HOST) {
    console.log(`[mail:dev] OTP for ${to} is ${code}`);
    return null;
  }

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || "Samverse <no-reply@samverse.in>",
    to,
    subject: `${code} is your Samverse code`,
    text: `Your Samverse code is ${code}. It expires in 2 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px">
        <h2 style="color:#1a44d6;margin:0 0 12px">Samverse</h2>
        <p style="color:#334155;margin:0 0 16px">Use this code to verify your email.</p>
        <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#0f172a;margin:0 0 16px">${code}</p>
        <p style="color:#64748b;font-size:13px;margin:0">Expires in 2 minutes.</p>
      </div>`,
  });

  console.log(`[mail] OTP sent to ${to}`);
};

module.exports = { sendOtpMail };
