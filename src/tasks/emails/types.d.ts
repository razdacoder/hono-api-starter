// emailJobTypes.ts
interface EmailJobData {
  SendWelcomeEmail: { email: string; name: string };
  SendActivationEmail: { email: string; otp: string };
  SendPasswordResetEmail: { email: string; otp: string; name: string };
}
