import FormData from "form-data";
import Mailgun from "mailgun.js";
import nodemailer from "nodemailer";
import { logger } from "../logger";

type SentEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

const testOutbox: SentEmail[] = [];

/** EU default; US accounts use https://api.mailgun.net/ */
const DEFAULT_MAILGUN_URL = "https://api.eu.mailgun.net/";

function mailgunConfig() {
  const key = process.env.MAILGUN_API_KEY?.trim();
  const domain = process.env.MAILGUN_DOMAIN?.trim();
  const from =
    process.env.MAILGUN_FROM?.trim() || process.env.SMTP_FROM?.trim();
  const url = process.env.MAILGUN_URL?.trim() || DEFAULT_MAILGUN_URL;

  if (!key || !domain || !from) return null;
  return { key, domain, from, url };
}

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

async function sendViaMailgun(
  to: string,
  subject: string,
  text: string,
  html: string | undefined,
  cfg: NonNullable<ReturnType<typeof mailgunConfig>>
): Promise<void> {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: cfg.key,
    url: cfg.url,
  });

  await mg.messages.create(cfg.domain, {
    from: cfg.from,
    to: [to],
    subject,
    text,
    ...(html ? { html } : {}),
  });
}

export const EmailService = {
  async send(to: string, subject: string, text: string, html?: string): Promise<void> {
    if (process.env.NODE_ENV === "test") {
      testOutbox.push({ to, subject, text, html });
      return;
    }

    const mgCfg = mailgunConfig();
    if (mgCfg) {
      try {
        await sendViaMailgun(to, subject, text, html, mgCfg);
        return;
      } catch (err) {
        logger.error({ err }, "Mailgun send failed");
        throw err;
      }
    }

    const cfg = smtpConfig();
    if (cfg) {
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
      return;
    }

    if (process.env.NODE_ENV === "production") {
      throw new Error("Email is not configured (set Mailgun or SMTP env vars)");
    }
  },
};

export function __clearSentEmailsForTests(): void {
  testOutbox.length = 0;
}

export function __getSentEmailsForTests(): SentEmail[] {
  return [...testOutbox];
}
