import Razorpay from "razorpay";
import nodemailer from "nodemailer";
import TweetModel from "../models/tweet.model.js";

export const SUBSCRIPTION_PLANS = {
  Free: {
    name: "Free",
    price: 0,
    tweetLimit: 1,
  },
  Bronze: {
    name: "Bronze",
    price: 100,
    tweetLimit: 3,
  },
  Silver: {
    name: "Silver",
    price: 300,
    tweetLimit: 5,
  },
  Gold: {
    name: "Gold",
    price: 1000,
    tweetLimit: Infinity,
  },
};

export function getPlanDetails(planName = "Free") {
  return SUBSCRIPTION_PLANS[planName] || SUBSCRIPTION_PLANS.Free;
}

export function isValidPlanName(planName) {
  return Object.prototype.hasOwnProperty.call(SUBSCRIPTION_PLANS, planName);
}

export function getIndianTimeData() {
  const indiaDate = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );

  return {
    indiaDate,
    hour: indiaDate.getHours(),
    minutes: indiaDate.getMinutes(),
  };
}

export function isPaymentWindowOpen() {
  const { hour, minutes } = getIndianTimeData();

  return (hour === 10 && minutes >= 0) || (hour === 11 && minutes === 0);
}

export function getCurrentPlan(user) {
  if (!user?.subscriptionPlan || user.subscriptionPlan === "Free") {
    return SUBSCRIPTION_PLANS.Free;
  }

  if (!user.subscriptionExpiresAt) {
    return getPlanDetails(user.subscriptionPlan);
  }

  const isExpired = new Date(user.subscriptionExpiresAt) < new Date();
  if (isExpired) {
    return SUBSCRIPTION_PLANS.Free;
  }

  return getPlanDetails(user.subscriptionPlan);
}

export function hasActivePaidSubscription(user) {
  const currentPlan = getCurrentPlan(user);
  return currentPlan.name !== "Free";
}

export async function getTweetUsage(user) {
  const query = { author: user._id };

  if (
    user.subscriptionDate &&
    user.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date()
  ) {
    query.timestamp = {
      $gte: new Date(user.subscriptionDate),
      $lte: new Date(user.subscriptionExpiresAt),
    };
  }

  const usedTweets = await TweetModel.countDocuments(query);
  return usedTweets;
}

export async function getSubscriptionStatus(user) {
  const currentPlan = getCurrentPlan(user);
  const usedTweets = await getTweetUsage(user);
  const remainingTweets =
    currentPlan.tweetLimit === Infinity
      ? "Unlimited"
      : Math.max(currentPlan.tweetLimit - usedTweets, 0);

  return {
    currentPlan: currentPlan.name,
    price: currentPlan.price,
    tweetLimit:
      currentPlan.tweetLimit === Infinity
        ? "Unlimited"
        : currentPlan.tweetLimit,
    usedTweets,
    remainingTweets,
    paymentWindowOpen: isPaymentWindowOpen(),
    subscriptionExpiresAt: user.subscriptionExpiresAt,
  };
}

export function createRazorpayClient() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

export async function sendSubscriptionEmail({
  email,
  userName,
  planName,
  amount,
  paymentId,
  subscribedAt,
  expiresAt,
}) {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    return false;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const invoiceLines = [
    `Hello ${userName || "User"},`,
    "",
    "Your subscription payment was successful.",
    "",
    `Plan: ${planName}`,
    `Amount: Rs. ${amount}`,
    `Payment Id: ${paymentId}`,
    `Subscribed On: ${new Date(subscribedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
    `Valid Until: ${new Date(expiresAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
    "",
    "Invoice Summary:",
    `1 x ${planName} monthly plan = Rs. ${amount}`,
    "",
    "Thank you for subscribing.",
  ];

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: `${planName} Subscription Invoice`,
    text: invoiceLines.join("\n"),
  });

  return true;
}
