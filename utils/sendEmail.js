import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export default async function sendEmail({ name, email, phone, message, html, subject }) {
  await transporter.sendMail({
    from: `"AcolhaPatas" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject || "AcolhaPatas - Notificação",
    text: message || undefined,
    html: html || undefined
  });
}

