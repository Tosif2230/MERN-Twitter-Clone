"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Clock,
  CreditCard,
  Crown,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../lib/axiosInstance";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

type PlanType = {
  name: string;
  price: number;
  tweets: string;
  description: string;
  buttonText: string;
};

type StatusType = {
  currentPlan: string;
  price: number;
  tweetLimit: number | string;
  usedTweets: number;
  remainingTweets: number | string;
  paymentWindowOpen: boolean;
  subscriptionExpiresAt?: string;
};

const tweetPlans: PlanType[] = [
  {
    name: "Free",
    price: 0,
    tweets: "1 tweet",
    description: "Best for trying the platform.",
    buttonText: "Free",
  },
  {
    name: "Bronze",
    price: 100,
    tweets: "3 tweets",
    description: "A small upgrade for light posting.",
    buttonText: "Pay with Razorpay",
  },
  {
    name: "Silver",
    price: 300,
    tweets: "5 tweets",
    description: "A simple plan for regular updates.",
    buttonText: "Pay with Razorpay",
  },
  {
    name: "Gold",
    price: 1000,
    tweets: "Unlimited tweets",
    description: "Post without any tweet limit.",
    buttonText: "Pay with Razorpay",
  },
];

const Subscription = () => {
  const { user, refreshUser } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState("Free");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<StatusType | null>(null);

  const hasActivePaidPlan =
    !!status &&
    status.currentPlan !== "Free" &&
    !!status.subscriptionExpiresAt &&
    new Date(status.subscriptionExpiresAt) > new Date();

  const fetchSubscriptionStatus = async () => {
    if (!user?._id) return;

    try {
      const res = await axiosInstance.get(
        `/api/subscription/status/${user._id}`,
      );
      setStatus(res.data);
      setSelectedPlan(res.data.currentPlan || "Free");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const loadStatus = async () => {
      if (!user?._id) return;

      try {
        const res = await axiosInstance.get(
          `/api/subscription/status/${user._id}`,
        );
        setStatus(res.data);
        setSelectedPlan(res.data.currentPlan || "Free");
      } catch (error) {
        console.log(error);
      }
    };

    loadStatus();
  }, [user?._id]);

  useEffect(() => {
    if (window.Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const finishSubscription = async (
    planName: string,
    paymentId: string,
    orderId: string,
    razorpaySignature = "",
    emailSentMessage = "",
  ) => {
    const res = await axiosInstance.post("/api/subscription/confirm", {
      userId: user?._id,
      planName,
      paymentId,
      orderId,
      razorpaySignature,
    });

    await refreshUser();
    await fetchSubscriptionStatus();

    setSuccess(true);
    setMessage(
      emailSentMessage ||
        (res.data.emailSent
          ? `${planName} plan activated. Invoice details were sent to your email.`
          : `${planName} plan activated successfully.`),
    );
    toast.success(`${planName} plan activated`);
  };

  const handlePayment = async (plan: PlanType) => {
    if (!user?._id) {
      toast.error("Please login first");
      return;
    }

    setSelectedPlan(plan.name);
    setIsLoading(true);
    setMessage("");

    try {
      if (plan.name === "Free") {
        await finishSubscription("Free", "", "");
        return;
      }

      const orderRes = await axiosInstance.post("/api/subscription/order", {
        userId: user._id,
        planName: plan.name,
      });

      if (orderRes.data.demoMode || !window.Razorpay) {
        await finishSubscription(
          plan.name,
          `demo_payment_${Date.now()}`,
          orderRes.data.order.id,
          `demo_signature_${Date.now()}`,
          `${plan.name} plan activated in demo mode. Email will work after MAIL_USER and MAIL_PASS are added.`,
        );
        return;
      }

      const razorpay = new window.Razorpay({
        key: orderRes.data.key,
        amount: orderRes.data.order.amount,
        currency: orderRes.data.order.currency,
        name: "Twitter Clone",
        description: `${plan.name} monthly subscription`,
        order_id: orderRes.data.order.id,
        handler: async (response: any) => {
          await finishSubscription(
            plan.name,
            response.razorpay_payment_id,
            response.razorpay_order_id,
            response.razorpay_signature,
          );
        },
        prefill: {
          name: user.displayName,
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: "#1d9bf0",
        },
      });

      razorpay.open();
    } catch (error: any) {
      console.log("FULL ERROR:", error);
      console.log("BACKEND ERROR:", error.response?.data);

      const errorMessage =
        error.response?.data?.message || "Payment could not be completed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const paymentOpen = status?.paymentWindowOpen ?? false;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 z-10 border-b border-gray-800 bg-black px-3 py-4 sm:px-5">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold sm:text-xl">Subscription</h1>
            <p className="text-sm text-gray-400">
              Choose a plan to manage your tweet limit.
            </p>
          </div>
          <CreditCard className="h-6 w-6 shrink-0 text-blue-400" />
        </div>
      </div>

      <div className="border-b border-gray-800 px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-5xl space-y-3">
          {status && (
            <div className="flex justify-between rounded-lg border border-gray-800 bg-gray-950 p-4 text-sm text-gray-300">
              <p>
                Current plan:
                <span className="font-semibold text-white">
                  {status.currentPlan}
                </span>
              </p>
              <p>
                Tweet usage:
                <span className="font-semibold text-white">
                  {status.usedTweets} used
                  {status.tweetLimit === "Unlimited"
                    ? " / Unlimited"
                    : ` / ${status.tweetLimit}`}
                </span>
              </p>
              {status.subscriptionExpiresAt && (
                <p>
                  Expires on:{" "}
                  <span className="font-semibold text-white">
                    {new Date(status.subscriptionExpiresAt).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </p>
              )}
            </div>
          )}
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
            <div className="flex items-start gap-3">
              {paymentOpen ? (
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
              )}
              <div>
                <h2 className="text-sm font-semibold leading-6 sm:text-base">
                  Payments are allowed only from 10:00 AM to 11:00 AM IST.
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-3 py-5 sm:px-5 md:grid-cols-2">
        {tweetPlans.map((plan) => (
          <Card
            key={plan.name}
            onClick={() => setSelectedPlan(plan.name)}
            className={`flex min-h-64 cursor-pointer flex-col p-4 transition-all duration-200 sm:p-5 ${
              selectedPlan === plan.name
                ? "border-2 border-blue-500 bg-blue-500/10"
                : "border border-gray-800 bg-black hover:border-gray-600"
            }`}
          >
            <CardContent className="flex h-full flex-col p-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg font-bold text-white">
                    {plan.name}
                  </div>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>

                {plan.name !== "Free" && (
                  <Crown
                    className={`h-5 w-5 shrink-0 ${
                      plan.name === "Bronze"
                        ? "text-orange-500"
                        : plan.name === "Silver"
                          ? "text-gray-300"
                          : "text-yellow-400"
                    }`}
                  />
                )}
              </div>

              <div className="mt-5">
                <span className="text-2xl font-bold text-white sm:text-3xl">
                  Rs. {plan.price}
                </span>
                <span className="ml-1 whitespace-nowrap text-sm text-gray-400">
                  / month
                </span>
              </div>

              <div className="mt-4 flex items-start gap-2 text-sm text-gray-200">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <span>{plan.tweets} allowed</span>
              </div>

              <div className="mt-2 flex items-start gap-2 text-sm text-gray-200">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                <span>Invoice email after successful payment</span>
              </div>

              <Button
                className={`mt-auto w-full rounded-lg font-semibold transition-all ${
                  selectedPlan === plan.name
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePayment(plan);
                }}
                disabled={
                  isLoading ||
                  (plan.name !== "Free" && !paymentOpen) ||
                  (plan.name === "Free" && hasActivePaidPlan)
                }
              >
                {isLoading && selectedPlan === plan.name
                  ? "Please wait..."
                  : plan.name === "Free" && hasActivePaidPlan
                    ? "Active Paid Plan"
                    : plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
