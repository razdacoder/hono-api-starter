import { sendEmail } from "@/lib/email.js";
import PasswordResetEmail from "@/templates/password-reset-mail";

type PasswordResetEmailProps = {
  email: string;
  otp: string;
  name: string
};

const sendPasswordResetEmail = async ({ email, otp, name }: PasswordResetEmailProps) => {
  const html = await PasswordResetEmail({ otp, name }).toString();
  await sendEmail({
    from: "noreply@example.com",
    to: email,
    subject: "Reset your password",
    html,
  });
};

export default sendPasswordResetEmail;
