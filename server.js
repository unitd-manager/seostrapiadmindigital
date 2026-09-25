require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

// Field names/labels are defined in Strapi, so the backend stays generic:
// it just takes whatever key/value pairs the form submits.
app.post("/api/seo-audit", async (req, res) => {
  try {
    const fields = req.body || {};
    const entries = Object.entries(fields).filter(([, v]) => String(v ?? "").trim());

    if (entries.length === 0) {
      return res.status(400).json({ ok: false, message: "No form data received." });
    }

    // Best-effort: use an "email"-named field as the reply-to if present.
    const emailEntry = entries.find(
      ([k, v]) => k.toLowerCase().includes("email") && emailPattern.test(String(v).toLowerCase())
    );
    const replyTo = emailEntry ? emailEntry[1] : process.env.SMTP_REPLY_TO;

    const textBody = entries.map(([k, v]) => `${k}: ${v}`).join("\n");
    const htmlBody = entries
      .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
      .join("\n");

    await transporter.sendMail({
      from: `"SEO Audit Form" <${process.env.SMTP_FROM}>`,
      replyTo,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      subject: "New SEO Audit Request",
      text: textBody,
      html: `<h2>New SEO Audit Request</h2>${htmlBody}`,
    });

    res.json({ ok: true, message: "SEO Audit Request Sent Successfully!" });
  } catch (err) {
    console.error("SMTP send failed:", err);
    res.status(500).json({ ok: false, message: "Failed to send request." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`SEO audit mailer running on port ${PORT}`));