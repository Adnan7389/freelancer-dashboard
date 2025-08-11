import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import dayjs from "dayjs";
import Papa from "papaparse";

// Helper function to get month number from name or number
function getMonthNumber(month) {
  if (typeof month === 'number') return month;
  const monthMap = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
    'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
  };
  return monthMap[month.toLowerCase()] || 0;
}

export async function exportIncomesToCSV(userId, selectedMonths = [], year = new Date().getFullYear()) {
  try {
    
    const incomeRef = collection(db, "incomes");
    
    // Get all records for the user, we'll filter by date in memory
    const q = query(
      incomeRef,
      where("userId", "==", userId)
    );
    
    const snapshot = await getDocs(q);
    
    // Filter client-side by selected months and year
    const filtered = snapshot.docs
      .filter(doc => {
        const data = doc.data();
        if (!data.date) {
          console.warn('Document missing date field:', doc.id);
          return false;
        }
        
        // Parse the date string (format: 'YYYY-MM-DD')
        const dateStr = data.date;
        const [year, month, day] = dateStr.split('-').map(Number);
        
        // Validate the date
        const date = new Date(year, month - 1, day);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date format:', data.date, 'in document:', doc.id);
          return false;
        }
        
        // Check if the date is within the selected year and months
        const monthNum = date.getMonth() + 1;
        const yearNum = date.getFullYear();
        
        // Convert selected months to numbers if they're strings
        const selectedMonthNumbers = selectedMonths.map(month => 
          typeof month === 'string' ? getMonthNumber(month) : month
        );
        
       
        return yearNum === year && selectedMonthNumbers.includes(monthNum);
      })
      .map(doc => {
        const data = doc.data();
        // Keep the original date format (YYYY-MM-DD)
        return data;
      });
      
    if (filtered.length === 0) {
      console.warn('No records found matching the filter criteria');
      throw new Error('No records found for the selected period');
    }

    const rows = filtered;
    const csvContent = convertToCSV(rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `income_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (err) {
    console.error('Error in exportIncomesToCSV:', err);
    throw err;
  }
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
