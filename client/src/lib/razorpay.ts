declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  amount: number;
  currency?: string;
  rideId?: string;
  riderName: string;
  riderEmail: string;
  riderPhone?: string;
  onSuccess: (paymentId: string) => void;
  onFailure?: (error: any) => void;
}

export async function processRazorpayPayment(options: PaymentOptions) {
  try {
    // 1. Request order from backend
    const res = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: options.amount,
        currency: options.currency || "INR",
        rideId: options.rideId,
      }),
    });

    const orderData = await res.json();

    if (!orderData.success) {
      throw new Error(orderData.error || "Failed to initiate payment");
    }

    // 2. If Razorpay SDK is loaded and we have a valid key, open real popup
    if (window.Razorpay && orderData.key && !orderData.key.includes("placeholder")) {
      const rzp = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Uber",
        description: `Ride Fare Payment #${options.rideId || "CAB"}`,
        order_id: orderData.orderId,
        prefill: {
          name: options.riderName,
          email: options.riderEmail,
          contact: options.riderPhone || "+919876543210",
        },
        theme: {
          color: "#000000",
        },
        handler: async function (response: any) {
          // Verify on backend
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              rideId: options.rideId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            options.onSuccess(response.razorpay_payment_id);
          } else {
            alert("Payment signature verification failed");
          }
        },
      });

      rzp.on("payment.failed", function (response: any) {
        if (options.onFailure) options.onFailure(response.error);
        else alert(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();
    } else {
      // 3. Simulated Razorpay Checkout Modal (Sandbox demonstration)
      const confirmed = window.confirm(
        `💳 [Razorpay Test Mode]\n\nMerchant: Uber Ride Payments\nAmount: ₹${options.amount} ${options.currency || "INR"}\nRide ID: ${options.rideId || "NEW"}\n\nClick OK to simulate successful Razorpay payment authorization.`
      );

      if (confirmed) {
        const testPaymentId = `pay_rzp_test_${Date.now()}`;
        // Record test payment on server
        await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: testPaymentId,
            razorpaySignature: "test_verified_signature",
            rideId: options.rideId,
          }),
        });
        options.onSuccess(testPaymentId);
      } else {
        if (options.onFailure) options.onFailure({ description: "Payment cancelled by user" });
      }
    }
  } catch (error: any) {
    console.error("Razorpay error:", error);
    if (options.onFailure) options.onFailure(error);
    else alert(`Payment Error: ${error.message}`);
  }
}
