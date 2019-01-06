import { createTransport, TransportOptions } from "nodemailer";

const transporter = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_USERPASS,
  },
} as TransportOptions);
export function sendMail(mailOptions) {
  return transporter.sendMail(mailOptions);
}
