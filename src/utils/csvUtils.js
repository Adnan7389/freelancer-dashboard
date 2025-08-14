import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import dayjs from "dayjs";
import Papa from "papaparse";

// Helper function to get month number from name or number
function getMonthNumber(month) {
  if (typeof month === 'number') return month;
  const monthMap = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
    'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12,
    'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
    'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
  };
  return monthMap[String(month).toLowerCase()] || 0;
}

// Define the fields we want to include in the export
const EXPORT_FIELDS = [
  'date',
  'amount',
  'platform',
  'client',
  'description'
];

// Clean and format data for export
function cleanIncomeData(incomeData) {
  return {
    date: incomeData.date || '',
    amount: incomeData.amount || 0,
    platform: incomeData.platform || 'Unknown',
    client: incomeData.client || '',
    description: incomeData.description || ''
  };
}

export async function exportIncomesToCSV(userId, selectedMonths = [], year = new Date().getFullYear()) {
  try {
    const incomeRef = collection(db, "incomes");
    const q = query(incomeRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    
    // Filter and map data
    const filtered = [];
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Skip if no date
      if (!data.date) {
        console.warn('Document missing date field:', doc.id);
        return;
      }
      
      // Parse and validate date
      let dateObj;
      try {
        dateObj = dayjs(data.date);
        if (!dateObj.isValid()) throw new Error('Invalid date');
      } catch (err) {
        console.warn('Invalid date format:', data.date, 'in document:', doc.id);
        return;
      }
      
      // Check year and month filter
      const monthNum = dateObj.month() + 1;
      const yearNum = dateObj.year();
      
      const selectedMonthNumbers = selectedMonths.map(month => 
        typeof month === 'string' ? getMonthNumber(month) : month
      );
      
      if (yearNum === year && (selectedMonths.length === 0 || selectedMonthNumbers.includes(monthNum))) {
        filtered.push(cleanIncomeData(data));
      }
    });
    
    if (filtered.length === 0) {
      throw new Error('No records found for the selected period');
    }

    // Generate CSV content
    const csvContent = convertToCSV(filtered);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    const dateStr = dayjs().format('YYYY-MM-DD');
    link.setAttribute('download', `income_export_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, count: filtered.length };
  } catch (err) {
    console.error('Error exporting incomes to CSV:', err);
    throw new Error(`Export failed: ${err.message}`);
  }
}

function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  // Use EXPORT_FIELDS as the header row
  const headers = EXPORT_FIELDS;
  
  // Map each data row to include only the fields in EXPORT_FIELDS
  const rows = data.map(row => 
    headers.map(field => {
      // Handle special formatting for certain fields
      const value = row[field] || '';
      // Escape quotes and wrap in quotes if contains commas or quotes
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
        ? `"${escaped}"`
        : escaped;
    })
  );
  
  // Combine headers and rows
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export const importCSVToIncomes = async (file, uid) => {
  const text = await file.text();
  const result = Papa.parse(text, { 
    header: true,
    skipEmptyLines: true,
    trimHeaders: true,
    transformHeader: header => header.toLowerCase().replace(/\s+/g, '')
  });

  if (result.errors.length > 0) {
    const errorMessages = result.errors.map(err => 
      `Row ${err.row}: ${err.message}`
    ).join('\n');
    throw new Error(`CSV parsing errors:\n${errorMessages}`);
  }

  const batch = [];
  const now = new Date().toISOString();
  
  for (const [index, row] of result.data.entries()) {
    try {
      // Skip empty rows
      if (Object.keys(row).length === 0) continue;
      
      // Validate required fields
      if (!row.date) {
        throw new Error('Missing required field: date');
      }
      
      // Parse and validate date
      const date = dayjs(row.date);
      if (!date.isValid()) {
        throw new Error(`Invalid date format: ${row.date}. Use YYYY-MM-DD`);
      }
      
      // Parse amount
      const amount = parseFloat(row.amount);
      if (isNaN(amount) || amount < 0) {
        throw new Error(`Invalid amount: ${row.amount}`);
      }
      
      // Prepare income data with only the essential fields
      const incomeData = {
        userId: uid,
        amount,
        platform: row.platform?.trim() || 'Unknown',
        date: date.format('YYYY-MM-DD'),
        description: row.description?.trim() || '',
        client: row.client?.trim() || '',
        createdAt: now,
        updatedAt: now
      };
      
      batch.push(incomeData);
      
    } catch (error) {
      throw new Error(`Error in row ${index + 2}: ${error.message}`);
    }
  }
  
  // Save to Firestore in batches
  const BATCH_SIZE = 500;
  let importedCount = 0;
  
  for (let i = 0; i < batch.length; i += BATCH_SIZE) {
    const batchChunk = batch.slice(i, i + BATCH_SIZE);
    try {
      await Promise.all(
        batchChunk.map(data => addDoc(collection(db, 'incomes'), data))
      );
      importedCount += batchChunk.length;
    } catch (error) {
      console.error('Error importing batch:', error);
      throw new Error(`Failed to import records after ${importedCount} successful imports. ${error.message}`);
    }
  }
  
  return { 
    success: true, 
    importedCount,
    totalCount: batch.length
  };
};
