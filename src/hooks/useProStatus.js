// src/hooks/useProStatus.js
import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./useAuth";

export function useProStatus() {
  const { currentUser } = useAuth();
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    // subscribe to real-time updates
    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setIsPro(snap.data().plan === "pro");
      } else {
        setIsPro(false);
      }
    });

    return () => unsubscribe(); // cleanup listener
  }, [currentUser]);

  return isPro;
}
