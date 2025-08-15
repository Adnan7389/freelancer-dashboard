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

  // Get raw body as a string
  const rawBody = await new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      resolve(data);
    });
  });

  const signature = req.headers["x-signature"];
  const isValid = verifySignature(rawBody, signature, process.env.LEMONSQUEEZY_SECRET);

  if (!isValid) {
    console.error("Invalid signature");
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(rawBody);
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

    // Upgrade to Pro
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

    // Downgrade to Free
    if (
      ["subscription_cancelled", "subscription_expired", "subscription_payment_failed"].includes(type)
    ) {
      await userRef.update({ plan: "free" });
      console.log(`User downgraded to Free due to ${type}:`, userEmail);
    }

    return res.status(200).send("Webhook handled");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
