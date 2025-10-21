const https = require("https");

const SHEET_ID = "1qp_5G8qnw_T1AUYMW4zQhgTzSo5kfX8AczOEM6jO-xw";

// Common sheet GIDs to try
const SHEET_GIDS = [
  { name: "Default/First Sheet", gid: "0" },
  { name: "Tracker for WIG Session", gid: "1634851984" },
  { name: "Score Card", gid: "1871520825" },
  { name: "Dashboard", gid: "1871520824" },
  { name: "Data", gid: "1871520823" },
  { name: "Weekly WIG Tracker", gid: "2000000000" },
];

function fetchSheetData(gid, name) {
  return new Promise((resolve) => {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          const lines = data.split("\n").filter((l) => l.trim());

          // Check if it's valid CSV data or error
          if (
            data.includes("<!DOCTYPE") ||
            data.includes("<html") ||
            lines.length === 0
          ) {
            resolve(null);
          } else {
            // Show first few rows
            const preview = lines.slice(0, 8).map((line) => {
              const cols = line.split(",").slice(0, 6);
              return cols.join(" | ");
            });
            resolve({ gid, name, rowCount: lines.length, preview });
          }
        });
      })
      .on("error", () => resolve(null));
  });
}

(async () => {
  console.log("\n📊 FETCHING DATA FROM ALL SHEET TABS...\n");
  console.log("Sheet ID: " + SHEET_ID);
  console.log("=".repeat(100) + "\n");

  for (const sheet of SHEET_GIDS) {
    const result = await fetchSheetData(sheet.gid, sheet.name);

    if (result) {
      console.log(`✅ ${result.name} (GID: ${result.gid})`);
      console.log(`   Total Rows: ${result.rowCount}`);
      console.log(`   Preview (first 8 rows):`);
      result.preview.forEach((line) => console.log(`   ${line}`));
      console.log();
    }
  }

  console.log("\n" + "=".repeat(100));
  console.log(
    "To use a specific tab, update .env.local with the correct GID:\n"
  );
  console.log(
    "NEXT_PUBLIC_PRESIDENT_SHEET_URL=https://docs.google.com/spreadsheets/d/" +
      SHEET_ID +
      "/edit"
  );
  console.log("NEXT_PUBLIC_SHEET_GIDS=<GID_HERE>");
})();
