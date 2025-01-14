import crypto from 'crypto';
import {connection as redis} from "@/lib/queue.js"


function generateOTP(length: number = 6): string {
  return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
}

export async function generateOrReuseOTP(userId: string, purpose: "activation" | "reset-password"): Promise<string> {
  const key = `otp:${userId}:${purpose}`;

  // Check if OTP exists and is valid
  const existingOtp = await redis.get(key);
  if (existingOtp) {
    return existingOtp; // OTP exists, reuse it
  }

  // Generate a new OTP
  const otp = generateOTP();

  // Store OTP in Redis with an expiration time (10 minutes)
  await redis.set(key, otp, 'EX', 600); // 600 seconds = 10 minutes

  return otp;
}

export async function validateOTP(userId: string, otp: string, purpose: "activation" | "reset-password"): Promise<boolean> {
  const key = `otp:${userId}:${purpose}`;
  const storedOtp = await redis.get(key);

  // Check if OTP matches
  return storedOtp === otp;
}