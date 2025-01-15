import { sendEmail } from "@/lib/email";
import WelcomeEmail from "@/templates/welcome-email";

async function sendWelcomeEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const html = await WelcomeEmail({ name }).toString();
  await sendEmail({
    from: "noreply@example.com",
    to: email,
    subject: "Welcome to Hono API Starter",
    html,
  });
}

export default sendWelcomeEmail;
