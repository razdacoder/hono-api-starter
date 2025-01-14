import WelcomeEmail from "@/templates/welcome-email";
import { sendEmail } from "@/lib/email";

const sendWelcomeEmail = async ({
  name,
  email,
}: {
  name: string;
  email: string;
}) => {
  const html = await WelcomeEmail({ name }).toString();
  await sendEmail({
    from: "noreply@example.com",
    to: email,
    subject: "Welcome to Hono API Starter",
    html,
  });
};

export default sendWelcomeEmail;
