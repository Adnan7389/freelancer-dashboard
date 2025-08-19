import { getAuth } from "firebase-admin/auth";
import admin from "firebase-admin";
import axios from "axios";

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString()
  );
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

// Lemon Squeezy API key
const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Verify the user's authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split(" ")[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // Get user's subscription data
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    const subscriptionId = userData.subscriptionId;

    if (!subscriptionId) {
      return res.status(400).json({
        error: "No active subscription found",
        details: "No subscription ID in user document",
      });
    }

    console.log(`Cancelling subscription ${subscriptionId} for user ${userId}`);

    // ✅ Correct API call → PATCH instead of DELETE
    const response = await axios.patch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
      {
        data: {
          id: subscriptionId,
          type: "subscriptions",
          attributes: {
            cancelled: true,
          },
        },
      },
      {
        headers: {
          Accept: "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          Authorization: `Bearer ${LEMON_SQUEEZY_API_KEY}`,
        },
        validateStatus: (status) => status < 500, // let 4xx pass through
      }
    );

    console.log("Lemon Squeezy API response:", {
      status: response.status,
      data: response.data,
    });

    if (response.status >= 400) {
      return res
        .status(response.status)
        .json({ error: "Lemon Squeezy error", details: response.data });
    }

    // Update Firestore immediately (webhook will confirm later)
    await userRef.update({
      subscriptionStatus: "cancelled",
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res
      .status(200)
      .json({ success: true, message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("🔥 Error cancelling subscription:", error);
    return res.status(500).json({
      error: "Failed to cancel subscription",
      details: error.response?.data || error.message,
    });
  }
}
