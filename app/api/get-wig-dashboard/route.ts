import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu6xGRE5ah-2airOT9EXJePKOMAseMIkyKunz0c7VDpxFCT3He0qSxURfdXXsGFJo-2VQE0cUtm_Sv/pub?output=csv";

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching WIG dashboard data from:", GOOGLE_SHEET_URL);

    // Fetch data from Google Sheets CSV (cache-busting timestamp)
    const csvUrl = `${GOOGLE_SHEET_URL}&timestamp=${Date.now()}`;
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

    // Summary metrics
    const totalCommitments = commitmentRows.length;
    const completedCommitments = commitmentRows.filter((r) =>
      (r.status || "").toLowerCase().includes("completed")
    ).length;
    const incompleteCommitments = Math.max(
      0,
      totalCommitments - completedCommitments
    );
    const commitmentRate = totalCommitments
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

    // Recent commitments (use latest by sessionDate if parseable or last rows)
    const parseDate = (s?: string) => (s ? Date.parse(s) || 0 : 0);
    const recentCommitments = [...commitmentRows]
      .sort((a, b) => parseDate(b.sessionDate) - parseDate(a.sessionDate))
      .slice(0, 10)
      .map((r) => ({
        sessionDate: r.sessionDate || "",
        department: r.department || "",
        leadStatement: r.leadStatement || r.commitment || "",
        status: r.status || "",
        dueDate: r.dueDate || "",
      }));

    // Weekly trends by Week column if present; else fallback by sessionDate week text
    const weekKey = (r: Row) => (r.week?.trim() ? r.week.trim() : "");
    const weekMap: Record<string, { total: number; done: number }> = {};
    commitmentRows.forEach((r) => {
      const wk = weekKey(r) || "Unknown";
      if (!weekMap[wk]) weekMap[wk] = { total: 0, done: 0 };
      weekMap[wk].total += 1;
      if ((r.status || "").toLowerCase().includes("completed")) weekMap[wk].done += 1;
    });
    const weeklyCommitments = Object.entries(weekMap)
      .map(([week, { total, done }]) => ({ week, commitments: total, completed: done }))
      .sort((a, b) => a.week.localeCompare(b.week));

    // Department performance simple trend vs previous week (delta of completion rate)
    const departmentPerformance = Object.keys(officeMap).map((dept) => ({
      department: dept,
      // Without historical breakdown per week per dept, set neutral change
      trend: "stable",
      change: 0,
    }));

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
