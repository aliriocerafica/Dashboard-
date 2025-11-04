import { NextRequest, NextResponse } from "next/server";

// Finance Dashboard - Ardent Payroll Concern (Responses)
// Using the published CSV URL with gid parameter for the specific sheet tab
const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQI1mBFgpUtrV81ZIWyxjDNagtwJM9ReeMU_pY15f1fyhb2zzYvXQ2KrCzg1LZGsEeIBlSrLe8FpEEQ/pub?gid=222330370&single=true&output=csv";

interface PayrollConcern {
  timestamp: string;
  email: string;
  name: string;
  payrollDate: string;
  concernType: string;
  details: string;
  attachments: string;
  status: string;
  dateResolved: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching payroll concerns from:", GOOGLE_SHEET_URL);

    // Fetch data from Google Sheets CSV
    const response = await fetch(GOOGLE_SHEET_URL, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
        "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unable to read error response");
      console.error("Error response:", errorText.substring(0, 500));
      
      if (response.status === 403) {
        throw new Error(
          "Access denied. Please make sure the Google Sheet is published to the web: File > Share > Publish to web > CSV format, and set to 'Anyone with the link can view'"
        );
      } else if (response.status === 404) {
        throw new Error(
          "Sheet not found. Please check if the Google Sheet URL is correct and the sheet exists."
        );
      } else {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}. Make sure the Google Sheet is published to the web (File > Share > Publish to web)`
        );
      }
    }

    const csvText = await response.text();
    console.log("CSV text length:", csvText.length);
    console.log("First 200 chars:", csvText.substring(0, 200));

    // Check if we got HTML instead of CSV
    if (csvText.includes("<!DOCTYPE") || csvText.includes("<html") || csvText.includes("<head>")) {
      console.error("Received HTML instead of CSV. First 500 chars:", csvText.substring(0, 500));
      throw new Error(
        "Received HTML instead of CSV. The Google Sheet needs to be published to the web: File > Share > Publish to web > Select 'CSV' format > Publish"
      );
    }

    // Parse CSV data - handle newlines within quoted fields properly
    // Split by newline but keep track of quoted sections
    const lines: string[] = [];
    let currentLine = "";
    let inQuotes = false;
    
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = i + 1 < csvText.length ? csvText[i + 1] : null;
      
      if (char === '"') {
        if (nextChar === '"' && inQuotes) {
          currentLine += '""';
          i++; // Skip next quote (escaped quote)
        } else {
          inQuotes = !inQuotes;
        }
        currentLine += char;
      } else if (char === '\n' || char === '\r') {
        if (inQuotes) {
          // Newline inside quotes is part of the field
          currentLine += char;
        } else {
          // Newline outside quotes means end of row
          if (currentLine.trim() || lines.length === 0) {
            lines.push(currentLine);
          }
          currentLine = "";
        }
      } else {
        currentLine += char;
      }
    }
    
    // Push the last line if it exists
    if (currentLine.trim() || lines.length === 0) {
      lines.push(currentLine);
    }
    
    // Parse headers using the same function to handle quoted fields
    const headers = parseCSVLine(lines[0]).map((h) => h.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));

    console.log("CSV Headers:", headers);
    console.log("Total lines:", lines.length);

    const concerns: PayrollConcern[] = [];

    // Find column indices by name (case-insensitive)
    const getColumnIndex = (name: string): number => {
      const lowerName = name.toLowerCase();
      return headers.findIndex((h) => h.toLowerCase().includes(lowerName));
    };

    const timestampIdx = getColumnIndex("Timestamp");
    const emailIdx = getColumnIndex("Email Address") >= 0 ? getColumnIndex("Email Address") : getColumnIndex("Email");
    const nameIdx = getColumnIndex("Name");
    const payrollDateIdx = getColumnIndex("Payroll Date");
    const concernTypeIdx = getColumnIndex("Type of concern");
    const detailsIdx = getColumnIndex("Details/Explanation") >= 0 ? getColumnIndex("Details/Explanation") : getColumnIndex("Details");
    const attachmentsIdx = getColumnIndex("Attach");
    // Status column is actually named "Resolve" in the sheet
    const statusIdx = getColumnIndex("Resolve") >= 0 ? getColumnIndex("Resolve") : getColumnIndex("Status");
    const dateResolvedIdx = getColumnIndex("Date Resolved");

    console.log("Column indices:", {
      timestampIdx,
      emailIdx,
      nameIdx,
      payrollDateIdx,
      concernTypeIdx,
      detailsIdx,
      attachmentsIdx,
      statusIdx,
      dateResolvedIdx,
    });

    // Skip row 1 (header) - start from index 1 (which is row 2)
    let consecutiveEmptyRows = 0;
    const MAX_CONSECUTIVE_EMPTY = 3; // Stop after 3 consecutive empty rows
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Track consecutive empty rows and stop processing if we hit too many
      if (!line.trim()) {
        consecutiveEmptyRows++;
        if (consecutiveEmptyRows >= MAX_CONSECUTIVE_EMPTY) {
          console.log(`Stopping at row ${i + 1} - found ${MAX_CONSECUTIVE_EMPTY} consecutive empty rows`);
          break;
        }
        continue;
      }
      
      // Reset consecutive empty counter when we find a non-empty row
      consecutiveEmptyRows = 0;

      // Parse CSV line with proper handling of quoted fields
      const values = parseCSVLine(line);

      // Skip if this row is completely empty (all values are empty)
      const isEmptyRow = values.every((val) => !val || val.trim() === "");
      if (isEmptyRow) {
        console.log(`Skipping empty row at index ${i}`);
        continue;
      }

      // Skip if this looks like a header row (all values match header names)
      const isHeaderRow = values.every((val, idx) => {
        if (idx >= headers.length) return false;
        const trimmedVal = val.trim().toLowerCase();
        const trimmedHeader = headers[idx].trim().toLowerCase();
        return trimmedVal === trimmedHeader || trimmedVal === "";
      });

      if (isHeaderRow) {
        console.log(`Skipping header row at index ${i}`);
        continue;
      }

      // Helper function to clean up quotes from CSV values
      const cleanValue = (val: string): string => {
        if (!val) return "";
        return val.trim().replace(/^"|"$/g, "").replace(/""/g, '"');
      };
      
      // Extract values using column indices, with fallback to positional if not found
      const timestamp = cleanValue(timestampIdx >= 0 ? (values[timestampIdx] || "") : (values[0] || ""));
      const email = cleanValue(emailIdx >= 0 ? (values[emailIdx] || "") : (values[1] || ""));
      const name = cleanValue(nameIdx >= 0 ? (values[nameIdx] || "") : (values[2] || ""));
      let payrollDate = cleanValue(payrollDateIdx >= 0 ? (values[payrollDateIdx] || "") : (values[3] || ""));
      
      // Normalize Payroll Date if it exists (handle written dates like "October 5, 2025")
      if (payrollDate && payrollDate.trim() !== "") {
        const payrollDateParsed = new Date(payrollDate.trim());
        if (!isNaN(payrollDateParsed.getTime()) && 
            payrollDateParsed.getFullYear() >= 2000 && 
            payrollDateParsed.getFullYear() <= 2100) {
          // Convert to MM/DD/YYYY format for consistency
          const month = String(payrollDateParsed.getMonth() + 1).padStart(2, '0');
          const day = String(payrollDateParsed.getDate()).padStart(2, '0');
          const year = payrollDateParsed.getFullYear();
          payrollDate = `${month}/${day}/${year}`;
        } else {
          // If parsing failed, try to extract date from string format
          const dateMatch = payrollDate.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
          if (dateMatch) {
            const [, month, day, year] = dateMatch;
            const fullYear = year.length === 2 ? `20${year}` : year;
            const testDate = new Date(`${month}/${day}/${fullYear}`);
            if (!isNaN(testDate.getTime())) {
              const m = String(testDate.getMonth() + 1).padStart(2, '0');
              const d = String(testDate.getDate()).padStart(2, '0');
              const y = testDate.getFullYear();
              payrollDate = `${m}/${d}/${y}`;
            }
          }
        }
      }
      
      // If Payroll Date is empty, try to extract date from Timestamp
      if (!payrollDate || payrollDate.trim() === "") {
        if (timestamp && timestamp.trim() !== "") {
          // Try to parse the timestamp as a date first
          const timestampDate = new Date(timestamp);
          if (!isNaN(timestampDate.getTime()) && 
              timestampDate.getFullYear() >= 2000 && 
              timestampDate.getFullYear() <= 2100) {
            // Extract date part in MM/DD/YYYY format
            const month = String(timestampDate.getMonth() + 1).padStart(2, '0');
            const day = String(timestampDate.getDate()).padStart(2, '0');
            const year = timestampDate.getFullYear();
            payrollDate = `${month}/${day}/${year}`;
            console.log(`Using date from timestamp for concern ${i}: ${payrollDate} (from ${timestamp})`);
          } else {
            // Fallback: Extract date part from timestamp string (format: "10/17/2025 1:38:05")
            const dateMatch = timestamp.match(/^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
            if (dateMatch) {
              const [, month, day, year] = dateMatch;
              const fullYear = year.length === 2 ? `20${year}` : year;
              const testDate = new Date(`${month}/${day}/${fullYear}`);
              if (!isNaN(testDate.getTime()) && testDate.getFullYear() >= 2000 && testDate.getFullYear() <= 2100) {
                const m = String(testDate.getMonth() + 1).padStart(2, '0');
                const d = String(testDate.getDate()).padStart(2, '0');
                const y = testDate.getFullYear();
                payrollDate = `${m}/${d}/${y}`;
                console.log(`Using date from timestamp string for concern ${i}: ${payrollDate}`);
              }
            }
          }
        }
      }
      
      // Ensure payrollDate is not empty - if still empty, log warning
      if (!payrollDate || payrollDate.trim() === "") {
        console.warn(`⚠️ Concern at row ${i + 1} has no payroll date even after extraction attempts`);
      }
      
      // Extract remaining values using cleanValue helper
      const concernType = cleanValue(concernTypeIdx >= 0 ? (values[concernTypeIdx] || "") : (values[4] || ""));
      const details = cleanValue(detailsIdx >= 0 ? (values[detailsIdx] || "") : (values[5] || ""));
      const attachments = cleanValue(attachmentsIdx >= 0 ? (values[attachmentsIdx] || "") : (values[6] || ""));
      let status = cleanValue(statusIdx >= 0 ? (values[statusIdx] || "") : (values[7] || ""));
      let dateResolved = cleanValue(dateResolvedIdx >= 0 ? (values[dateResolvedIdx] || "") : (values[8] || ""));
      
      // Debug for rows 5 and 6 (concerns 4 and 5 in 0-indexed)
      if (i === 4 || i === 5) {
        console.log(`\n=== Row ${i + 1} (Line index ${i}) Debug ===`);
        console.log("Headers:", headers);
        console.log("Status column index:", statusIdx, "Header:", headers[statusIdx]);
        console.log("Date Resolved column index:", dateResolvedIdx, "Header:", headers[dateResolvedIdx]);
        console.log("Total values:", values.length);
        console.log("All values:", values);
        console.log("Raw status value:", JSON.stringify(status));
        console.log("Raw dateResolved value:", JSON.stringify(dateResolved));
        console.log("Value at statusIdx:", JSON.stringify(values[statusIdx]));
        console.log("Value at dateResolvedIdx:", JSON.stringify(values[dateResolvedIdx]));
        console.log("========================================\n");
      }
      
      // Normalize status - trim and capitalize properly
      status = status.trim();
      dateResolved = dateResolved.trim();
      
      if (status && status.length > 0) {
        // If it's "Resolved", keep it as "Resolved" (proper case)
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === "resolved") {
          status = "Resolved";
        } else if (lowerStatus === "pending") {
          status = "Pending";
        } else if (lowerStatus === "in review" || lowerStatus === "inreview") {
          status = "In Review";
        } else if (lowerStatus === "on process" || lowerStatus === "onprocess") {
          status = "On Process";
        } else {
          // Default: capitalize first letter, lowercase rest
          status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        }
      } else {
        // If status is empty, log it
        if (i >= 4 && i <= 5) {
          console.warn(`Row ${i + 1}: Status is empty!`, {
            statusIdx,
            values: values,
            header: headers[statusIdx],
          });
        }
      }

      // Only count rows with actual timestamp data (this ensures we only count real concerns)
      // Skip rows that are completely empty or don't have a timestamp
      if (!timestamp || timestamp.trim() === "") {
        console.log(`Skipping row ${i + 1} - no timestamp found`);
        continue;
      }

      // Additional validation: Must have at least name, email, or concernType to be a valid concern
      const hasName = name && name.trim() !== "";
      const hasEmail = email && email.trim() !== "";
      const hasConcernType = concernType && concernType.trim() !== "";
      
      if (!hasName && !hasEmail && !hasConcernType) {
        console.log(`Skipping row ${i + 1} - no name, email, or concern type found`);
        continue;
      }

      // Add valid concern
      concerns.push({
        timestamp: timestamp.trim(),
        email: email.trim(),
        name: name.trim(),
        payrollDate: payrollDate.trim(),
        concernType: concernType.trim(),
        details: details.trim(),
        attachments: attachments.trim(),
        status: status.trim(),
        dateResolved: dateResolved.trim(),
      });
      console.log(`Added concern ${concerns.length}: ${name || email || concernType || "Unknown"} (Status: ${status})`);
    }

    console.log("Parsed concerns:", concerns.length);
    console.log("All parsed concerns:", concerns);

    // Debug each concern's payrollDate
    concerns.forEach((concern, index) => {
      const hasPayrollDate = concern.payrollDate && concern.payrollDate.trim() !== "";
      console.log(`Concern ${index + 1}:`, {
        name: concern.name,
        payrollDate: concern.payrollDate || "(empty)",
        hasPayrollDate,
        concernType: concern.concernType,
        status: concern.status,
        timestamp: concern.timestamp,
      });
      
      if (!hasPayrollDate) {
        console.warn(`⚠️ Concern ${index + 1} (${concern.name}) has no payroll date!`);
      }
    });
    
    // Count concerns with/without dates
    const concernsWithDate = concerns.filter((c) => c.payrollDate && c.payrollDate.trim() !== "").length;
    const concernsWithoutDate = concerns.length - concernsWithDate;
    console.log(`Date Summary: ${concernsWithDate} with dates, ${concernsWithoutDate} without dates`);

    // All concerns in the array are already validated, so use them directly
    const validConcerns = concerns;

    console.log(`Total valid concerns: ${validConcerns.length}`);

    // Calculate summary statistics based on valid concerns only
    const totalConcerns = validConcerns.length;
    
    // Count resolved concerns - check for "Resolved" (case-insensitive)
    const resolvedConcerns = validConcerns.filter(
      (c) => c.status && c.status.trim().toLowerCase() === "resolved"
    ).length;
    
    const pendingConcerns = validConcerns.filter(
      (c) => c.status && c.status.trim().toLowerCase() === "pending"
    ).length;
    
    // Count "On Process" concerns - check for "On Process" or "On Process" (case-insensitive)
    const onProcessConcerns = validConcerns.filter(
      (c) => c.status && (c.status.trim().toLowerCase() === "on process" || c.status.trim().toLowerCase() === "onprocess")
    ).length;
    
    console.log("Summary statistics:", {
      totalConcerns,
      resolvedConcerns,
      pendingConcerns,
      onProcessConcerns,
    });

    const payrollData = {
      summary: {
        totalConcerns,
        resolvedConcerns,
        pendingConcerns,
        onProcessConcerns,
      },
      concerns: validConcerns.map((concern, index) => ({
        id: index + 1,
        email: concern.email,
        name: concern.name,
        payrollDate: concern.payrollDate,
        concernType: concern.concernType,
        details: concern.details,
        attachments: concern.attachments,
        status: concern.status,
        dateResolved: concern.dateResolved,
      })),
    };

    return NextResponse.json({
      success: true,
      data: payrollData,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error("Error fetching payroll concerns:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch payroll concerns data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to parse CSV line with proper handling of quoted fields and newlines
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = i + 1 < line.length ? line[i + 1] : null;

    if (char === '"') {
      // Check for escaped quotes ("")
      if (nextChar === '"' && inQuotes) {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else if (char === '\n' && !inQuotes) {
      // If we encounter a newline outside quotes, we should stop
      // But in CSV, newlines within quotes are part of the field
      if (current.trim()) {
        current += char;
      }
    } else {
      current += char;
    }
  }

  // Push the last field
  result.push(current.trim());
  return result;
}
