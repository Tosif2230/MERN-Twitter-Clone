"use client";

import React, { useState } from "react";
import {
  Check,
  Clock,
  CreditCard,
  Crown,
  Mail,
  ReceiptText,
  ShieldAlert,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

const Subscription = () => {
  const [selectedPlan, setSelectedPlan] = useState("Free");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const tweetPlans = [
    {
      name: "Free",
      price: "Rs. 0",
      tweets: "1 tweet per day",
      description: "Start with a single post.",
      buttonText: "Free Plan",
      highlight: true,
    },
    {
      name: "Bronze",
      price: "Rs. 100",
      tweets: "3 tweets per day",
      description: "For light posting.",
      buttonText: "Pay with Razorpay",
      highlight: false,
    },
    {
      name: "Silver",
      price: "Rs. 300",
      tweets: "5 tweets per day",
      description: "More room for regular updates.",
      buttonText: "Pay with Razorpay",
      highlight: false,
    },
    {
      name: "Gold",
      price: "Rs. 1000",
      tweets: "Unlimited tweets per day",
      description: "No posting limit.",
      buttonText: "Pay with Razorpay",
      highlight: false,
    },
  ];

  const isPaymentTime = () => {
    const indiaDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const hour = new Date(indiaDate).getHours();
    return hour === 10;
  };

  const handlePayment = (planName: string, price: string) => {
    setSelectedPlan(planName);

    if (price === "Rs. 0") {
      setSuccess(true);
      setMessage("Free plan activated successfully.");
      return;
    }

    if (isPaymentTime()) {
      setSuccess(true);
      setMessage(
        `${planName} plan payment successful. Invoice email has been prepared.`,
      );
    } else {
      setSuccess(false);
      setMessage(
        "Payment blocked. Please try between 10:00 AM and 11:00 AM IST.",
      );
    }
  };

  const paymentOpen = isPaymentTime();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
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

      {/* Payment Notice */}
      <div className="border-b border-gray-800 px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-5xl rounded-lg border border-gray-800 bg-gray-950 p-4">
          <div className="flex items-start gap-3">
            {paymentOpen ? (
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
            ) : (
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            )}
            <h2 className="text-sm font-semibold leading-6 sm:text-base">
              Payments are allowed only from 10:00 AM to 11:00 AM IST.
            </h2>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-3 py-5 sm:px-5 md:grid-cols-2">
        {tweetPlans.map((plan) => (
          <Card
            key={plan.name}
            onClick={() => setSelectedPlan(plan.name)}
            className={`flex min-h-64 cursor-pointer flex-col p-4 transition-all duration-200 sm:p-5
            ${selectedPlan === plan.name ? "border-2 border-blue-500 bg-blue-500/10" : "border border-gray-800 bg-black hover:border-gray-600"}`}
          >
            <CardContent className="flex h-full flex-col p-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-lg text-white font-bold">
                    {plan.name}
                  </div>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>

                {/* Crown for paid plans */}
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
                <span className="text-2xl text-white font-bold sm:text-3xl">
                  {plan.price}
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
                <span>Email invoice after successful payment</span>
              </div>

              <Button
                className={`mt-auto w-full rounded-lg font-semibold transition-all
                  ${selectedPlan === plan.name ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-white text-black hover:bg-gray-200"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPlan(plan.name);
                  handlePayment(plan.name, plan.price);
                }}
              >
                {plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div className="mx-auto max-w-5xl px-3 pb-20 sm:px-5 md:pb-6">
          <div
            className={`rounded-lg border p-4 ${
              success
                ? "border-green-500 bg-green-500/10"
                : "border-yellow-500 bg-yellow-500/10"
            }`}
          >
            <div className="flex items-start gap-3">
              {success ? (
                <ReceiptText className="mt-0.5 h-5 w-5 shrink-0 text-green-400" />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
              )}

              <div className="min-w-0">
                <h3 className="font-semibold">
                  {success
                    ? `${selectedPlan} plan activated`
                    : "Payment blocked"}
                </h3>
                <p className="mt-1 text-sm text-gray-300">{message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscription;
