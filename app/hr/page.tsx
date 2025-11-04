"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { EyeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [subDeptScoresSheet, setSubDeptScoresSheet] = useState<
    Array<{ subDept: string; score: number }>
  >([]);
  const [summary, setSummary] = useState<{
    total?: number;
    complete?: number;
    incomplete?: number;
    ratePct?: number;
  } | null>(null);
  const [showSubDeptScores, setShowSubDeptScores] = useState(false);
  const [showSubDeptModal, setShowSubDeptModal] = useState(false);
  const [dashboardDate, setDashboardDate] = useState<string | null>(null);

  // HR Dashboard CSV URL - use gid to fetch Dashboard sheet specifically
  // The Dashboard sheet contains the summary values in Column B (labels) and Column C (values)
  const HR_DASHBOARD_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUUgA13D4kJNNDEN6DmsJDO1EqDT29U8RBusME4ra-pmy2RYqynOYLLz1LO21UI2WmiwSzaaDsxZ8f/pub?gid=1634851984&single=true&output=csv";
  
  // HR Data CSV URL - fetch Data sheet for chart calculations
  // This sheet contains the actual commitment data with dates and status
  const HR_DATA_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUUgA13D4kJNNDEN6DmsJDO1EqDT29U8RBusME4ra-pmy2RYqynOYLLz1LO21UI2WmiwSzaaDsxZ8f/pub?gid=1443822639&single=true&output=csv";
  
  // HR Score Card CSV URL - fetch Score Card sheet specifically
  const HR_SCORECARD_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTUUgA13D4kJNNDEN6DmsJDO1EqDT29U8RBusME4ra-pmy2RYqynOYLLz1LO21UI2WmiwSzaaDsxZ8f/pub?gid=1871520825&single=true&output=csv";

  const [scoreRows, setScoreRows] = useState<any[]>([]);
  const [scoreSearchTerm, setScoreSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${HR_DASHBOARD_CSV_URL}&ts=${Date.now()}`, {
          cache: "no-store",
          headers: { Accept: "text/csv" },
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const csv = await res.text();
        const lines = csv.split("\n").filter((l) => l.trim());
        if (lines.length < 2) {
          setRows([]);
          return;
        }
        // Build parsed lines for label scanning
        const parsedLines = lines.map((ln) => parseCSVLine(ln));

        // Extract date from Column C (index 2) in Dashboard sheet
        // Look for date values in Column C, especially near "Count of Commitment" section
        // First, find the row with "Count of Commitment" in Column B
        let foundDate: string | null = null;
        let commitmentRowIndex = -1;
        
        // Find the row containing "Count of Commitment" in Column B
        for (let i = 0; i < Math.min(parsedLines.length, 100); i++) {
          const cols = parsedLines[i];
          if (cols.length > 1) {
            const colB = (cols[1] || "").trim().toLowerCase();
            if (colB.includes("count of commitment") && colB !== "count of complete commitments" && colB !== "count of incomplete commitments") {
              commitmentRowIndex = i;
              break;
            }
          }
        }
        
        // If found, look for date in Column C around that row (check rows above and at the same row)
        if (commitmentRowIndex >= 0) {
          // Check the row itself and 3 rows above
          for (let offset = -3; offset <= 0; offset++) {
            const checkRow = commitmentRowIndex + offset;
            if (checkRow >= 0 && checkRow < parsedLines.length) {
              const checkCols = parsedLines[checkRow];
              if (checkCols.length > 2) {
                const colC = (checkCols[2] || "").trim();
                if (colC) {
                  // Check if it looks like a date (contains date patterns)
                  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
                  if (datePattern.test(colC)) {
                    // Try to parse as date to validate
                    const testDate = new Date(colC);
                    if (!isNaN(testDate.getTime()) && testDate.getFullYear() >= 2000 && testDate.getFullYear() <= 2100) {
                      // Format the date nicely
                      const formattedDate = testDate.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      });
                      foundDate = formattedDate;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
        
        // Fallback: if not found near "Count of Commitment", search first 30 rows
        if (!foundDate) {
          for (let i = 0; i < Math.min(parsedLines.length, 30); i++) {
            const cols = parsedLines[i];
            if (cols.length > 2) {
              const colC = (cols[2] || "").trim();
              if (colC) {
                const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/;
                if (datePattern.test(colC)) {
                  const testDate = new Date(colC);
                  if (!isNaN(testDate.getTime()) && testDate.getFullYear() >= 2000 && testDate.getFullYear() <= 2100) {
                    const formattedDate = testDate.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    });
                    foundDate = formattedDate;
                    break;
                  }
                }
              }
            }
          }
        }
        
        if (foundDate) {
          setDashboardDate(foundDate);
        }

        // Extract Commitment Score per Sub-Department directly from sheet
        const foundSubDepts: Array<{ subDept: string; score: number }> = [];
        const seenSubDept = new Set<string>();
        const pctToNum = (s: string) => {
          const n = parseFloat((s || "").replace(/[^0-9.]/g, ""));
          return isNaN(n) ? undefined : n;
        };
        parsedLines.forEach((arr) => {
          for (let i = 0; i < arr.length; i++) {
            const left = (arr[i - 1] || "").trim();
            const cur = (arr[i] || "").trim();
            const right = (arr[i + 1] || "").trim();
            // Pattern: [label][percent]
            if (cur && /%/.test(right)) {
              const val = pctToNum(right);
              if (val !== undefined && cur && !cur.match(/^[0-9.]+$/)) {
                const key = cur.toLowerCase();
                if (!seenSubDept.has(key) && val > 0 && val <= 100) {
                  seenSubDept.add(key);
                  foundSubDepts.push({ subDept: cur, score: val });
                }
              }
            }
            // Pattern: [percent][label]
            if (/%/.test(cur) && left) {
              const val = pctToNum(cur);
              if (val !== undefined && left && !left.match(/^[0-9.]+$/)) {
                const key = left.toLowerCase();
                if (!seenSubDept.has(key) && val > 0 && val <= 100) {
                  seenSubDept.add(key);
                  foundSubDepts.push({ subDept: left, score: val });
                }
              }
            }
          }
        });
        if (foundSubDepts.length > 0) {
          foundSubDepts.sort((a, b) => b.score - a.score);
          setSubDeptScoresSheet(foundSubDepts);
        }

        // Extract Dashboard sheet summary by robust label search
        // Structure: Column B has labels, Column C has values
        const normalizeText = (s: string) =>
          s.replace(/\s+/g, " ").trim().toLowerCase();
        
        // Find values in Column C when Column B contains the label
        // Structure: Column B = label, Column C = value (same row)
        const getValueInColumnC = (label: string): string | null => {
          const labelLc = normalizeText(label);
          // Search first 100 rows for the summary section
          for (let i = 0; i < Math.min(parsedLines.length, 100); i++) {
            const arr = parsedLines[i];
            if (arr.length > 2) {
              const colB = normalizeText(arr[1] || ""); // Column B (index 1)
              const colC = (arr[2] || "").trim(); // Column C (index 2)
              
              // Match the label in Column B (exact or contains)
              if (colB && (colB === labelLc || colB.includes(labelLc) || labelLc.includes(colB))) {
                // Check if Column C has a value
                if (colC && colC !== "" && colC !== "-") {
                  // Return the value if it looks like a number or percentage
                  if (/[\d.%]/.test(colC)) {
                    console.log(`Found ${label} in row ${i}: Column B="${arr[1]}", Column C="${colC}"`);
                    return colC;
                  }
                }
              }
            }
          }
          console.log(`Could not find ${label} in Column B`);
          return null;
        };
        
        // Also try to find values to the right of labels (fallback)
        const getValueAfterLabel = (label: string): string | null => {
          const labelLc = normalizeText(label);
          for (let i = 0; i < Math.min(parsedLines.length, 100); i++) {
            const arr = parsedLines[i];
            for (let j = 0; j < arr.length; j++) {
              const cell = normalizeText(arr[j] || "");
              if (!cell) continue;
              if (
                cell === labelLc ||
                cell.startsWith(labelLc) ||
                cell.includes(labelLc)
              ) {
                // Find the next non-empty cell to the right as the value
                for (let k = j + 1; k < Math.min(j + 5, arr.length); k++) {
                  const candidate = (arr[k] || "").trim();
                  if (candidate) return candidate;
                }
              }
            }
          }
          return null;
        };
        
        // Try Column C first (more reliable), then fallback to after label
        const totalStr = getValueInColumnC("Count of Commitment") || getValueAfterLabel("Count of Commitment");
        const completeStr = getValueInColumnC("Count of Complete Commitments") || getValueAfterLabel("Count of Complete Commitments");
        const incompleteStr = getValueInColumnC("Count of Incomplete Commitments") || getValueAfterLabel("Count of Incomplete Commitments");
        const rateStr = getValueInColumnC("Commitment Rate to the Primary WIG") || getValueAfterLabel("Commitment Rate to the Primary WIG");
        
        const toNum = (s: string | null): number | undefined => {
          if (!s) return undefined;
          // Remove all non-numeric characters except decimal point and percent
          const cleaned = s.replace(/[^0-9.%]/g, "");
          const n = parseFloat(cleaned.replace(/%/g, ""));
          return isNaN(n) ? undefined : n;
        };
        
        // Extract parsed numbers
        const extractedTotal = toNum(totalStr);
        const extractedComplete = toNum(completeStr);
        const extractedIncomplete = toNum(incompleteStr);
        const extractedRate = toNum(rateStr);
        
        // Always set summary - use extracted values if found, otherwise undefined
        // This ensures Dashboard sheet values take priority over calculated values
        setSummary({
          total: extractedTotal,
          complete: extractedComplete,
          incomplete: extractedIncomplete,
          ratePct: extractedRate,
        });
        
        // Debug logging to help troubleshoot
        console.log("=== HR Dashboard Summary Extraction ===");
        console.log("Raw extracted strings:", {
          totalStr,
          completeStr,
          incompleteStr,
          rateStr,
        });
        console.log("Parsed numbers:", {
          total: extractedTotal,
          complete: extractedComplete,
          incomplete: extractedIncomplete,
          ratePct: extractedRate,
        });
        console.log("First 15 rows (Column B and C):", parsedLines.slice(0, 15).map((arr, idx) => ({
          row: idx,
          colB: (arr[1] || "").trim(),
          colC: (arr[2] || "").trim(),
        })));
        
        // If we found extracted values, log them
        if (extractedTotal !== undefined || extractedComplete !== undefined || 
            extractedIncomplete !== undefined || extractedRate !== undefined) {
          console.log("✓ Using extracted Dashboard sheet values:", {
            total: extractedTotal,
            complete: extractedComplete,
            incomplete: extractedIncomplete,
            ratePct: extractedRate,
          });
        } else {
          console.warn("⚠ No Dashboard sheet values found - will use calculated values");
        }
        console.log("=== End Extraction ===");

        // Extract data rows - only process rows that have actual data
        // Skip the summary section at the top (first ~20 rows might contain summary)
        const header = parsedLines[0];
        const data: any[] = [];
        
        // Start from row 1 (after header), but skip summary rows
        // Look for rows that have "Session Date" or actual data columns
        let dataStartRow = 1;
        
        // Try to find where actual data starts (look for "Session Date" header or data-like rows)
        for (let i = 1; i < Math.min(parsedLines.length, 30); i++) {
          const cols = parsedLines[i];
          const firstCol = (cols[0] || "").trim().toLowerCase();
          // If we find a date-like value in first column, this might be a data row
          if (firstCol && /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/.test(firstCol)) {
            dataStartRow = i;
            break;
          }
          // Or if we find "session date" in header, data starts after header
          if (header && header.length > 0) {
            const headerLower = header[0].toLowerCase();
            if (headerLower.includes("session date") || headerLower.includes("date")) {
              dataStartRow = 1;
              break;
            }
          }
        }
        
        for (let i = dataStartRow; i < parsedLines.length; i++) {
          const cols = parsedLines[i];
          // Filter out empty rows - check if row has meaningful data
          const hasData = cols.some((c) => c && c.trim());
          if (!hasData) continue;
          
          const obj: any = {};
          header.forEach(
            (h, idx) => (obj[h.trim()] = (cols[idx] || "").trim())
          );
          // Only add rows that have at least one meaningful field filled
          // Exclude rows that look like summary rows (only contain numbers or percentages)
          const hasMeaningfulData = Object.values(obj).some(
            (v: any) => {
              const val = String(v).trim();
              return val && 
                     val !== "-" && 
                     !(/^[\d.%]+$/.test(val)) && // Not just numbers/percentages
                     val.length > 1; // More than a single character
            }
          );
          // Also include rows that have a date (Session Date column)
          const hasDate = obj["Session Date"] || obj["Date"] || obj["session date"];
          if (hasMeaningfulData || hasDate) {
            data.push(obj);
          }
        }
        // Also fetch Data sheet for chart calculations (if different from Dashboard)
        // Try fetching Data sheet for richer data
        let finalDataRows = data;
        try {
          const resData = await fetch(
            `${HR_DATA_CSV_URL}&ts=${Date.now()}`,
            {
              cache: "no-store",
              headers: { Accept: "text/csv" },
            }
          );
          if (resData.ok) {
            const csvData = await resData.text();
            const linesData = csvData.split("\n").filter((l) => l.trim());
            if (linesData.length >= 2) {
              const headerData = parseCSVLine(linesData[0]);
              const dataRows: any[] = [];
              for (let i = 1; i < linesData.length; i++) {
                const colsData = parseCSVLine(linesData[i]);
                if (!colsData.some((c) => c && c.trim())) continue;
                const objData: any = {};
                headerData.forEach(
                  (h, idx) => (objData[h.trim()] = (colsData[idx] || "").trim())
                );
                // Only add rows with meaningful data
                const hasData = Object.values(objData).some(
                  (v: any) => v && String(v).trim() && String(v).trim() !== "-"
                );
                if (hasData) {
                  dataRows.push(objData);
                }
              }
              // Use Data sheet rows if we got valid data, otherwise use Dashboard rows
              if (dataRows.length > 0) {
                finalDataRows = dataRows;
                console.log(`Loaded ${dataRows.length} rows from Data sheet for charts`);
              } else {
                console.log("Data sheet had no valid rows, using Dashboard sheet rows");
              }
            }
          }
        } catch (e) {
          // If Data sheet fetch fails, use Dashboard sheet rows
          console.log("Using Dashboard sheet rows for charts");
        }
        
        // Set the final rows
        setRows(finalDataRows);
        
        // Don't set scoreRows here - we'll fetch Score Card sheet separately
        
        // Fetch Score Card sheet for the Score Card tab table
        try {
          const resScore = await fetch(
            `${HR_SCORECARD_CSV_URL}&ts=${Date.now()}`,
            {
              cache: "no-store",
              headers: { Accept: "text/csv" },
            }
          );
          if (resScore.ok) {
            const csvS = await resScore.text();
            const linesS = csvS.split("\n").filter((l) => l.trim());
            if (linesS.length >= 2) {
              // Find the header row by scanning for known labels
              // Headers are typically in rows 3-4 (0-indexed: 2-3)
              let headerIndex = 0;
              let headS: string[] = [];
              
              // Try to find header row with "TOP LEVEL", "MID LEVEL", "LEAD STATEMENT"
              for (let i = 0; i < Math.min(linesS.length, 10); i++) {
                const cols = parseCSVLine(linesS[i]);
                const joined = cols.join("|").toLowerCase();
                if (
                  joined.includes("top level") &&
                  joined.includes("mid level") &&
                  joined.includes("lead statement")
                ) {
                  headerIndex = i;
                  headS = cols;
                  break;
                }
              }
              
              // If not found, try looking for "Accomplished Commitments" or "Count of Commitment"
              if (headS.length === 0) {
                for (let i = 0; i < Math.min(linesS.length, 10); i++) {
                  const cols = parseCSVLine(linesS[i]);
                  const joined = cols.join("|").toLowerCase();
                  if (
                    joined.includes("lead statement") &&
                    (joined.includes("accomplished commitments") ||
                      joined.includes("count of commitment") ||
                      joined.includes("count of incomplete"))
                  ) {
                    headerIndex = i;
                    headS = cols;
                    break;
                  }
                }
              }
              
              // Fallback to first row
              if (headS.length === 0) {
                headS = parseCSVLine(linesS[0]);
              }
              
              const dataS: any[] = [];
              for (let i = headerIndex + 1; i < linesS.length; i++) {
                const colsS = parseCSVLine(linesS[i]);
                // Skip empty rows
                if (!colsS.some((c) => c && c.trim())) continue;
                
                // Skip rows that look like headers (all caps or contain "TOP LEVEL", etc.)
                const firstCol = (colsS[0] || "").trim().toLowerCase();
                if (firstCol.includes("top level") || firstCol.includes("mid level")) {
                  continue;
                }
                
                const objS: any = {};
                headS.forEach(
                  (h, idx) => (objS[h.trim()] = (colsS[idx] || "").trim())
                );
                
                // Only add rows that have at least TOP LEVEL or LEAD STATEMENT
                if (objS["TOP LEVEL"] || objS["LEAD STATEMENT"] || 
                    objS["Top Level"] || objS["Lead Statement"]) {
                  dataS.push(objS);
                }
              }
              console.log(`Loaded ${dataS.length} Score Card rows from sheet`);
              setScoreRows(dataS);
            }
          }
        } catch (e) {
          // If Score Card sheet fetch fails, use data rows as fallback
          console.warn("Failed to fetch Score Card sheet, using data rows:", e);
          setScoreRows(data);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  const dashboardData = useMemo(() => {
    if (!rows || rows.length === 0) {
      return {
        totalCommitments: 0,
        completeCommitments: 0,
        incompleteCommitments: 0,
        commitmentRate: 0,
        subDeptScores: [] as Array<{ subDept: string; score: number }>,
        weeklyTrend: [] as Array<{
          week: string;
          total: number;
          completed: number;
        }>,
      };
    }

    const normalize = (s: string | undefined) => (s || "").trim();
    const statusOf = (r: any) =>
      normalize(r["Status"]) ||
      normalize(r["status"]) ||
      normalize(r["STATUS"]) ||
      "";
    const subDeptOf = (r: any) =>
      normalize(r["Sub-Department (Dropdown)"]) ||
      normalize(r["Sub-Department"]) ||
      normalize(r["Sub-Department (Dropdown)"]) ||
      "Not applicable";
    const dateOf = (r: any) =>
      normalize(r["Session Date"]) || 
      normalize(r["Date"]) || 
      normalize(r["session date"]) ||
      normalize(r["DATE"]) ||
      normalize(r["SessionDate"]) ||
      "";

    // Filter valid rows - must have at least one meaningful field
    const valid = rows.filter((r: any) => {
      const hasSubDept = subDeptOf(r) && subDeptOf(r) !== "Not applicable";
      const hasStatus = statusOf(r) && statusOf(r) !== "";
      const hasLeadStatement = normalize(r["Lead Statement"]) && normalize(r["Lead Statement"]) !== "";
      const hasDate = dateOf(r) && dateOf(r) !== "";
      const hasCommitment = normalize(r["Commitment"]) && normalize(r["Commitment"]) !== "";
      
      return hasSubDept || hasStatus || hasLeadStatement || hasDate || hasCommitment;
    });
    const totalCommitments = valid.length;
    const completeCommitments = valid.filter(
      (r) => statusOf(r).toLowerCase() === "completed"
    ).length;
    const incompleteCommitments = totalCommitments - completeCommitments;
    const commitmentRate =
      totalCommitments > 0
        ? Math.round((completeCommitments / totalCommitments) * 1000) / 10
        : 0;

    // Sub-Department scores
    const subDeptMap = new Map<string, { total: number; complete: number }>();

    valid.forEach((r) => {
      const sd = subDeptOf(r);
      // Skip entries without a meaningful sub-department
      if (!sd || sd === "Not applicable" || sd.trim() === "") {
        // Only include if they have other meaningful data
        if (!normalize(r["Lead Statement"]) && !statusOf(r)) {
          return;
        }
      }
      const completed = statusOf(r).toLowerCase() === "completed" ? 1 : 0;
      const subDeptKey = sd || "Not applicable";
      const sdd = subDeptMap.get(subDeptKey) || { total: 0, complete: 0 };
      sdd.total += 1;
      sdd.complete += completed;
      subDeptMap.set(subDeptKey, sdd);
    });

    const toPct = (x: { total: number; complete: number }) =>
      x.total > 0 ? Math.round((x.complete / x.total) * 1000) / 10 : 0;
    const subDeptScoresComputed = Array.from(subDeptMap.entries())
      .map(([subDept, agg]) => ({ subDept, score: toPct(agg) }))
      .filter((item) => item.subDept && item.subDept !== "Not applicable" && item.subDept.trim() !== "")
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
    
    console.log("Sub-Department scores computed:", subDeptScoresComputed);
    console.log("Total valid rows for charts:", valid.length);

    // Weekly trend
    const weekMap = new Map<string, { total: number; completed: number }>();
    let datesProcessed = 0;
    let datesFailed = 0;
    
    valid.forEach((r) => {
      const raw = dateOf(r);
      if (!raw || raw.trim() === "") {
        datesFailed++;
        return;
      }
      
      // Try parsing different date formats
      let dt: Date | null = null;
      
      // First try direct parsing
      dt = new Date(raw);
      if (!isNaN(dt.getTime()) && dt.getFullYear() >= 2000 && dt.getFullYear() <= 2100) {
        datesProcessed++;
      } else {
        // Try parsing as MM/DD/YYYY or DD/MM/YYYY
        const parts = raw.trim().split(/[\/\-]/);
        if (parts.length === 3) {
          const year = parseInt(parts[2]);
          const month = parseInt(parts[0]);
          const day = parseInt(parts[1]);
          
          // Try MM/DD/YYYY first (assuming 2-digit year means 2000s)
          if (year >= 2000 || (year < 100 && year >= 0)) {
            const fullYear = year < 100 ? 2000 + year : year;
            dt = new Date(fullYear, month - 1, day);
            if (isNaN(dt.getTime()) || dt.getFullYear() !== fullYear) {
              // Try DD/MM/YYYY
              dt = new Date(fullYear, day - 1, month);
              if (isNaN(dt.getTime()) || dt.getFullYear() !== fullYear) {
                dt = null;
              }
            }
          }
        }
        
        if (dt && !isNaN(dt.getTime()) && dt.getFullYear() >= 2000 && dt.getFullYear() <= 2100) {
          datesProcessed++;
        } else {
          datesFailed++;
          return;
        }
      }
      
      if (!dt || isNaN(dt.getTime())) {
        datesFailed++;
        return;
      }
      
      const wk = getISOWeek(dt);
      const key = `${dt.getFullYear()}-W${String(wk).padStart(2, "0")}`;
      const cur = weekMap.get(key) || { total: 0, completed: 0 };
      cur.total += 1;
      if (statusOf(r).toLowerCase() === "completed") cur.completed += 1;
      weekMap.set(key, cur);
    });
    
    const weeklyTrend = Array.from(weekMap.entries())
      .map(([k, v]) => ({ week: k, total: v.total, completed: v.completed }))
      .sort((a, b) => (a.week < b.week ? -1 : 1));
    
    console.log("Weekly trend computed:", {
      trend: weeklyTrend,
      datesProcessed,
      datesFailed,
      totalRows: valid.length,
      sampleDates: valid.slice(0, 5).map(r => ({ date: dateOf(r), status: statusOf(r) }))
    });

    return {
      totalCommitments,
      completeCommitments,
      incompleteCommitments,
      commitmentRate,
      subDeptScores: subDeptScoresSheet.length
        ? subDeptScoresSheet
        : subDeptScoresComputed,
      weeklyTrend,
    };
  }, [rows, subDeptScoresSheet]);

  function getISOWeek(date: Date): number {
    const tmp = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    return Math.ceil(
      ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                HR Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-900">
                WIG tracking and scorecard
                {dashboardDate && (
                  <span className="ml-2 text-gray-600">
                    • Last updated: {dashboardDate}
                  </span>
                )}
              </p>
            </div>
            <a
              href="https://docs.google.com/spreadsheets/d/e/2PACX-1vTUUgA13D4kJNNDEN6DmsJDO1EqDT29U8RBusME4ra-pmy2RYqynOYLLz1LO21UI2WmiwSzaaDsxZ8f/pubhtml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View Sheet
            </a>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "dashboard"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("scorecard")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "scorecard"
                    ? "border-emerald-500 text-emerald-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Score Card
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "scorecard" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-gray-900 overflow-hidden">
            {/* Header Section */}
            <div className="px-8 pt-8 pb-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Score Card
              </h2>
              <p className="text-sm text-gray-600">
                Track WIG commitments and accomplishment rates
              </p>
            </div>

            {/* Search Bar */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="relative max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by top level, mid level, or lead statement..."
                  value={scoreSearchTerm}
                  onChange={(e) => setScoreSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                />
              </div>
            </div>

            {/* Table Section */}
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="w-full min-w-[1200px] text-sm">
                <colgroup>
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "16%" }} />
                </colgroup>
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 tracking-wide">
                      TOP LEVEL
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 tracking-wide">
                      MID LEVEL
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 tracking-wide">
                      LEAD STATEMENT
                    </th>
                    <th className="text-center py-3 px-6 font-semibold text-gray-700 tracking-wide">
                      Commitments
                    </th>
                    <th className="text-center py-3 px-6 font-semibold text-gray-700 tracking-wide">
                      Incomplete
                    </th>
                    <th className="text-center py-3 px-6 font-semibold text-gray-700 tracking-wide">
                      Rate
                    </th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700 tracking-wide">
                      IN PROGRESS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {(() => {
                    const filteredRows = scoreRows.filter((r) => {
                      if (!scoreSearchTerm.trim()) return true;
                      const searchLower = scoreSearchTerm.toLowerCase();
                      const get = (keys: string[]) =>
                        keys
                          .map((k) => r[k])
                          .find(
                            (v) =>
                              v !== undefined &&
                              v !== null &&
                              String(v).trim() !== ""
                          ) || "";
                      const top = get(["TOP LEVEL", "Top Level", "TOP LEVEL "]);
                      const mid = get(["MID LEVEL", "Mid Level", "MID LEVEL "]);
                      const lead = get(["LEAD STATEMENT", "Lead Statement"]);
                      return (
                        top.toLowerCase().includes(searchLower) ||
                        mid.toLowerCase().includes(searchLower) ||
                        lead.toLowerCase().includes(searchLower)
                      );
                    });

                    if (filteredRows.length === 0) {
                      return (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-16 text-center text-gray-500"
                          >
                            {scoreRows.length === 0
                              ? "No score card data"
                              : "No results match your search"}
                          </td>
                        </tr>
                      );
                    }

                    return filteredRows.map((r, idx) => {
                      const get = (keys: string[]) =>
                        keys
                          .map((k) => r[k])
                          .find(
                            (v) =>
                              v !== undefined &&
                              v !== null &&
                              String(v).trim() !== ""
                          ) || "";
                      const top = get(["TOP LEVEL", "Top Level", "TOP LEVEL "]);
                      const mid = get(["MID LEVEL", "Mid Level", "MID LEVEL "]);
                      const lead = get(["LEAD STATEMENT", "Lead Statement"]);
                      const countCommit = get([
                        "Count of Commitment",
                        "Count of Commitments",
                        "Count of Commitment ",
                      ]);
                      const countIncomplete = get([
                        "Count of Incomplete",
                        "Count of Incomplete Commitments",
                      ]);
                      const rate = get([
                        "Accomplished Commitments",
                        "Accomplished Commitments ",
                        "Accomplishment Rate",
                        "Accomplishment Rate ",
                      ]);
                      const inProgress = get([
                        'LIST OF COMMITMENT "IN PROGRESS"',
                        "LIST OF COMMITMENT IN PROGRESS",
                      ]);
                      const rateNum = (() => {
                        const n = parseFloat(
                          String(rate).replace(/[^0-9.]/g, "")
                        );
                        return isNaN(n) ? 0 : n;
                      })();
                      const rateClass =
                        rateNum >= 90
                          ? "bg-emerald-100 text-emerald-700"
                          : rateNum >= 70
                          ? "bg-blue-100 text-blue-700"
                          : rateNum >= 50
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700";

                      return (
                        <tr
                          key={idx}
                          className="hover:bg-blue-50 transition-colors"
                        >
                          <td
                            className="py-2 px-6 align-top whitespace-nowrap text-gray-700 font-medium max-w-[160px] truncate"
                            title={String(top)}
                          >
                            {top || "—"}
                          </td>
                          <td
                            className="py-2 px-6 align-top whitespace-nowrap text-gray-700 font-medium max-w-[160px] truncate"
                            title={String(mid)}
                          >
                            {mid || "—"}
                          </td>
                          <td className="py-2 px-6 align-top text-gray-900">
                            <div
                              className="leading-snug line-clamp-2"
                              title={String(lead)}
                            >
                              {lead || "—"}
                            </div>
                          </td>
                          <td className="py-2 px-6 align-top text-center text-gray-900 font-medium">
                            {countCommit || "—"}
                          </td>
                          <td className="py-2 px-6 align-top text-center text-gray-900 font-medium">
                            {countIncomplete || "—"}
                          </td>
                          <td className="py-2 px-6 align-top text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${rateClass}`}
                            >
                              {rate || "—"}
                            </span>
                          </td>
                          <td className="py-2 px-6 align-top text-gray-700">
                            <div
                              className="leading-snug line-clamp-2 text-xs"
                              title={String(inProgress)}
                            >
                              {inProgress || "—"}
                            </div>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Footer Summary */}
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total: {scoreRows.length} entries
                {scoreSearchTerm.trim() && (
                  <span className="ml-2">
                    | Filtered:{" "}
                    {
                      scoreRows.filter((r) => {
                        const searchLower = scoreSearchTerm.toLowerCase();
                        const get = (keys: string[]) =>
                          keys
                            .map((k) => r[k])
                            .find(
                              (v) =>
                                v !== undefined &&
                                v !== null &&
                                String(v).trim() !== ""
                            ) || "";
                        const top = get([
                          "TOP LEVEL",
                          "Top Level",
                          "TOP LEVEL ",
                        ]);
                        const mid = get([
                          "MID LEVEL",
                          "Mid Level",
                          "MID LEVEL ",
                        ]);
                        const lead = get(["LEAD STATEMENT", "Lead Statement"]);
                        return (
                          top.toLowerCase().includes(searchLower) ||
                          mid.toLowerCase().includes(searchLower) ||
                          lead.toLowerCase().includes(searchLower)
                        );
                      }).length
                    }{" "}
                    match your search
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Loading / Error */}
            {loading && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            )}
            {error && (
              <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
                <div className="text-red-600 text-5xl mb-3">⚠️</div>
                <p className="font-semibold text-gray-900 mb-1">
                  Failed to load data
                </p>
                <p className="text-gray-600">{error}</p>
              </div>
            )}

            {/* Summary Cards */}
            {!loading && !error && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                  <div className="text-sm text-gray-600">Total Commitments</div>
                  <div className="text-3xl font-bold text-gray-900 mt-1">
                    {summary?.total != null ? summary.total : dashboardData.totalCommitments}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="text-3xl font-bold text-green-600 mt-1">
                    {summary?.complete != null ? summary.complete : dashboardData.completeCommitments}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                  <div className="text-sm text-gray-600">Incomplete</div>
                  <div className="text-3xl font-bold text-orange-600 mt-1">
                    {summary?.incomplete != null ? summary.incomplete : dashboardData.incompleteCommitments}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                  <div className="text-sm text-gray-600">Commitment Rate</div>
                  <div className="text-3xl font-bold text-purple-600 mt-1">
                    {summary?.ratePct != null ? `${summary.ratePct}%` : `${dashboardData.commitmentRate}%`}
                  </div>
                </div>
              </div>
            )}

            {/* Charts */}
            {!loading && !error && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Commitment Score per Sub-Department
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Completion %
                      </span>
                      <button
                        onClick={() => setShowSubDeptModal(true)}
                        className="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center gap-1 transition-colors"
                        aria-label="See Sub-Department Scores"
                      >
                        <EyeIcon className="w-5 h-5 text-blue-700" />
                        <span className="text-sm font-medium text-blue-700">
                          View
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={dashboardData.subDeptScores}
                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey="subDept"
                          tick={{ fontSize: 10 }}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                          height={60}
                        />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip formatter={(v: any) => `${v}%`} />
                        <Bar
                          dataKey="score"
                          fill="#3B82F6"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Values list with progress bars - shown conditionally */}
                  {showSubDeptScores && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-600">
                            <th className="text-left py-2 pr-2">Rank</th>
                            <th className="text-left py-2 pr-2">Sub-Department</th>
                            <th className="text-left py-2">Progress</th>
                            <th className="text-right py-2 pl-2">Completion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.subDeptScores.map((row, idx) => {
                            const accent =
                              idx < 3 ? "bg-emerald-500" : "bg-blue-500";
                            return (
                              <tr
                                key={idx}
                                className="border-t border-gray-100 hover:bg-gray-50/80 transition-colors"
                              >
                                <td className="py-2 pr-2 text-gray-600 w-12">
                                  <span
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white ${
                                      idx < 3 ? "bg-emerald-500" : "bg-gray-400"
                                    }`}
                                  >
                                    {idx + 1}
                                  </span>
                                </td>
                                <td className="py-2 pr-2 text-gray-900 whitespace-nowrap">
                                  {row.subDept}
                                </td>
                                <td className="py-2 pr-4 w-2/3">
                                  <div className="w-full h-2.5 bg-gray-100 rounded-full">
                                    <div
                                      className={`h-2.5 rounded-full ${accent}`}
                                      style={{
                                        width: `${Math.min(row.score, 100)}%`,
                                      }}
                                    />
                                  </div>
                                </td>
                                <td className="py-2 pl-2 text-right font-semibold text-gray-900">
                                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-900">
                                    {row.score}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Weekly Trend (Total vs Completed)
                    </h3>
                    <span className="text-sm text-gray-500">ISO weeks</span>
                  </div>
                  <div className="h-80">
                    {dashboardData.weeklyTrend && dashboardData.weeklyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dashboardData.weeklyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis 
                            dataKey="week" 
                            tick={{ fontSize: 12 }} 
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#6366F1"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            name="Total"
                          />
                          <Line
                            type="monotone"
                            dataKey="completed"
                            stroke="#22C55E"
                            strokeWidth={3}
                            dot={{ r: 4 }}
                            name="Completed"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <p className="text-sm">No weekly trend data available</p>
                          <p className="text-xs mt-2">Ensure rows have valid dates in "Session Date" column</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-Department Scores Modal */}
            {showSubDeptModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                  <div
                    className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
                    onClick={() => setShowSubDeptModal(false)}
                  ></div>

                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-emerald-50 to-emerald-100 rounded-t-2xl">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Sub-Department Scores
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Completion percentage by sub-department
                        </p>
                      </div>
                      <button
                        onClick={() => setShowSubDeptModal(false)}
                        className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                        aria-label="Close"
                      >
                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-auto p-6">
                      <div className="mb-6 h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={dashboardData.subDeptScores}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#E5E7EB"
                            />
                            <XAxis
                              dataKey="subDept"
                              tick={{ fontSize: 10 }}
                              angle={-25}
                              textAnchor="end"
                              interval={0}
                              height={60}
                            />
                            <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                            <Tooltip formatter={(v: any) => `${v}%`} />
                            <Bar
                              dataKey="score"
                              fill="#10B981"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">
                              Rank
                            </th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">
                              Sub-Department
                            </th>
                            <th className="text-left py-2 px-4 font-semibold text-gray-700">
                              Progress
                            </th>
                            <th className="text-right py-2 px-4 font-semibold text-gray-700">
                              Completion
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.subDeptScores.map((row, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-2 px-4 text-gray-600">
                                {idx + 1}
                              </td>
                              <td className="py-2 px-4 text-gray-900">
                                {row.subDept}
                              </td>
                              <td className="py-2 px-4">
                                <div className="w-full h-2.5 bg-gray-100 rounded-full">
                                  <div
                                    className="h-2.5 rounded-full bg-emerald-500"
                                    style={{
                                      width: `${Math.min(row.score, 100)}%`,
                                    }}
                                  />
                                </div>
                              </td>
                              <td className="py-2 px-4 text-right font-semibold text-gray-900">
                                {row.score}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
