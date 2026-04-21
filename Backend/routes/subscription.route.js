import { confirmSubscription, createSubscriptionOrder } from "../controllers/subscription.controller.js";

export default function subscriptionRoute(app) {
  app.post("/api/subscription/order", createSubscriptionOrder);
  app.post("/api/subscription/confirm", confirmSubscription);
}
