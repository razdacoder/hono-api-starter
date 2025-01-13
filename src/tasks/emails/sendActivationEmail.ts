import { sendEmail } from "@/lib/email.js";
import ActivationEmail from "@/templates/activation-email.js";

type ActivationEmailProps = {
    email: string
    otp: string
}

const sendActivationEmail = async ({email, otp}: ActivationEmailProps) => {
    const html = await ActivationEmail({otp}).toString()
    await sendEmail({
        from: "noreply@example.com",
        to: email,
        subject: "Activate your account",
        html
    })
};

export default sendActivationEmail;