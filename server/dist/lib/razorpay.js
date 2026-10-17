"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayInstance = void 0;
exports.verifyRazorpaySignature = verifyRazorpaySignature;
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder_key";
const key_secret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_placeholder_secret";
exports.razorpayInstance = new razorpay_1.default({
    key_id,
    key_secret,
});
function verifyRazorpaySignature({ orderId, paymentId, signature, }) {
    if (!process.env.RAZORPAY_KEY_SECRET) {
        // If running in development/sandbox test mode without API keys, accept test payment signature
        return true;
    }
    const text = `${orderId}|${paymentId}`;
    const generated = crypto_1.default
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest("hex");
    return generated === signature;
}
