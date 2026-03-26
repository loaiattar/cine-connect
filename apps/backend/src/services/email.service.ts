import nodemailer from "nodemailer";

type SentEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const testOutbox: SentEmail[] = [];

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const portRaw = process.env.SMTP_PORT?.trim();
  const port = portRaw && /^\d+$/.test(portRaw) ? parseInt(portRaw, 10) : 587;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass || !from) return null;
  return { host, user, pass, from, port, secure };
}

export const EmailService = {
  async send(to: string, subject: string, text: string, html?: string): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      testOutbox.push({ to, subject, text, html });
      return;
    }

    const cfg = smtpConfig();
    if (!cfg) {
      // Non-fatal in development; production should define SMTP_* vars.
      if (process.env.NODE_ENV !== "production") {
        return;
      }
      throw new Error("SMTP is not configured");
    }

    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass,
      },
    });

    await transporter.sendMail({
      from: cfg.from,
      to,
      subject,
      text,
      html,
    });
  },
};

export function __clearSentEmailsForTests(): void {
  testOutbox.length = 0;
}

export function __getSentEmailsForTests(): SentEmail[] {
  return [...testOutbox];
}

