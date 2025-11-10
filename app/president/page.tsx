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
import LoadingSpinner from "../components/LoadingSpinner";

export default function PresidentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [weeklyRows, setWeeklyRows] = useState<any[]>([]);
  const [officeScoresSheet, setOfficeScoresSheet] = useState<
    Array<{ office: string; score: number }>
  >([]);
  const [unitScoresSheet, setUnitScoresSheet] = useState<
    Array<{ unit: string; score: number }>
  >([]);
  const [summary, setSummary] = useState<{
    total?: number;
    complete?: number;
    incomplete?: number;
    ratePct?: number;
  } | null>(null);
  const [showOfficeScores, setShowOfficeScores] = useState(false);
  const [showUnitScores, setShowUnitScores] = useState(false);
  const [showOfficeModal, setShowOfficeModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);

  // Sheet-specific CSV endpoints (provided)
  const DASHBOARD_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu6xGRE5ah-2airOT9EXJePKOMAseMIkyKunz0c7VDpxFCT3He0qSxURfdXXsGFJo-2VQE0cUtm_Sv/pub?gid=1634851984&single=true&output=csv";
  const WEEKLY_WIG_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu6xGRE5ah-2airOT9EXJePKOMAseMIkyKunz0c7VDpxFCT3He0qSxURfdXXsGFJo-2VQE0cUtm_Sv/pub?gid=1673922593&single=true&output=csv";
  const SCORECARD_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu6xGRE5ah-2airOT9EXJePKOMAseMIkyKunz0c7VDpxFCT3He0qSxURfdXXsGFJo-2VQE0cUtm_Sv/pub?gid=1871520825&single=true&output=csv";
  const DATA_CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQu6xGRE5ah-2airOT9EXJePKOMAseMIkyKunz0c7VDpxFCT3He0qSxURfdXXsGFJo-2VQE0cUtm_Sv/pub?gid=1443822639&single=true&output=csv";

  const [scoreRows, setScoreRows] = useState<any[]>([]);
  const [scoreSearchTerm, setScoreSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${DASHBOARD_CSV_URL}&ts=${Date.now()}`, {
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

        // Extract Commitment Score per Office/Unit directly from Dashboard sheet
        const foundOffices: Array<{ office: string; score: number }> = [];
        const foundUnits: Array<{ unit: string; score: number }> = [];
        const seenOffice = new Set<string>();
        const seenUnit = new Set<string>();
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
              if (val !== undefined) {
                // Heuristic: Office names often include "Office of"; units may not
                if (/office of/i.test(cur)) {
                  const key = cur.toLowerCase();
                  if (!seenOffice.has(key)) {
                    seenOffice.add(key);
                    foundOffices.push({ office: cur, score: val });
                  }
                } else {
                  const key = cur.toLowerCase();
                  if (!seenUnit.has(key)) {
                    seenUnit.add(key);
                    foundUnits.push({ unit: cur, score: val });
                  }
                }
              }
            }
            // Pattern: [percent][label]
            if (/%/.test(cur) && left) {
              const val = pctToNum(cur);
              if (val !== undefined) {
                if (/office of/i.test(left)) {
                  const key = left.toLowerCase();
                  if (!seenOffice.has(key)) {
                    seenOffice.add(key);
                    foundOffices.push({ office: left, score: val });
                  }
                } else {
                  const key = left.toLowerCase();
                  if (!seenUnit.has(key)) {
                    seenUnit.add(key);
                    foundUnits.push({ unit: left, score: val });
                  }
                }
              }
            }
          }
        });
        if (foundOffices.length > 0) {
          foundOffices.sort((a, b) => b.score - a.score);
          setOfficeScoresSheet(foundOffices);
        }
        if (foundUnits.length > 0) {
          foundUnits.sort((a, b) => b.score - a.score);
          setUnitScoresSheet(foundUnits);
        }

        // Extract Dashboard sheet summary by robust label search
        const normalizeText = (s: string) =>
          s.replace(/\s+/g, " ").trim().toLowerCase();
        const getValueAfterLabel = (label: string): string | null => {
          const labelLc = normalizeText(label);
          for (const arr of parsedLines) {
            for (let i = 0; i < arr.length; i++) {
              const cell = normalizeText(arr[i] || "");
              if (!cell) continue;
              // Allow exact, startsWith, or includes to tolerate extra words/spacing
              if (
                cell === labelLc ||
                cell.startsWith(labelLc) ||
                cell.includes(labelLc)
              ) {
                // Find the next non-empty cell to the right as the value
                for (let j = i + 1; j < Math.min(i + 5, arr.length); j++) {
                  const candidate = (arr[j] || "").trim();
                  if (candidate) return candidate;
                }
              }
            }
          }
          return null;
        };
        const totalStr = getValueAfterLabel("Count of Commitment");
        const completeStr = getValueAfterLabel("Count of Complete Commitments");
        const incompleteStr = getValueAfterLabel(
          "Count of Incomplete Commitments"
        );
        const rateStr = getValueAfterLabel(
          "Commitment Rate to the Primary WIG"
        );
        if (totalStr || completeStr || incompleteStr || rateStr) {
          const toNum = (s: string | null): number | undefined => {
            if (!s) return undefined;
            const cleaned = s.replace(/[^0-9.%]/g, "");
            const n = parseFloat(cleaned.replace(/%/g, ""));
            return isNaN(n) ? undefined : n;
          };
          setSummary({
            total: toNum(totalStr),
            complete: toNum(completeStr),
            incomplete: toNum(incompleteStr),
            ratePct: toNum(rateStr),
          });
        }

        const header = parsedLines[0];
        const data: any[] = [];
        for (let i = 1; i < parsedLines.length; i++) {
          const cols = parsedLines[i];
          if (!cols.some((c) => c && c.trim())) continue;
          const obj: any = {};
          header.forEach(
            (h, idx) => (obj[h.trim()] = (cols[idx] || "").trim())
          );
          data.push(obj);
        }
        setRows(data);

        // Fetch Weekly WIG sheet for richer chart data
        try {
          const resWeekly = await fetch(
            `${WEEKLY_WIG_CSV_URL}&ts=${Date.now()}`,
            {
              cache: "no-store",
              headers: { Accept: "text/csv" },
            }
          );
          if (resWeekly.ok) {
            const csvW = await resWeekly.text();
            const linesW = csvW.split("\n").filter((l) => l.trim());
            if (linesW.length >= 2) {
              const headW = parseCSVLine(linesW[0]);
              const dataW: any[] = [];
              for (let i = 1; i < linesW.length; i++) {
                const colsW = parseCSVLine(linesW[i]);
                if (!colsW.some((c) => c && c.trim())) continue;
                const objW: any = {};
                headW.forEach(
                  (h, idx) => (objW[h.trim()] = (colsW[idx] || "").trim())
                );
                dataW.push(objW);
              }
              setWeeklyRows(dataW);
            }
          }
        } catch (e) {
          // ignore; charts will fallback to dashboard rows
        }

        // Fetch Score Card sheet for the Score Card tab table
        try {
          const resScore = await fetch(
            `${SCORECARD_CSV_URL}&ts=${Date.now()}`,
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
              let headerIndex = 0;
              let headS: string[] = [];
              for (let i = 0; i < Math.min(linesS.length, 50); i++) {
                const cols = parseCSVLine(linesS[i]);
                const joined = cols.join("|").toLowerCase();
                if (
                  joined.includes("lead statement") &&
                  (joined.includes("top level") ||
                    joined.includes("mid level") ||
                    joined.includes("accomplishment"))
                ) {
                  headerIndex = i;
                  headS = cols;
                  break;
                }
              }
              if (headS.length === 0) {
                headS = parseCSVLine(linesS[0]);
              }
              const dataS: any[] = [];
              for (let i = headerIndex + 1; i < linesS.length; i++) {
                const colsS = parseCSVLine(linesS[i]);
                if (!colsS.some((c) => c && c.trim())) continue;
                const objS: any = {};
                headS.forEach(
                  (h, idx) => (objS[h.trim()] = (colsS[idx] || "").trim())
                );
                dataS.push(objS);
              }
              setScoreRows(dataS);
            }
          }
        } catch (e) {
          // ignore; table will show empty state
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
    const source = weeklyRows && weeklyRows.length > 0 ? weeklyRows : rows;
    if (!source || source.length === 0) {
      return {
        totalCommitments: 0,
        completeCommitments: 0,
        incompleteCommitments: 0,
        commitmentRate: 0,
        officeScores: [] as Array<{ office: string; score: number }>,
        unitScores: [] as Array<{ unit: string; score: number }>,
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
    const deptOf = (r: any) =>
      normalize(r["Departments"]) ||
      normalize(r["Department"]) ||
      "Unspecified";
    const unitOf = (r: any) =>
      normalize(r["Sub-Department (Dropdown)"]) ||
      normalize(r["Sub-Department"]) ||
      "Not applicable";
    const dateOf = (r: any) =>
      normalize(r["Session Date"]) || normalize(r["Date"]) || "";

    const valid = source.filter(
      (r: any) => deptOf(r) || unitOf(r) || statusOf(r)
    );
    const totalCommitments = valid.length;
    const completeCommitments = valid.filter(
      (r) => statusOf(r).toLowerCase() === "completed"
    ).length;
    const incompleteCommitments = totalCommitments - completeCommitments;
    const commitmentRate =
      totalCommitments > 0
        ? Math.round((completeCommitments / totalCommitments) * 1000) / 10
        : 0;

    // Office scores
    const officeMap = new Map<string, { total: number; complete: number }>();
    // Unit scores
    const unitMap = new Map<string, { total: number; complete: number }>();

    valid.forEach((r) => {
      const d = deptOf(r) || "Unspecified";
      const u = unitOf(r) || "Not applicable";
      const completed = statusOf(r).toLowerCase() === "completed" ? 1 : 0;
      const od = officeMap.get(d) || { total: 0, complete: 0 };
      od.total += 1;
      od.complete += completed;
      officeMap.set(d, od);
      const ud = unitMap.get(u) || { total: 0, complete: 0 };
      ud.total += 1;
      ud.complete += completed;
      unitMap.set(u, ud);
    });

    const toPct = (x: { total: number; complete: number }) =>
      x.total > 0 ? Math.round((x.complete / x.total) * 1000) / 10 : 0;
    const officeScoresComputed = Array.from(officeMap.entries())
      .map(([office, agg]) => ({ office, score: toPct(agg) }))
      .sort((a, b) => b.score - a.score);
    const unitScoresComputed = Array.from(unitMap.entries())
      .map(([unit, agg]) => ({ unit, score: toPct(agg) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    // Weekly trend
    const weekMap = new Map<string, { total: number; completed: number }>();
    valid.forEach((r) => {
      const raw = dateOf(r);
      if (!raw) return;
      const dt = new Date(raw);
      if (isNaN(dt.getTime())) return;
      const wk = getISOWeek(dt);
      const key = `${dt.getFullYear()}-W${wk}`;
      const cur = weekMap.get(key) || { total: 0, completed: 0 };
      cur.total += 1;
      if (statusOf(r).toLowerCase() === "completed") cur.completed += 1;
      weekMap.set(key, cur);
    });
    const weeklyTrend = Array.from(weekMap.entries())
      .map(([k, v]) => ({ week: k, total: v.total, completed: v.completed }))
      .sort((a, b) => (a.week < b.week ? -1 : 1));

    return {
      totalCommitments,
      completeCommitments,
      incompleteCommitments,
      commitmentRate,
      officeScores: officeScoresSheet.length
        ? officeScoresSheet
        : officeScoresComputed,
      unitScores: unitScoresSheet.length ? unitScoresSheet : unitScoresComputed,
      weeklyTrend,
    };
  }, [rows, weeklyRows, officeScoresSheet, unitScoresSheet]);

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
                Office of the President
              </h1>
              <p className="text-sm sm:text-base text-gray-900">
                WIG Tracking and Scorecard
              </p>
            </div>
            <a
              href="https://docs.google.com/spreadsheets/d/1qp_5G8qnw_T1AUYMW4zQhgTzSo5kfX8AczOEM6jO-xw/edit?gid=1634851984#gid=1634851984"
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

        {/* Navigation Tabs (like Finance) */}
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
                  <col style={{ width: "10%" }} />
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
                <LoadingSpinner size="lg" text="Loading dashboard data..." />
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
                    {summary?.total ?? dashboardData.totalCommitments}
                    </div>
                  </div>
                <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                  <div className="text-sm text-gray-600">Completed</div>
                  <div className="text-3xl font-bold text-green-600 mt-1">
                    {summary?.complete ?? dashboardData.completeCommitments}
            </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                  <div className="text-sm text-gray-600">Incomplete</div>
                  <div className="text-3xl font-bold text-orange-600 mt-1">
                    {summary?.incomplete ?? dashboardData.incompleteCommitments}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                  <div className="text-sm text-gray-600">Commitment Rate</div>
                  <div className="text-3xl font-bold text-purple-600 mt-1">
                    {summary?.ratePct ?? dashboardData.commitmentRate}%
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
                      Commitment Score per Office
                  </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Completion %
                      </span>
                      <button
                        onClick={() => setShowOfficeModal(true)}
                        className="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center gap-1 transition-colors"
                        aria-label="See Department Scores"
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
                        data={dashboardData.officeScores}
                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                      >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="office"
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
                  {showOfficeScores && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-600">
                            <th className="text-left py-2 pr-2">Rank</th>
                            <th className="text-left py-2 pr-2">Office</th>
                            <th className="text-left py-2">Progress</th>
                            <th className="text-right py-2 pl-2">Completion</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboardData.officeScores.map((row, idx) => {
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
                                  {row.office}
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
                      Commitment Score per Unit
                  </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">
                        Top 12 by completion %
                      </span>
                      <button
                        onClick={() => setShowUnitModal(true)}
                        className="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center gap-1 transition-colors"
                        aria-label="See Department Scores"
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
                        data={dashboardData.unitScores}
                        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                              <XAxis
                          dataKey="unit"
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
                          fill="#10B981"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                  </div>
                  {/* Values list with progress bars - shown conditionally */}
                  {showUnitScores && (
                    <div className="mt-4 overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                          <tr className="text-gray-600">
                            <th className="text-left py-2 pr-2">Rank</th>
                            <th className="text-left py-2 pr-2">Unit</th>
                            <th className="text-left py-2">Progress</th>
                            <th className="text-right py-2 pl-2">Completion</th>
                                  </tr>
                                </thead>
                                <tbody>
                          {dashboardData.unitScores.map((row, idx) => {
                            const accent =
                              idx < 3 ? "bg-emerald-500" : "bg-indigo-500";
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
                                  {row.unit}
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
                        </div>
                      )}

            {/* Department Scores Modals */}
            {showOfficeModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                  <div
                    className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
                    onClick={() => setShowOfficeModal(false)}
                  ></div>

                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-emerald-50 to-emerald-100 rounded-t-2xl">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Department Scores (Office)
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Completion percentage by office
                        </p>
                      </div>
                      <button
                        onClick={() => setShowOfficeModal(false)}
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
                            data={dashboardData.officeScores}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                          >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#E5E7EB"
                              />
                              <XAxis
                              dataKey="office"
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
                              Office
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
                          {dashboardData.officeScores.map((row, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-2 px-4 text-gray-600">
                                {idx + 1}
                                          </td>
                              <td className="py-2 px-4 text-gray-900">
                                {row.office}
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

            {showUnitModal && (
              <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-screen items-center justify-center p-4">
                  <div
                    className="fixed inset-0 bg-white/20 backdrop-blur-md transition-opacity"
                    onClick={() => setShowUnitModal(false)}
                  ></div>

                  <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-indigo-50 to-indigo-100 rounded-t-2xl">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          Department Scores (Unit)
                        </h2>
                <p className="text-sm text-gray-600 mt-1">
                          Completion percentage by unit
                </p>
              </div>
                      <button
                        onClick={() => setShowUnitModal(false)}
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
                            data={dashboardData.unitScores}
                            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#E5E7EB"
                            />
                            <XAxis
                              dataKey="unit"
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
                              fill="#6366F1"
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
                              Unit
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
                          {dashboardData.unitScores.map((row, idx) => (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-2 px-4 text-gray-600">
                                {idx + 1}
                                  </td>
                              <td className="py-2 px-4 text-gray-900">
                                {row.unit}
                                  </td>
                              <td className="py-2 px-4">
                                <div className="w-full h-2.5 bg-gray-100 rounded-full">
                                  <div
                                    className="h-2.5 rounded-full bg-indigo-500"
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

            {!loading && !error && (
              <div className="bg-white rounded-xl p-6 shadow border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Weekly Trend (Total vs Completed)
                  </h3>
                  <span className="text-sm text-gray-500">ISO weeks</span>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.weeklyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke="#6366F1"
                        strokeWidth={3}
                      />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#22C55E"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
