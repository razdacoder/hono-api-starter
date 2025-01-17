import { sendEmail } from "@/lib/email";
import PasswordResetEmail from "@/templates/password-reset-mail";

interface PasswordResetEmailProps {
  email: string;
  otp: string;
  name: string;
}

async function sendPasswordResetEmail({
  email,
  otp,
  name,
}: PasswordResetEmailProps) {
  const html = await PasswordResetEmail({ otp, name }).toString();
  await sendEmail({
    from: "noreply@example.com",
    to: email,
    subject: "Reset your password",
    html,
  });
}

export default sendPasswordResetEmail;
