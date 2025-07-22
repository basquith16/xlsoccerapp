import nodemailer from 'nodemailer';
import { convert } from 'html-to-text';
import mg from 'nodemailer-mailgun-transport';
export default class Email {
    to;
    firstName;
    url;
    from;
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `Brian Asquith <${process.env.EMAIL_FROM}>`;
    }
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            // MailGun
            return nodemailer.createTransport(mg({
                auth: {
                    api_key: process.env.MAILGUN_API,
                    domain: process.env.MAILGUN_DOMAIN
                },
                secure: false
            }));
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            logger: true,
            secure: false,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            },
            tls: {
                ciphers: 'SSLv3'
            }
        });
    }
    // Send the actual email
    async send(subject, htmlContent) {
        // 2) Define email options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html: htmlContent,
            text: convert(htmlContent)
        };
        // 3) Create a transport and send email
        await this.newTransport().sendMail(mailOptions);
    }
    async sendWelcome() {
        try {
            const htmlContent = `
        <h1>Welcome to the XL Family!</h1>
        <p>Hi ${this.firstName},</p>
        <p>Welcome to XL Soccer! We're excited to have you join our community.</p>
        <p>You can now book sessions and manage your account.</p>
        <p>Best regards,<br>The XL Team</p>
      `;
            await this.send('Welcome to the XL Family!', htmlContent);
        }
        catch (err) {
            console.log(err);
        }
    }
    async sendPasswordReset() {
        const htmlContent = `
      <h1>Password Reset</h1>
      <p>Hi ${this.firstName},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${this.url}">Reset Password</a></p>
      <p>This link is valid for only 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>Best regards,<br>The XL Team</p>
    `;
        await this.send('Your password reset token (valid for only 10 minutes)', htmlContent);
    }
}
