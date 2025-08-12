import crypto from "crypto";
import admin from "firebase-admin";

// Initialize Firebase Admin using Service Account from env
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

  const signature = req.headers["x-signature"];
  const rawBody = JSON.stringify(req.body);
  const isValid = verifySignature(rawBody, signature, process.env.LEMONSQUEEZY_SECRET);

  if (!isValid) {
    console.error("Invalid signature");
    return res.status(400).send("Invalid signature");
  }

  const event = req.body;
  const type = event.meta?.event_name;
  const userEmail = event.data?.attributes?.user_email;

  if (!userEmail) {
    console.error("No email found in event payload");
    return res.status(400).send("No user email in event");
  }

  try {
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", userEmail).get();

    if (snapshot.empty) {
      console.log("No user found with email:", userEmail);
      return res.status(404).send("User not found");
    }

    const userDoc = snapshot.docs[0];
    const userRef = userDoc.ref;

    // Events that upgrade to Pro
    if (
      [
        "order_created",
        "subscription_created",
        "subscription_updated",
        "subscription_payment_success",
        "subscription_plan_changed",
      ].includes(type)
    ) {
      await userRef.update({ plan: "pro" });
      console.log(`User upgraded to Pro due to ${type}:`, userEmail);
    }

    // Events that downgrade to Free
    if (
      ["subscription_cancelled", "subscription_expired", "subscription_payment_failed"].includes(type)
    ) {
      await userRef.update({ plan: "free" });
      console.log(`User downgraded to Free due to ${type}:`, userEmail);
    }

    res.status(200).send("Webhook handled");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Internal server error");
  }
}
