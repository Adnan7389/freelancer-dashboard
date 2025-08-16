// src/pages/Success.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export default function Success() {
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        if (data.plan === "pro") {
          clearInterval(interval);
          navigate("/dashboard");
        }
      }
    }, 2000);

    setTimeout(() => {
      clearInterval(interval);
      setChecking(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [auth, db, navigate]);

  return (
    <div className="flex justify-center items-center h-screen">
      {checking ? (
        <p>Activating your Pro plan... 🚀</p>
      ) : (
        <p>It’s taking longer than expected. Please refresh your dashboard.</p>
      )}
    </div>
  );
}
