/**
 * Export data to CSV format
 * @param data - Array of objects to export
 * @param filename - Name of the file to download
 */
export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(","),
    // Data rows
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header] || "";
          // Escape commas and quotes
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export laptops with formatted data
 */
export function exportLaptopsToCSV(laptops: any[]) {
  const formattedData = laptops.map((laptop) => ({
    "Laptop ID": laptop.laptopId,
    Brand: laptop.brand || "",
    Model: laptop.laptopModel || "",
    "Serial Number": laptop.laptopSn || "",
    Status: laptop.status || "",
    "Owner/Handler": laptop.handler || "",
    "Headset": laptop.headsetBrand && laptop.headsetModel
      ? `${laptop.headsetBrand} ${laptop.headsetModel}`
      : laptop.headsetBrand || laptop.headsetModel || "",
    "Mouse": laptop.mouseBrand && laptop.mouseModel
      ? `${laptop.mouseBrand} ${laptop.mouseModel}`
      : laptop.mouseBrand || laptop.mouseModel || "",
    "Charger": laptop.chargerBrand && laptop.chargerModel
      ? `${laptop.chargerBrand} ${laptop.chargerModel}`
      : laptop.chargerBrand || laptop.chargerModel || "",
    "RAM": laptop.ram || "",
    "Date Bought": laptop.dateBought || "",
  }));

  const timestamp = new Date().toISOString().split("T")[0];
  exportToCSV(formattedData, `laptop-inventory-${timestamp}`);
}

