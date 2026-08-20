import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),

      // Brevo SMTP on port 587 uses STARTTLS
      secure: false,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    firstName: string,
    otp: string,
  ) {
    try {
      await this.transporter.sendMail({
        from: `"SaaS Platform" <${process.env.SENDER_EMAIL}>`,
        to: email,

        subject: 'Verify your email address',

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              background-color: #ffffff;
            "
          >
            <h2>Hello ${firstName},</h2>

            <p>
              Thank you for creating an account
              with our SaaS platform.
            </p>

            <p>
              Please use the verification code below
              to verify your email address:
            </p>

            <div
              style="
                margin: 30px 0;
                padding: 20px;
                text-align: center;
                background-color: #f5f5f5;
                border-radius: 8px;
              "
            >
              <h1
                style="
                  margin: 0;
                  font-size: 32px;
                  letter-spacing: 8px;
                "
              >
                ${otp}
              </h1>
            </div>

            <p>
              This code will expire in
              <strong>10 minutes</strong>.
            </p>

            <p>
              If you did not create this account,
              you can safely ignore this email.
            </p>

            <hr />

            <p
              style="
                font-size: 12px;
                color: #777;
              "
            >
              This is an automated email.
              Please do not reply.
            </p>
          </div>
        `,
      });

      console.log(
        `Verification email sent to ${email}`,
      );
    } catch (error) {
      console.error(
        'Failed to send verification email:',
        error,
      );

      throw new InternalServerErrorException(
        'Unable to send verification email',
      );
    }
  }
}