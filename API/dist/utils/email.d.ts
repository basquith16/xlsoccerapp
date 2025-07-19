export default class Email {
    constructor(user: any, url: any);
    to: any;
    firstName: any;
    url: any;
    from: string;
    newTransport(): nodemailer.Transporter<import("nodemailer/lib/smtp-pool").SentMessageInfo, import("nodemailer/lib/smtp-pool").Options>;
    send(subject: any, htmlContent: any): Promise<void>;
    sendWelcome(): Promise<void>;
    sendPasswordReset(): Promise<void>;
}
import nodemailer from 'nodemailer';
//# sourceMappingURL=email.d.ts.map