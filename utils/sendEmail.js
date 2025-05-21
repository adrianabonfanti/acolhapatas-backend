const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendEmail({ name, email, phone, message, html, subject }) {
  console.log("📬 [sendEmail] CHAMADA PARA:", email);
  console.log("📝 Mensagem:", message?.slice(0, 100) + "...");

  if (!message && !html) {
    throw new Error("E-mail sem conteúdo: informe 'message' ou 'html'");
  }

  try {
    await transporter.sendMail({
      from: `"AcolhaPatas" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject || "AcolhaPatas - Notificação",
      text: message || undefined,
      html: html || undefined
    });
    console.log("✅ E-mail enviado com sucesso para:", email);
  } catch (err) {
    console.error("❌ Erro no sendMail:", err.message);
    throw err;
  }
}

