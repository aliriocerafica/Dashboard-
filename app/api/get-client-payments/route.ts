import { NextRequest, NextResponse } from "next/server";

// Google Sheets published CSV URL
const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8rbckqLpRFarQfJpbCq0f8npFC_2o9gx1QQcgOaud11nr9L8DRCpeFJ3sgK4UEjCak3GtNOIRcSZ8/pub?gid=0&single=true&output=csv";

interface ClientPayment {
  clientName: string;
  coverageDate: string;
  dateInvoiceSent: string;
  paymentDate: string;
  dueDate: string;
  daysAfterInvoice: string;
  daysAfterDue: string;
  class: string;
}

// Helper function to parse CSV line properly (handles quoted fields with commas)
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

export async function GET(request: NextRequest) {
  try {
    // Add cache-busting timestamp to Google Sheets URL
    const timestamp = Date.now();
    const urlWithTimestamp = `${GOOGLE_SHEET_URL}&timestamp=${timestamp}`;
    
    console.log("Fetching client payment data from:", urlWithTimestamp);

    // Fetch data from Google Sheets CSV
    const response = await fetch(urlWithTimestamp, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
        "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)",
      },
    });

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Unable to read error response");
      console.error("Error response:", errorText.substring(0, 500));

      if (response.status === 403) {
        throw new Error(
          "Access denied. Please make sure the Google Sheet is published to the web."
        );
      } else if (response.status === 404) {
        throw new Error(
          "Sheet not found. Please check if the Google Sheet URL is correct."
        );
      } else {
        throw new Error(
          `Failed to fetch data: ${response.status} ${response.statusText}`
        );
      }
    }

    const csvText = await response.text();
    console.log("CSV text length:", csvText.length);

    // Check if we got HTML instead of CSV
    if (
      csvText.includes("<!DOCTYPE") ||
      csvText.includes("<html") ||
      csvText.includes("<head>")
    ) {
      throw new Error(
        "Received HTML instead of CSV. The Google Sheet needs to be published to the web."
      );
    }

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({
        success: true,
        data: {
          payments: [],
          summary: {
            totalClients: 0,
            paidEarly: 0,
            paidOnTime: 0,
            paidLate: 0,
            notYetPaid: 0,
          },
          clientHistory: {},
        },
      });
    }

    const payments: ClientPayment[] = [];
    const clientHistory: Record<
      string,
      Array<{
        coverageDate: string;
        paymentDate: string;
        dueDate: string;
        status: string;
        class: string;
        daysAfterDue: string;
      }>
    > = {};

    // Skip header row and parse data
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);

      // Skip empty or invalid rows
      if (columns.length < 8 || !columns[0]?.trim()) {
        continue;
      }

      const clientName = columns[0]?.trim() || "";
      const coverageDate = columns[1]?.trim() || "";
      const dateInvoiceSent = columns[2]?.trim() || "";
      const paymentDate = columns[3]?.trim() || "";
      const dueDate = columns[4]?.trim() || "";
      const daysAfterInvoice = columns[5]?.trim() || "";
      const daysAfterDue = columns[6]?.trim() || "";
      const classValue = columns[7]?.trim() || "";

      const payment: ClientPayment = {
        clientName,
        coverageDate,
        dateInvoiceSent,
        paymentDate,
        dueDate,
        daysAfterInvoice,
        daysAfterDue,
        class: classValue,
      };

      payments.push(payment);

      // Build client history
      if (!clientHistory[clientName]) {
        clientHistory[clientName] = [];
      }

      // Determine status for history
      let status = "Unknown";
      if (
        daysAfterDue.toLowerCase() === "not yet paid" ||
        classValue === "Not yet paid"
      ) {
        status = "Not Yet Paid";
      } else if (
        daysAfterDue.toLowerCase() === "paid before due date" ||
        daysAfterDue.toLowerCase() === "paid on time"
      ) {
        status = "Paid Early";
      } else if (classValue === "A") {
        status = "Paid Early";
      } else if (
        classValue === "B" ||
        classValue === "C" ||
        classValue === "D"
      ) {
        status = "Paid Late";
      } else {
        status = "Paid";
      }

      clientHistory[clientName].push({
        coverageDate,
        paymentDate: paymentDate || "Pending",
        dueDate,
        status,
        class: classValue,
        daysAfterDue,
      });
    }

    // Calculate summary
    let paidEarly = 0;
    let paidOnTime = 0;
    let paidLate = 0;
    let notYetPaid = 0;

    payments.forEach((payment) => {
      if (
        payment.daysAfterDue.toLowerCase() === "not yet paid" ||
        payment.class === "Not yet paid"
      ) {
        notYetPaid++;
      } else if (
        payment.daysAfterDue.toLowerCase() === "paid before due date" ||
        payment.class === "A"
      ) {
        paidEarly++;
      } else if (payment.class === "B") {
        paidLate++;
      } else if (payment.class === "C") {
        paidLate++;
      } else if (payment.class === "D") {
        paidLate++;
      }
    });

    const uniqueClients = Object.keys(clientHistory).length;

    return NextResponse.json({
      success: true,
      data: {
        payments,
        summary: {
          totalClients: uniqueClients,
          totalPayments: payments.length,
          paidEarly,
          paidOnTime,
          paidLate,
          notYetPaid,
        },
        clientHistory,
      },
    });
  } catch (error) {
    console.error("Error fetching client payment data:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch data",
      },
      { status: 500 }
    );
  }
}

