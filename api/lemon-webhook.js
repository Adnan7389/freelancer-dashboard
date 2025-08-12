// api/lemonsqueezy-webhook.js
import crypto from "crypto";
import admin from "firebase-admin";

// Initialize Firebase Admin with Service Account from env
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
  try {
    const userEmail = event.data.attributes.user_email;
    const type = event.meta.event_name;

    // Find user by email
    const usersRef = db.collection("users");
    const snapshot = await usersRef.where("email", "==", userEmail).get();

    if (snapshot.empty) {
      console.log("No user found with email:", userEmail);
      return res.status(404).send("User not found");
    }

    const userDoc = snapshot.docs[0];
    const userRef = userDoc.ref;

    // Upgrade/Downgrade plan
    if (["order_created", "subscription_created", "subscription_payment_success"].includes(type)) {
      await userRef.update({ plan: "pro" });
      console.log("User upgraded to Pro:", userEmail);
    }

    if (["subscription_cancelled", "subscription_expired"].includes(type)) {
      await userRef.update({ plan: "free" });
      console.log("User downgraded to Free:", userEmail);
    }

    res.status(200).send("Webhook handled");
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).send("Internal server error");
  }
}
