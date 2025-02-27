import { html } from "hono/html";

interface Props {
  otp: string;
}

function ActivationEmail({ otp }: Props) {
  return html`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Activate Your Account</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #dddddd;
            border-radius: 8px;
            overflow: hidden;
          }
          .email-header {
            background: #007bff;
            color: #ffffff;
            padding: 20px;
            text-align: center;
            font-size: 24px;
          }
          .email-body {
            padding: 20px;
            line-height: 1.6;
          }
          .otp-box {
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            background-color: #f4f4f4;
            border: 1px dashed #007bff;
            padding: 15px;
            margin: 20px 0;
            color: #007bff;
          }
          .email-footer {
            background: #f4f4f4;
            padding: 10px;
            text-align: center;
            font-size: 14px;
            color: #777;
          }
          a {
            color: #007bff;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">Activate Your Account</div>
          <div class="email-body">
            <p>Hello,</p>
            <p>
              Thank you for signing up! To activate your account, please use the
              following One-Time Password (OTP):
            </p>
            <div class="otp-box">${otp}</div>
            <p>
              The OTP is valid for the next 10 minutes. If you didn't request
              this, please ignore this email.
            </p>
            <p>
              If you have any issues, feel free to
              <a href="mailto:support@example.com">contact our support team</a>.
            </p>
          </div>
          <div class="email-footer">
            &copy; 2025 Hono API Stater. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;
}

export default ActivationEmail;
