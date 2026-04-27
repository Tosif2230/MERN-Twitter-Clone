import UserModel from "../models/user.model.js";
import crypto from "crypto";
import {
  createRazorpayClient,
  getPlanDetails,
  getSubscriptionStatus,
  hasActivePaidSubscription,
  isValidPlanName,
  isPaymentWindowOpen,
  sendSubscriptionEmail,
} from "../services/subscription.service.js";

export async function createSubscriptionOrder(req, res) {
  try {
    const { userId, planName } = req.body;

    if (!userId || !planName) {
      return res.status(400).json({ message: "User id and plan name are required" });
    }

    if (!isValidPlanName(planName)) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    if (!isPaymentWindowOpen()) {
      return res.status(403).json({
        message: "Payments are not allowed at this time.",
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const plan = getPlanDetails(planName);

    if (plan.name === "Free") {
      return res.status(400).json({
        message: "Free plan does not require payment",
      });
    }

    const razorpay = createRazorpayClient();

    if (!razorpay) {
      return res.status(500).json({
        message: "Razorpay is not configured properly",
      });
    }

    const receipt = `sub_${userId.toString().slice(-10)}_${Date.now()
      .toString()
      .slice(-8)}`;

    const order = await razorpay.orders.create({
      amount: plan.price * 100,
      currency: "INR",
      receipt,
    });

    return res.status(200).json({
      key: process.env.RAZORPAY_KEY_ID,
      order,
    });
  } catch (error) {
    console.error("Create Subscription Error:", error);
    return res.status(500).json({
      message: error?.error?.description || error.message || "Subscription failed",
    });
  }
}

export async function confirmSubscription(req, res) {
  try {
    const {
      userId,
      planName,
      paymentId,
      orderId,
      razorpaySignature,
    } = req.body;

    if (!userId || !planName) {
      return res.status(400).json({ message: "User id and plan name are required" });
    }

    if (!isValidPlanName(planName)) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const plan = getPlanDetails(planName);

    if (plan.name === "Free" && hasActivePaidSubscription(user)) {
      return res.status(400).json({
        message:
          "You already have an active paid subscription. Free plan cannot replace it before expiry.",
      });
    }

    const subscribedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    if (plan.name !== "Free") {
      if (!paymentId || !orderId || !razorpaySignature) {
        return res.status(400).json({ message: "Missing payment details" });
      }

      if (user.subscriptionPaymentId === paymentId) {
        return res.status(400).json({
          message: "Payment already processed",
        });
      }

      const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(orderId + "|" + paymentId)
        .digest("hex");

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }
    }

    user.subscriptionPlan = plan.name;
    user.subscriptionPrice = plan.price;
    user.subscriptionOrderId = orderId || "";
    user.subscriptionPaymentId = paymentId || "";
    user.subscriptionDate = subscribedAt;
    user.subscriptionExpiresAt = expiresAt;

    await user.save();

    // Send response immediately so UI can update plan without waiting on email I/O.
    const responsePayload = {
      message: "Subscription activated successfully",
      emailSent: false,
      subscription: {
        currentPlan: plan.name,
        price: plan.price,
        subscriptionDate: subscribedAt,
        subscriptionExpiresAt: expiresAt,
      },
    };

    res.status(200).json(responsePayload);

    // Fire-and-forget invoice email after response.
    void (async () => {
      try {
        await sendSubscriptionEmail({
          email: user.email,
          userName: user.displayName,
          planName: plan.name,
          amount: plan.price,
          paymentId,
          subscribedAt,
          expiresAt,
        });
      } catch (err) {
        console.error("Email failed:", err.message);
      }
    });

    return;
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

export async function getUserSubscriptionStatus(req, res) {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const status = await getSubscriptionStatus(user);
    return res.status(200).json(status);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
