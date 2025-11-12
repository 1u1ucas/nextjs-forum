import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn("RESEND_API_KEY is not set. Email sending will be disabled.");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const DEFAULT_FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL || "Forum <no-reply@example.com>";


