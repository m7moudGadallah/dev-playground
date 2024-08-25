import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env?.MAIL_SERVER_HOST as string,
  port: Number(process.env?.MAIL_SERVER_PORT as string),
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
});

export interface MailData {
  to: string;
  subject: string;
  body: string;
  format: 'html' | 'text';
}

export async function sendEmail(mailData: MailData) {
  await transporter.sendMail({
    from: 'demo@example.com',
    to: mailData.to,
    subject: mailData.subject,
    text: mailData.format === 'text' ? mailData.body : undefined,
    html:
      mailData.format === 'html'
        ? `<h4 style="color: red;">${mailData.body}</h4>`
        : undefined,
  });
}
