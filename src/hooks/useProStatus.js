// src/hooks/useProStatus.js
import { useState, useEffect } from "react";
import { doc,getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";

export function useProStatus() {
  const { currentUser } = useAuth();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchPlan = async () => {
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setIsPro(userSnap.data().plan === "pro");
      }
    };

    fetchPlan();
  }, [currentUser]);

  return isPro;
}
