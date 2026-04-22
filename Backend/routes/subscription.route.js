import {
  confirmSubscription,
  createSubscriptionOrder,
  getUserSubscriptionStatus,
} from "../controllers/subscription.controller.js";

export default function subscriptionRoute(app) {
  //Create Subscription
  app.post("/api/subscription/order", createSubscriptionOrder);
  //Confirm Plan
  app.post("/api/subscription/confirm", confirmSubscription);
  //Current Plan Status
  app.get("/api/subscription/status/:userId", getUserSubscriptionStatus);
}
