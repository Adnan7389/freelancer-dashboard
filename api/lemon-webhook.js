import crypto from "crypto";
import admin from "firebase-admin";

export const config = {
  api: {
    bodyParser: false, // disable body parsing to get raw buffer
  },
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString()
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

function verifySignature(rawBody, signature, secret) {
  const hash = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  // Raw body buffer
  const rawBody = await new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });

  const signature = req.headers["x-signature"];
  const isValid = verifySignature(rawBody, signature, process.env.LEMONSQUEEZY_SECRET);

  if (!isValid) {
    console.error("❌ Invalid signature");
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(rawBody);
  const type = event.meta?.event_name;
  const attrs = event.data?.attributes;
  const userEmail = attrs?.user_email;

  if (!userEmail) {
    console.error("❌ No email in event payload");
    return res.status(400).send("No user email in event");
  }

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", userEmail).get();

    if (snapshot.empty) {
      console.log("⚠️ No user found for email:", userEmail);
      return res.status(404).send("User not found");
    }

    const userDoc = snapshot.docs[0];
    const userRef = userDoc.ref;

    // Get subscription and order IDs
    const subscriptionId = event.data?.id; // The subscription ID from Lemon Squeezy
    const orderId = attrs?.order_id || (attrs?.order_id ? attrs.order_id.toString() : null);
    const subscriptionUrl = orderId 
      ? `https://app.lemonsqueezy.com/my-orders/${orderId}`
      : attrs?.urls?.customer_portal; // Fallback to customer portal if no order ID
    const subscriptionStatus = attrs?.status_formatted || null;
    const renewsAt = attrs?.renews_at || null;

    // Pro events
    if (
      [
        "order_created",
        "subscription_created",
        "subscription_updated",
        "subscription_payment_success",
        "subscription_plan_changed",
      ].includes(type)
    ) {
      const updateData = {
        plan: "pro",
        subscriptionUrl,
        subscriptionStatus,
        renewsAt,
        subscriptionId, // Store the subscription ID for cancellation
        orderId,       // Store the order ID for reference
        lastSubscriptionUpdate: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Update the user document with subscription info
      await userRef.update(updateData);
      console.log(
        `✅ [${type}] Upgraded ${userEmail} → Pro | Status: ${subscriptionStatus}, Renews: ${renewsAt}`
      );
    }

    // Free events
    if (
      ["subscription_cancelled", "subscription_expired", "subscription_payment_failed"].includes(
        type
      )
    ) {
      await userRef.update({
        plan: "free",
        subscriptionUrl,
        subscriptionStatus,
        renewsAt: null,
      });
      console.log(`⚠️ [${type}] Downgraded ${userEmail} → Free`);
    }

    return res.status(200).send("Webhook handled");
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
