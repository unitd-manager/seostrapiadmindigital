/**
 * Lead lifecycle hooks.
 *
 * Fires whenever a new Lead (contact form submission) is
 * created via POST /api/leads, and emails a notification
 * to the business inbox using the SMTP provider configured
 * in config/plugins.ts.
 */

export default {
  async afterCreate(event: any) {
    const { result } = event;

    const receiver = process.env.CONTACT_RECEIVER_EMAIL;

    if (!receiver) {
      strapi.log.warn(
        "Lead afterCreate: CONTACT_RECEIVER_EMAIL is not set, skipping email notification."
      );
      return;
    }

    const name = result?.name || "Unknown";
    const email = result?.email || "Not provided";
    const subject = result?.subject || "No subject";
    const message = result?.message || "";

    try {
      await strapi.plugins["email"].services.email.send({
        to: receiver,
        replyTo: email,
        subject: `New contact form submission: ${subject}`,
        text: [
          "You have a new message from the website contact form.",
          "",
          `Name: ${name}`,
          `Email: ${email}`,
          `Subject: ${subject}`,
          "",
          "Message:",
          message,
        ].join("\n"),
        html: `
          <p>You have a new message from the website contact form.</p>
          <p>
            <strong>Name:</strong> ${escapeHtml(name)}<br/>
            <strong>Email:</strong> ${escapeHtml(email)}<br/>
            <strong>Subject:</strong> ${escapeHtml(subject)}
          </p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
        `,
      });

      strapi.log.info(
        `Lead afterCreate: notification email sent to ${receiver} for lead #${result?.id}`
      );
    } catch (err) {
      // Never let an email failure break the API response for the
      // person submitting the form — just log it.
      strapi.log.error(
        "Lead afterCreate: failed to send notification email",
        err
      );
    }
  },
};

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}