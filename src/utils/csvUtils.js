// src/utils/csvUtils.js
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import Papa from "papaparse";

export const exportIncomesToCSV = async (uid) => {
  const q = collection(db, "incomes");
  const snapshot = await getDocs(q);
  const incomes = snapshot.docs
    .map(doc => doc.data())
    .filter(income => income.userId === uid);

  const csv = Papa.unparse(incomes);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "incomes.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importCSVToIncomes = async (file, uid) => {
  const text = await file.text();
  const result = Papa.parse(text, { header: true });

  for (const row of result.data) {
    await addDoc(collection(db, "incomes"), {
      userId: uid,
      amount: parseFloat(row.amount),
      platform: row.platform || "Unknown",
      date: row.date,
      description: row.description || "",
      client: row.client || "",
      createdAt: new Date().toISOString(),
    });
  }
};
