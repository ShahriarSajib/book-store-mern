/**
 * utils/email.js — nodemailer transport + templated emails.
 *
 * In development (no SMTP credentials) emails are "sent" to a dev transport
 * that prints the rendered message to the server console and returns a
 * preview URL. The auth service surfaces this preview to the API client so
 * email flows can be tested without a real SMTP provider.
 */
const nodemailer = require("nodemailer");
const env = require("../config/env");

function buildTransport() {
  if (env.MAIL_USER && env.MAIL_PASS) {
    return nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: Number(env.MAIL_PORT) === 465,
      auth: { user: env.MAIL_USER, pass: env.MAIL_PASS },
    });
  }
  // Dev fallback: dump to console.
  return {
    sendMail: async ({ to, subject, html }) => {
      // eslint-disable-next-line no-console
      console.log("\n=====================================================");
      console.log("[mail:dev] To:", to);
      console.log("[mail:dev] Subject:", subject);
      console.log("[mail:dev] --- body (html) ---");
      console.log(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
      console.log("=====================================================\n");
      return { messageId: `dev-${Date.now()}` };
    },
  };
}

const transport = buildTransport();

async function sendEmail({ to, subject, html, text }) {
  const info = await transport.sendMail({
    from: env.MAIL_FROM,
    to,
    subject,
    html,
    text,
  });
  return info;
}

function verificationEmail(name, url) {
  return {
    subject: "Verify your email — AI Bookstore",
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px">
      <h2 style="color:#4f46e5">Verify your email</h2>
      <p>Hi ${name || "there"},</p>
      <p>Thanks for creating an account at the AI Bookstore. Please confirm your email address by clicking the button below:</p>
      <p style="text-align:center;margin:28px 0">
        <a href="${url}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Verify email</a>
      </p>
      <p style="color:#777;font-size:12px">This link expires in 24 hours. If you didn't request this, you can safely ignore this email.</p>
    </div>`,
  };
}

function passwordResetEmail(name, url) {
  return {
    subject: "Reset your password — AI Bookstore",
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px">
      <h2 style="color:#4f46e5">Reset your password</h2>
      <p>Hi ${name || "there"},</p>
      <p>We received a request to reset your password. Click below to choose a new one:</p>
      <p style="text-align:center;margin:28px 0">
        <a href="${url}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Reset password</a>
      </p>
      <p style="color:#777;font-size:12px">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
    </div>`,
  };
}

module.exports = {
  sendEmail,
  verificationEmail,
  passwordResetEmail,
};
