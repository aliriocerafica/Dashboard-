import { NextRequest, NextResponse } from "next/server";

const LAPTOP_INVENTORY_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8BeQcv2c8U90KfW89v9g-PIL7eMmYNsPiUNf_QEPokynxII_2dYC0hQpH2S8SHVJi13kSgicAKudr/pub?gid=0&single=true&output=csv";

function parseCSVLine(line: string): string[] {
  const result = [];
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
    console.log("Fetching Laptop Inventory data from:", LAPTOP_INVENTORY_URL);

    const csvUrl = `${LAPTOP_INVENTORY_URL}&timestamp=${Date.now()}`;
    const response = await fetch(csvUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
        "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }

    const csvText = await response.text();
    console.log("CSV text length:", csvText.length);

    // Check if we got HTML instead of CSV
    if (csvText.includes("<!DOCTYPE") || csvText.includes("<html")) {
      throw new Error(
        "Received HTML instead of CSV. The Google Sheet may not be published to the web."
      );
    }

    // Parse CSV data
    const lines = csvText.split("\n").filter((line) => line.trim());
    console.log("Parsed lines:", lines.length);

    if (lines.length < 2) {
      return NextResponse.json({
        success: false,
        error: "No data found in CSV",
        data: [],
      });
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);
    console.log("Headers:", headers);

    // Parse data rows
    const laptops = [];
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);

      // Skip empty rows or rows without laptop ID
      if (
        columns.length === 0 ||
        !columns.some((col) => col?.trim()) ||
        !columns[3] || // LAPTOP ID
        columns[3].trim() === ""
      ) {
        continue;
      }

      laptops.push({
        dateBought: columns[0] || "",
        account: columns[1] || "",
        bitlocker: columns[2] || "",
        laptopId: columns[3] || "",
        brand: columns[4] || "",
        status: columns[5] || "",
        handler: columns[6] || "", // Owner
        prevHandler: columns[7] || "",
        // Anydesk is columns[8] - we skip it
        laptopSn: columns[9] || "",
        laptopModel: columns[10] || "",
        chargerModel: columns[11] || "",
        chargerSn: columns[12] || "",
        chargerBrand: columns[13] || "",
        mouseBrand: columns[14] || "",
        mouseModel: columns[15] || "",
        mouseSn: columns[16] || "",
        headsetBrand: columns[17] || "",
        headsetModel: columns[18] || "",
        headsetSn: columns[19] || "",
        backpack: columns[20] || "",
        pwVersion: columns[21] || "",
        repaired: columns[22] || "",
        ram: columns[23] || "",
        teamViewer: columns[24] || "",
        replacedItem: columns[25] || "",
      });
    }

    console.log("Parsed laptops:", laptops.length);

    // Calculate summary
    const summary = {
      totalLaptops: laptops.length,
      activeLaptops: laptops.filter((l) => l.status === "Active").length,
      inactiveLaptops: laptops.filter((l) => l.status === "Inactive").length,
      temporaryLaptops: laptops.filter((l) => l.status === "Temporary").length,
      vacantLaptops: laptops.filter((l) => l.status === "Vacant").length,
      brands: {} as Record<string, number>,
    };

    // Count by brand
    laptops.forEach((laptop) => {
      if (laptop.brand) {
        summary.brands[laptop.brand] = (summary.brands[laptop.brand] || 0) + 1;
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        laptops,
        summary,
      },
    });
  } catch (error) {
    console.error("Error fetching laptop inventory:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch laptop inventory data",
        data: { laptops: [], summary: {} },
      },
      { status: 500 }
    );
  }
}

