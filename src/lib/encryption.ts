import crypto from 'crypto';
import {connection as redis} from "@/lib/queue.js"


function generateOTP(length: number = 6): string {
  return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
}

export async function generateOrReuseOTP(userId: string): Promise<string> {
  const key = `otp:${userId}`;

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

export async function validateOTP(userId: string, otp: string): Promise<boolean> {
  const key = `otp:${userId}`;
  const storedOtp = await redis.get(key);

  // Check if OTP matches
  return storedOtp === otp;
}