import { html } from "hono/html";

interface Props {
  name: string;
  otp: string;
}

function PasswordResetEmail({ name, otp }: Props) {
  return html`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #007bff;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
          }
          .content {
            padding: 20px;
          }
          .content h2 {
            color: #007bff;
            font-size: 20px;
          }
          .content p {
            line-height: 1.6;
            margin: 10px 0;
          }
          .otp-code {
            display: block;
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            text-align: center;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 10px;
            background-color: #f4f4f4;
            color: #666666;
            font-size: 12px;
          }
          .footer a {
            color: #007bff;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <h2>Hello, ${name}</h2>
            <p>
              You recently requested to reset your password for your account on
              Hono API Starter.
            </p>
            <p>
              Use the following One-Time Password (OTP) to reset your password:
            </p>
            <div class="otp-code">${otp}</div>
            <p>
              This OTP is valid for the next 10 minutes. Please do not share
              this code with anyone.
            </p>
            <p>
              If you did not request a password reset, please ignore this email
              or contact our support team.
            </p>
            <p>Thank you</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>© 2025 Hono API starter. All rights reserved.</p>
            <p>
              If you need further assistance, visit our
              <a href="https://github.com/razdacoder/hono-api-starter">Support Page</a>.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export default PasswordResetEmail;
