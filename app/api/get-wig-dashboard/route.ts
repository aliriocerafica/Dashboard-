import { NextRequest, NextResponse } from "next/server";

// Single published document base (provided). We'll target tabs by gid.
const PUBLISHED_DOC_BASE =
  process.env.NEXT_PUBLIC_PUBLISHED_DOC_BASE ||
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu6xGRE5ah-2airOT9EXJePKOMAseMIkyKunz0c7VDpxFCT3He0qSxURfdXXsGFJo-2VQE0cUtm_Sv/pub?output=csv";

// Helper to build a CSV URL for a specific gid within the published document
const buildCsvUrl = (gid: string) =>
  `${PUBLISHED_DOC_BASE}&single=true&gid=${gid}`;

// Sheet ID and Dashboard GID sourced from the "View Original Sheet" link used in the President page
// This allows us to read the computed metrics that the Dashboard tab already calculates
const PRESIDENT_SHEET_ID =
  process.env.NEXT_PUBLIC_PRESIDENT_SHEET_ID ||
  "1qp_5G8qnw_T1AUYMW4zQhgTz5o5kX8AczOEM6jO-xw";
// Published Dashboard tab gid (provided link from user)
const DASHBOARD_GID = process.env.NEXT_PUBLIC_PRESIDENT_DASHBOARD_GID || "1634851984";

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching WIG dashboard data from published base:", PUBLISHED_DOC_BASE);

    // Fetch raw Data sheet rows (cache-busting timestamp)
    const csvUrl = `${buildCsvUrl("1443822639")}&timestamp=${Date.now()}`; // Data tab
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
    console.log("First 200 chars:", csvText.substring(0, 200));

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
        success: true,
        data: {
          summary: {
            totalCommitments: 0,
            completedCommitments: 0,
            incompleteCommitments: 0,
            commitmentRate: 0,
          },
          officeScores: [],
          unitScores: [],
          recentCommitments: [],
          trends: { weeklyCommitments: [], departmentPerformance: [] },
        },
        lastUpdated: new Date().toISOString(),
        source: "WIG Tracker Google Sheet",
        csvLines: lines.length,
        message: "No data in sheet",
      });
    }

    // CSV parsing helpers (quoted fields aware)
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          // Toggle quotes, handle escaped quotes
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === "," && !inQuotes) {
          result.push(current);
          current = "";
        } else {
          current += ch;
        }
      }
      result.push(current);
      return result;
    };

    const headers = parseCSVLine(lines[0]).map((h) => h.trim());

    type Row = {
      sessionDate?: string;
      department?: string;
      subDepartment?: string;
      leadStatement?: string;
      commitment?: string;
      dueDate?: string;
      status?: string;
      month?: string;
      week?: string;
    };

    const rows: Row[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (!cols.length || !cols.some((c) => c?.trim())) continue;

      const row: Row = {};
      headers.forEach((header, idx) => {
        const key = header.toLowerCase();
        const val = (cols[idx] || "").trim();
        if (key.includes("session date") || key === "date") row.sessionDate = val;
        else if (key.startsWith("department")) row.department = val;
        else if (key.includes("sub-department") || key.includes("sub department")) row.subDepartment = val;
        else if (key.includes("lead statement") || key.includes("statement")) row.leadStatement = val;
        else if (key === "commitment") row.commitment = val;
        else if (key.includes("due date") || key === "due") row.dueDate = val;
        else if (key === "status") row.status = val;
        else if (key === "month") row.month = val;
        else if (key === "week") row.week = val;
      });

      // Keep only rows with real data in key fields to avoid inflated counts
      const hasDepartment = !!row.department && row.department.trim().length > 0;
      const hasLeadStatement =
        !!row.leadStatement && row.leadStatement.trim().length > 0;

      if (hasDepartment || hasLeadStatement || (row.sessionDate && row.sessionDate.trim())) {
        rows.push(row);
      }
    }

    // Use only rows that represent real commitments (align with sheet: both Department and Lead Statement)
    const commitmentRows = rows.filter(
      (r) =>
        !!(r.department && r.department.trim()) &&
        !!(r.leadStatement && r.leadStatement.trim())
    );

    // Summary metrics (initially from row-level parsing)
    let totalCommitments = commitmentRows.length;
    let completedCommitments = commitmentRows.filter((r) =>
      (r.status || "").toLowerCase().includes("completed")
    ).length;
    let incompleteCommitments = Math.max(
      0,
      totalCommitments - completedCommitments
    );
    let commitmentRate = totalCommitments
      ? parseFloat(((completedCommitments / totalCommitments) * 100).toFixed(2))
      : 0;

    // Office scores = completion rate per Department
    const officeMap: Record<string, { total: number; done: number }> = {};
    commitmentRows.forEach((r) => {
      const dept = r.department?.trim() || "Unspecified";
      if (!officeMap[dept]) officeMap[dept] = { total: 0, done: 0 };
      officeMap[dept].total += 1;
      if ((r.status || "").toLowerCase().includes("completed")) {
        officeMap[dept].done += 1;
      }
    });
    const officeScores = Object.entries(officeMap)
      .map(([office, { total, done }]) => ({
        office,
        score: total ? parseFloat(((done / total) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    // Unit scores = completion rate per Sub-Department
    const unitMap: Record<string, { total: number; done: number }> = {};
    commitmentRows.forEach((r) => {
      const unit = r.subDepartment?.trim() || r.department?.trim() || "Unspecified";
      if (!unitMap[unit]) unitMap[unit] = { total: 0, done: 0 };
      unitMap[unit].total += 1;
      if ((r.status || "").toLowerCase().includes("completed")) {
        unitMap[unit].done += 1;
      }
    });
    const unitScores = Object.entries(unitMap)
      .map(([unit, { total, done }]) => ({
        unit,
        score: total ? parseFloat(((done / total) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // Recent commitments will be read from Weekly WIG Tracker tab below

    // Weekly trends and recent commitments will be derived from the Weekly WIG Tracker tab for reliability
    let weeklyCommitments: { week: string; commitments: number; completed: number }[] = [];
    let recentCommitments = [] as {
      sessionDate: string;
      department: string;
      leadStatement: string;
      status: string;
      dueDate: string;
    }[];
    try {
      const weeklyCsvUrl = `${buildCsvUrl("1673922593")}&timestamp=${Date.now()}`;
      const weeklyRes = await fetch(weeklyCsvUrl, { cache: "no-store", headers: { Accept: "text/csv" } });
      if (weeklyRes.ok) {
        const weeklyCsv = await weeklyRes.text();
        if (!weeklyCsv.includes("<!DOCTYPE") && !weeklyCsv.includes("<html")) {
          const wLines = weeklyCsv.split("\n").filter((l) => l.trim());
          const wHeaders = parseCSVLine(wLines[0]).map((h) => (h || "").trim().toLowerCase());
          const idx = {
            date: wHeaders.findIndex((h) => h === "session date" || h === "date"),
            dept: wHeaders.findIndex((h) => h.startsWith("department")),
            sub: wHeaders.findIndex((h) => h.startsWith("sub-")),
            lead: wHeaders.findIndex((h) => h.includes("lead statement")),
            commit: wHeaders.findIndex((h) => h === "commitment"),
            due: wHeaders.findIndex((h) => h === "due date" || h === "due"),
            status: wHeaders.findIndex((h) => h === "status"),
            week: wHeaders.findIndex((h) => h === "week"),
          };

          const wRows: any[] = [];
          for (let i = 1; i < wLines.length; i++) {
            const cols = parseCSVLine(wLines[i]);
            if (!cols.length || !cols.some((c) => (c || "").trim())) continue;
            const get = (n: number) => (n >= 0 ? (cols[n] || "").trim() : "");
            wRows.push({
              sessionDate: get(idx.date),
              department: get(idx.dept),
              subDepartment: get(idx.sub),
              leadStatement: get(idx.lead) || get(idx.commit),
              dueDate: get(idx.due),
              status: get(idx.status),
              week: get(idx.week),
            });
          }

          // Weekly aggregation
          const wMap: Record<string, { total: number; done: number }> = {};
          wRows.forEach((r) => {
            const wk = (r.week || "").toString() || "Unknown";
            if (!wMap[wk]) wMap[wk] = { total: 0, done: 0 };
            wMap[wk].total += 1;
            if ((r.status || "").toLowerCase().includes("completed")) wMap[wk].done += 1;
          });
          weeklyCommitments = Object.entries(wMap)
            .map(([week, { total, done }]) => ({ week, commitments: total, completed: done }))
            .sort((a, b) => a.week.localeCompare(b.week));

          // Recent commitments
          const parseDT = (s?: string) => (s ? Date.parse(s) || 0 : 0);
          recentCommitments = [...wRows]
            .sort((a, b) => parseDT(b.sessionDate) - parseDT(a.sessionDate))
            .slice(0, 10)
            .map((r) => ({
              sessionDate: r.sessionDate || "",
              department: r.department || "",
              leadStatement: r.leadStatement || "",
              status: r.status || "",
              dueDate: r.dueDate || "",
            }));
        }
      }
    } catch (e) {
      // ignore; will leave arrays empty
    }

    // Department performance: surface current completion rate per department
    // Map from officeScores so UI shows non-zero percentages
    const departmentPerformance = officeScores.map((o) => ({
      department: o.office,
      // Reuse completion rate as the displayed percentage
      change: o.score,
      // Simple qualitative trend based on thresholds
      trend: o.score >= 60 ? "up" : o.score >= 40 ? "stable" : "down",
    }));

    // Try to override counts and percentages from the Dashboard sheet which contains authoritative metrics
    try {
      // Prefer published CSV endpoint to avoid auth issues
      const dashboardCsvUrl = `${buildCsvUrl(DASHBOARD_GID)}&timestamp=${Date.now()}`; // Dashboard tab
      const dashRes = await fetch(dashboardCsvUrl, { cache: "no-store", headers: { Accept: "text/csv" } });
      if (dashRes.ok) {
        const dashCsv = await dashRes.text();
        if (dashCsv.includes("<!DOCTYPE") || dashCsv.includes("<html")) {
          throw new Error("Dashboard sheet not publicly published; received HTML");
        }
        const dashLines = dashCsv.split("\n");

        // Helper to coerce percentage like 57.96% or 57% into number 57.xx
        const toPercent = (val: string): number | null => {
          const cleaned = (val || "").trim().replace(/%/g, "");
          if (!cleaned) return null;
          const num = parseFloat(cleaned);
          return Number.isFinite(num) ? parseFloat(num.toFixed(2)) : null;
        };

        // Reuse parser to scan each row
        // 1) Count of Commitment
        for (const line of dashLines) {
          const cols = parseCSVLine(line);
          const idx = cols.findIndex(
            (c) => (c || "").trim().toLowerCase() === "count of commitment"
          );
          if (idx !== -1) {
            for (let j = idx + 1; j < cols.length; j++) {
              const raw = (cols[j] || "").trim();
              if (/^\d+(\.\d+)?$/.test(raw)) {
                const n = Math.round(parseFloat(raw));
                if (!Number.isNaN(n) && n > 0) totalCommitments = n;
                break;
              }
            }
            break;
          }
        }

        // 2) Completed and Incomplete Commitments
        for (const line of dashLines) {
          const cols = parseCSVLine(line);
          const lower = cols.map((c) => (c || "").trim().toLowerCase());
          const completedIdx = lower.findIndex(
            (c) => c === "count of complete commitments"
          );
          if (completedIdx !== -1) {
            for (let j = completedIdx + 1; j < cols.length; j++) {
              const raw = (cols[j] || "").trim();
              if (/^\d+(\.\d+)?$/.test(raw)) {
                const n = Math.round(parseFloat(raw));
                if (!Number.isNaN(n)) completedCommitments = n;
                break;
              }
            }
          }

          const incompleteIdx = lower.findIndex(
            (c) => c === "count of incomplete commitments"
          );
          if (incompleteIdx !== -1) {
            for (let j = incompleteIdx + 1; j < cols.length; j++) {
              const raw = (cols[j] || "").trim();
              if (/^\d+(\.\d+)?$/.test(raw)) {
                const n = Math.round(parseFloat(raw));
                if (!Number.isNaN(n)) incompleteCommitments = n;
                break;
              }
            }
          }
        }

        // 3) Commitment Rate to the Primary WIG
        for (const line of dashLines) {
          const cols = parseCSVLine(line);
          const idx = cols.findIndex(
            (c) =>
              (c || "").trim().toLowerCase() ===
              "commitment rate to the primary wig"
          );
          if (idx !== -1) {
            for (let j = idx + 1; j < cols.length; j++) {
              const p = toPercent(cols[j] || "");
              if (p !== null) {
                // override commitmentRate with Dashboard value
                commitmentRate = p;
                break;
              }
            }
            break;
          }
        }

        // 4) Commitment Score Per Office table
        const officeScoresFromDash: { office: string; score: number }[] = [];
        let inOfficeTable = false;
        for (const line of dashLines) {
          const cols = parseCSVLine(line);
          const joined = cols.map((c) => (c || "").trim().toLowerCase()).join(" ");
          if (!inOfficeTable && joined.includes("commitment score per office")) {
            inOfficeTable = true;
            continue;
          }
          if (inOfficeTable) {
            // Expect label in one col and % in another; find first % value
            const percentIndex = cols.findIndex((c) => /%\s*$/.test((c || "").trim()));
            if (percentIndex !== -1) {
              const pct = toPercent(cols[percentIndex] || "");
              const nameCols = cols.slice(0, percentIndex).filter((c) => (c || "").trim());
              const name = (nameCols[nameCols.length - 1] || "").trim();
              if (name && pct !== null) {
                officeScoresFromDash.push({ office: name, score: pct });
              }
            } else if (cols.every((c) => !(c || "").trim())) {
              // blank row ends table
              break;
            }
          }
        }
        if (officeScoresFromDash.length > 0) {
          officeScores.splice(0, officeScores.length, ...officeScoresFromDash);
        }

        // 5) Commitment Score Per Unit table
        const unitScoresFromDash: { unit: string; score: number }[] = [];
        let inUnitTable = false;
        for (const line of dashLines) {
          const cols = parseCSVLine(line);
          const rowLower = cols.map((c) => (c || "").trim().toLowerCase());
          if (!inUnitTable && rowLower.join(" ").includes("commitment score per unit")) {
            inUnitTable = true;
            continue;
          }
          if (inUnitTable) {
            const percentIndex = cols.findIndex((c) => /%\s*$/.test((c || "").trim()));
            if (percentIndex !== -1) {
              const pct = toPercent(cols[percentIndex] || "");
              const nameCols = cols.slice(0, percentIndex).filter((c) => (c || "").trim());
              const name = (nameCols[nameCols.length - 1] || "").trim();
              if (name && pct !== null) {
                unitScoresFromDash.push({ unit: name, score: pct });
              }
            } else if (cols.every((c) => !(c || "").trim())) {
              break;
            }
          }
        }
        if (unitScoresFromDash.length > 0) {
          unitScores.splice(0, unitScores.length, ...unitScoresFromDash);
        }
      }
    } catch (e) {
      // Non-fatal: keep computed counts if dashboard fetch fails
      console.warn("Dashboard sheet fetch failed, using computed totals");
    }

    const wigDashboardData = {
      summary: {
        totalCommitments,
        completedCommitments,
        incompleteCommitments,
        commitmentRate,
      },
      officeScores,
      unitScores,
      recentCommitments,
      trends: {
        weeklyCommitments,
        departmentPerformance,
      },
    };

    return NextResponse.json({
      success: true,
      data: wigDashboardData,
      lastUpdated: new Date().toISOString(),
      source: "WIG Tracker Google Sheet",
      csvLines: lines.length,
    });
  } catch (error) {
    console.error("Error fetching WIG dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch WIG dashboard data" },
      { status: 500 }
    );
  }
}
