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

    const unsub = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
      setIsPro(docSnap.data()?.plan === "pro");
    });

    return unsub;
  }, [currentUser]);

  return isPro;
}
