import { html } from "hono/html";

interface Props {
  name: string;
}

function WelcomeEmail({ name }: Props) {
  return html`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome Email Hono API Stater</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333333;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background-color: #4caf50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
          }
          .content {
            padding: 20px;
          }
          .content h2 {
            color: #4caf50;
          }
          .content p {
            line-height: 1.6;
            margin: 10px 0;
          }
          .cta-button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #4caf50;
            color: #ffffff;
            text-decoration: none;
            font-weight: bold;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding: 10px;
            background-color: #f4f4f4;
            color: #666666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <!-- Header -->
          <div class="header">
            <h1>Welcome to Hono API Stater!</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <h2>Hello, ${name}!</h2>
            <p>
              We're thrilled to have you join us. You're now
              part of a growing community where you'll enjoy 
            </p>
           
            <p>
              If you have any questions or need assistance, feel free to reply
              to this email or visit our
              <a href="https://github.com/razdacoder/hono-api-starter">Support page</a>.
            </p>
            <p>Welcome aboard, and let's make great things happen together!</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <p>© 2025 Hono API Stater. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export default WelcomeEmail;
