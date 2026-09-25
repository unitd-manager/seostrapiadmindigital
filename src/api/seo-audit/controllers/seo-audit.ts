const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;

export default {
  async submit(ctx) {
    const fields = ctx.request.body || {};
    const entries = Object.entries(fields).filter(([, v]) =>
      String(v ?? "").trim()
    );

    if (entries.length === 0) {
      return ctx.badRequest("No form data received.");
    }

    // Best-effort: use an "email"-named field as the reply-to if present.
    const emailEntry = entries.find(
      ([k, v]) =>
        k.toLowerCase().includes("email") &&
        emailPattern.test(String(v).toLowerCase())
    );
    const replyTo = emailEntry ? String(emailEntry[1]) : undefined;

    const textBody = entries.map(([k, v]) => `${k}: ${v}`).join("\n");
    const htmlBody = entries
      .map(([k, v]) => `<p><strong>${k}:</strong> ${v}</p>`)
      .join("\n");

    try {
      await strapi.plugins["email"].services.email.send({
        to: process.env.CONTACT_RECEIVER_EMAIL,
        replyTo,
        subject: "New SEO Audit Request",
        text: textBody,
        html: `<h2>New SEO Audit Request</h2>${htmlBody}`,
      });

      ctx.body = { ok: true, message: "SEO Audit Request Sent Successfully!" };
    } catch (err) {
      strapi.log.error("SEO audit email failed:", err);
      ctx.status = 500;
      ctx.body = { ok: false, message: "Failed to send request." };
    }
  },
};