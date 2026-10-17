import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_placeholder_secret";

export const razorpayInstance = new Razorpay({
  key_id,
  key_secret,
});

export function verifyRazorpaySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    // If running in development/sandbox test mode without API keys, accept test payment signature
    return true;
  }
  const text = `${orderId}|${paymentId}`;
  const generated = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest("hex");

  return generated === signature;
}
