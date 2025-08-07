import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import dayjs from "dayjs";
import Papa from "papaparse";

export async function exportIncomesToCSV(userId, selectedMonths = []) {
  const q = query(collection(db, "incomes"), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  const filtered = snapshot.docs.filter((doc) => {
    if (selectedMonths.length === 0) return true;
    const month = dayjs(doc.data().date).format("MMMM");
    return selectedMonths.includes(month);
  });

  const rows = filtered.map((doc) => doc.data());

  const csvContent = convertToCSV(rows);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `income_export_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function convertToCSV(data) {
  const headers = Object.keys(data[0] || {});
  const rows = data.map((row) => headers.map((field) => row[field]).join(","));
  return [headers.join(","), ...rows].join("\n");
}

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
