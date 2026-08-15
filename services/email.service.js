const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API);
const FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
const APP_NAME = "Sell Me A Pen";

// Names come from user input and land inside HTML — escape or a name like
// "<b>Phyo" silently breaks the layout.
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function welcomeTemplate(user) {
  const name = escapeHtml(user.name);
  const url = process.env.CLIENT_URL || "http://localhost:5173";

  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f4f4f1;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Your account is ready — start buying and selling on campus.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f1;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                 style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;
                        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <tr>
              <td style="background:#1d9e75;padding:20px 32px;">
                <span style="color:#ffffff;font-size:16px;font-weight:600;letter-spacing:0.2px;">
                  ${APP_NAME}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px;font-size:22px;font-weight:600;color:#1a1a1a;">
                  Welcome, ${name}
                </h1>
                <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#4a4a4a;">
                  Your account is ready. You can now list textbooks, furniture, and
                  anything else you're done with — and message other students directly
                  about theirs.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="background:#1d9e75;border-radius:6px;">
                      <a href="${url}"
                         style="display:inline-block;padding:12px 24px;font-size:15px;
                                font-weight:500;color:#ffffff;text-decoration:none;">
                        Browse listings
                      </a>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                       style="border-top:1px solid #e8e8e4;padding-top:20px;">
                  <tr>
                    <td>
                      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#1a1a1a;">
                        Getting started
                      </p>
                      <p style="margin:0 0 6px;font-size:14px;line-height:1.6;color:#4a4a4a;">
                        1. Post your first item with a photo and price
                      </p>
                      <p style="margin:0 0 6px;font-size:14px;line-height:1.6;color:#4a4a4a;">
                        2. Message sellers to agree on a price
                      </p>
                      <p style="margin:0;font-size:14px;line-height:1.6;color:#4a4a4a;">
                        3. Pay online, or meet on campus and pay in person
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background:#fafaf8;border-top:1px solid #e8e8e4;">
                <p style="margin:0 0 6px;font-size:12px;line-height:1.5;color:#8a8a85;">
                  Meet in a public spot on campus during the day — the library entrance
                  or student center are good choices.
                </p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:#8a8a85;">
                  If you didn't create this account, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function welcomeText(user) {
  const url = process.env.CLIENT_URL || "http://localhost:5173";
  return [
    `Hi , ${user.name}`,
    ``,
    `Your account is ready. You can now list items and message other students.`,
    ``,
    `Getting started:`,
    `1. Post your first item with a photo and price`,
    `2. Message sellers to agree on a price`,
    `3. Pay online, or meet on campus and pay in person`,
    ``,
    `Browse listings: ${url}`,
    ``,
    `Meet in a public spot on campus during the day.`,
    `If you didn't create this account, you can ignore this email.`,
  ].join("\n");
}

async function sendWelcomeEmail(user) {
  const { data, error } = await resend.emails.send({
    from: `${APP_NAME} <${FROM}>`,
    to: user.email,
    subject: `Welcome to ${APP_NAME}`,
    html: welcomeTemplate(user),
    text: welcomeText(user),
  });

  if (error) throw new Error(error.message);
  return data;
}

module.exports = { sendWelcomeEmail };
