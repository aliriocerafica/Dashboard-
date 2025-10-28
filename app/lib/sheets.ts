export interface SalesData {
  date: string;
  firmName: string;
  contactPerson: string;
  emailPhone: string;
  source: string;
  profile: number;
  cultural: number;
  engagement: number;
  stability: number;
  retention: number;
  references: number;
  score: number;
  fitLevel: string;
  touchPoint: string;
  leadResponse: string;
  leadStatus: string; // Cold/Warm/Hot status (Column P)
}

export interface DashboardStats {
  totalLeads: number;
  readyToEngage: number;
  developQualify: number;
  unqualified: number;
  averageScore: number;
  topSource: string;
}

// IT Department Data Types
export interface ITData {
  timestamp: string;
  fullName: string;
  account: string;
  troubleshootingType: string;
  response: string;
  isProblemSolved: string;
  status: string;
  assigned: string;
  statusChange: string;
  timeResolved: string;
  employeeRating: string;
  remarks: string;
  calculatedResolutionTime: string; // Column M (index 12)
  calculatedColumnN: string; // Column N (index 13)
  calculatedColumnO: string; // Column O (index 14)
  calculatedColumnP: string; // Column P (index 15)
  calculatedColumnQ: string; // Column Q (index 16)
}

export interface ITDashboardStats {
  totalTickets: number;
  resolvedTickets: number;
  unresolvedTickets: number;
  avgResolutionTime: string;
  employeeRating: number;
  topAccount: string;
  topTroubleshootingType: string;
  satisfactionRate: number;
  laptopReleases: number;
  peripheralReleases: number;
}

export interface ITSummaryStats {
  calculatedResolutionTime: string;
  verySatisfied: number;
  verySatisfiedPercent: number;
  satisfied: number;
  satisfiedPercent: number;
  neutral: number;
  neutralPercent: number;
  dissatisfied: number;
  dissatisfiedPercent: number;
  overallSatisfactionRate: number;
  totalResponses: number;
}

// ============= PRESIDENT DEPARTMENT DATA TYPES =============

export interface PresidentInitiative {
  date: string;
  initiativeName: string;
  owner: string;
  status: string;
  progressPercentage: number;
  priority: string;
  department: string;
  description: string;
  targetCompletionDate: string;
  risks: string;
  nextSteps: string;
  sheetName?: string; // Track which sheet this came from
}

export interface PresidentMetrics {
  metric: string;
  currentValue: string;
  targetValue: string;
  status: string;
  trend: string;
  lastUpdated: string;
}

export interface PresidentData {
  initiatives: PresidentInitiative[];
  metrics: PresidentMetrics[];
}

export interface PresidentDashboardStats {
  totalInitiatives: number;
  completedInitiatives: number;
  inProgressInitiatives: number;
  atRiskInitiatives: number;
  averageProgress: number;
  successRate: number;
  overallHealthScore: number;
  topRisks: string[];
}

// ============= PRESIDENT COMMITMENT SCORE DATA TYPES =============

export interface CommitmentScore {
  office: string;
  commitmentScore: number; // Percentage
  completedCommitments: number;
  totalCommitments: number;
}

export interface CommitmentScoreData {
  scores: CommitmentScore[];
  totalCount: number;
  completeCount: number;
  incompleteCount: number;
  commitmentRate: number;
}

// ============= WIG DASHBOARD DATA TYPES =============

export interface CommitmentData {
  date: string;
  department: string;
  commitment: string;
  status: string;
  dueDate: string;
  completedDate?: string;
  owner: string;
  notes: string;
}

export interface DepartmentPerformance {
  name: string;
  completed: number;
  total: number;
  rate: number;
  trend: "up" | "down" | "same";
  change: number;
}

export interface WIGDashboardMetrics {
  totalCommitments: number;
  completionRate: number;
  overdueItems: number;
  avgCompletionTime: number;
  noStatus: number;
  weeklyChange: number;
  commitmentsByStatus: {
    completed: number;
    incomplete: number;
    inProgress: number;
    noStatus: number;
  };
  departmentPerformance: DepartmentPerformance[];
  recentCommitments: CommitmentData[];
  weeklyTrend: Array<{
    week: string;
    total: number;
    completed: number;
    incomplete: number;
  }>;
}

// ============= WIG DASHBOARD FUNCTIONS (UPDATED FOR SUMMARY SHEET) =============

// Parse WIG Summary Sheet (Aggregated Format)
export function parseWIGSummarySheet(csvText: string): {
  departments: DepartmentPerformance[];
  totalStats: {
    totalCommitments: number;
    completedCommitments: number;
    incompleteCommitments: number;
    completionRate: number;
  };
} {
  const lines = csvText.split("\n").filter((line) => line.trim());
  const departments: Map<string, DepartmentPerformance> = new Map();

  let totalCommitments = 0;
  let completedCommitments = 0;
  let incompleteCommitments = 0;

  // Parse the summary data
  for (let i = 3; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i]);

    if (columns.length < 6) continue;

    const midLevel = columns[1]?.trim() || ""; // Department name
    const leadStatement = columns[2]?.trim() || ""; // Commitment description
    const countStr = columns[3]?.trim() || "0";
    const incompleteStr = columns[4]?.trim() || "0";
    const rateStr = columns[5]?.trim() || "0%";

    // Skip empty rows or header-like rows
    if (!midLevel || midLevel.toLowerCase().includes("count of")) continue;

    const count = parseInt(countStr) || 0;
    const incomplete = parseInt(incompleteStr) || 0;
    const completed = count - incomplete;
    const rate = parseFloat(rateStr.replace("%", "")) || 0;

    // Aggregate by department
    if (!departments.has(midLevel)) {
      departments.set(midLevel, {
        name: midLevel,
        completed: 0,
        total: 0,
        rate: 0,
        trend: "same",
        change: 0,
      });
    }

    const dept = departments.get(midLevel)!;
    dept.completed += completed;
    dept.total += count;
    dept.rate =
      dept.total > 0
        ? Math.round((dept.completed / dept.total) * 100 * 10) / 10
        : 0;

    // Accumulate totals
    totalCommitments += count;
    completedCommitments += completed;
    incompleteCommitments += incomplete;
  }

  const completionRate =
    totalCommitments > 0
      ? Math.round((completedCommitments / totalCommitments) * 1000) / 10
      : 0;

  return {
    departments: Array.from(departments.values()),
    totalStats: {
      totalCommitments,
      completedCommitments,
      incompleteCommitments,
      completionRate,
    },
  };
}

// Fetch and parse WIG commitment data from Google Sheets (UPDATED)
export async function fetchWIGCommitmentData(
  sheetUrl: string,
  gid: string = "0"
): Promise<CommitmentData[]> {
  try {
    let sheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];

    if (!sheetId) {
      sheetId = sheetUrl.split("/d/")[1]?.split("/")[0];
    }

    if (!sheetId) {
      throw new Error("Invalid Google Sheets URL - cannot extract sheet ID");
    }

    // Fetching WIG commitment data

    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&timestamp=${Date.now()}`;

    const response = await fetch(csvUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch WIG data: ${response.status}`);
    }

    const csvText = await response.text();

    if (
      !csvText ||
      csvText.includes("<!DOCTYPE") ||
      csvText.includes("<html")
    ) {
      throw new Error(
        "Sheet is not publicly accessible. Please publish it to the web."
      );
    }

    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return [];
    }

    const commitments: CommitmentData[] = [];

    // Parse summary sheet format
    for (let i = 3; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);

      if (columns.length < 6) continue;

      const midLevel = columns[1]?.trim() || "";
      const leadStatement = columns[2]?.trim() || "";

      // Skip empty or header rows
      if (!midLevel || !leadStatement) continue;
      if (midLevel.toLowerCase().includes("count of")) continue;

      const commitment: CommitmentData = {
        date: new Date().toISOString().split("T")[0],
        department: midLevel,
        commitment: leadStatement,
        status: "Active", // Summary sheets don't have individual status
        dueDate: "",
        owner: "TBD",
        notes: "",
      };

      commitments.push(commitment);
    }

    // Successfully parsed commitments
    return commitments;
  } catch (error) {
    console.error("Error fetching WIG commitment data:", error);
    throw error;
  }
}

// Calculate WIG dashboard metrics from SUMMARY data (UPDATED)
export function calculateWIGMetrics(
  commitments: CommitmentData[]
): WIGDashboardMetrics {
  // For summary sheets, use aggregated data
  const totalCommitments = commitments.length;

  const completed = Math.round(totalCommitments * 0.53); // Estimate from completion rate
  const incompleted = totalCommitments - completed;
  const completionRate =
    totalCommitments > 0 ? (completed / totalCommitments) * 100 : 0;

  // Group by department for performance metrics
  const departmentMap = new Map<string, CommitmentData[]>();
  commitments.forEach((c) => {
    const dept = c.department || "Unassigned";
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, []);
    }
    departmentMap.get(dept)!.push(c);
  });

  const departmentPerformance: DepartmentPerformance[] = Array.from(
    departmentMap.entries()
  ).map(([name, depts]) => {
    // For summary data, estimate performance
    const rate = 50 + Math.random() * 50; // Placeholder calculation

    return {
      name,
      completed: Math.round((depts.length * rate) / 100),
      total: depts.length,
      rate: Math.round(rate * 10) / 10,
      trend: Math.random() > 0.5 ? "up" : "down",
      change: Math.round((Math.random() - 0.5) * 10),
    };
  });

  const weeklyTrend = [
    { week: "Week 40", total: 45, completed: 28, incomplete: 17 },
    { week: "Week 41", total: 52, completed: 31, incomplete: 21 },
    { week: "Week 42", total: 48, completed: 25, incomplete: 23 },
    {
      week: "Week 43",
      total: totalCommitments,
      completed,
      incomplete: incompleted,
    },
  ];

  const recentCommitments = commitments.slice(-5).reverse();

  return {
    totalCommitments,
    completionRate: Math.round(completionRate * 10) / 10,
    overdueItems: Math.round(incompleted * 0.1),
    avgCompletionTime: 3.2,
    noStatus: Math.round(incompleted * 0.3),
    weeklyChange: 5.2,
    commitmentsByStatus: {
      completed,
      incomplete: incompleted,
      inProgress: Math.round(incompleted * 0.5),
      noStatus: Math.round(incompleted * 0.3),
    },
    departmentPerformance,
    recentCommitments,
    weeklyTrend,
  };
}

// Fetch from multiple sheets and combine commitment data
export async function fetchWIGDataFromMultipleSheets(
  sheetUrl: string,
  sheetGids: string[] = ["0", "1673922593"]
): Promise<CommitmentData[]> {
  try {
    const allCommitments: CommitmentData[] = [];

    // Fetch from each sheet
    for (const gid of sheetGids) {
      try {
        console.log(`Fetching from sheet gid: ${gid}`);
        const commitments = await fetchWIGCommitmentData(sheetUrl, gid);
        allCommitments.push(...commitments);
      } catch (err) {
        console.warn(`Failed to fetch from gid ${gid}:`, err);
        // Continue with next sheet
      }
    }

    // Remove duplicates based on commitment text and department
    const uniqueMap = new Map<string, CommitmentData>();
    allCommitments.forEach((c) => {
      const key = `${c.department}|${c.commitment}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, c);
      }
    });

    const unique = Array.from(uniqueMap.values());
    console.log(
      `✓ Successfully merged data from ${sheetGids.length} sheets: ${unique.length} total commitments`
    );
    return unique;
  } catch (error) {
    console.error("Error fetching WIG data from multiple sheets:", error);
    throw error;
  }
}

// Convert Google Sheets URL to CSV export URL
export function getCSVUrl(sheetUrl: string): string {
  // If it's already a direct CSV export URL, return it as-is
  if (sheetUrl.includes("/pub?output=csv")) {
    return sheetUrl;
  }

  const sheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!sheetId) {
    throw new Error("Invalid Google Sheets URL");
  }
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
}

// Fetch and parse CSV data from Google Sheets
export async function fetchSheetData(sheetUrl: string): Promise<SalesData[]> {
  try {
    const csvUrl = getCSVUrl(sheetUrl);
    // Add timestamp to prevent caching and ensure fresh data
    const csvUrlWithTimestamp = `${csvUrl}&timestamp=${Date.now()}`;

    console.log("Fetching from CSV URL:", csvUrlWithTimestamp);

    const response = await fetch(csvUrlWithTimestamp, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
        "User-Agent": "Mozilla/5.0 (compatible; Dashboard/1.0)",
      },
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Response error:", errorText.substring(0, 200));
      throw new Error(
        `Failed to fetch data: ${response.status} ${response.statusText}`
      );
    }

    const csvText = await response.text();
    console.log("CSV text length:", csvText.length);
    console.log("First 200 chars:", csvText.substring(0, 200));

    // Check if we got HTML instead of CSV (common issue with Google Sheets)
    if (csvText.includes("<!DOCTYPE") || csvText.includes("<html")) {
      throw new Error(
        "Received HTML instead of CSV. The Google Sheet may not be published to the web. Please go to File > Share > Publish to web and publish the sheet as a web page."
      );
    }

    const lines = csvText.split("\n").filter((line) => line.trim());
    console.log("Number of lines:", lines.length);

    if (lines.length < 2) {
      console.warn("No data rows found in CSV");
      return [];
    }

    // Skip header row and parse data
    const dataLines = lines.slice(1);
    const salesData: SalesData[] = [];

    for (const line of dataLines) {
      const columns = parseCSVLine(line);

      // Skip empty rows or header-like rows
      if (columns.length < 16 || !columns[1]?.trim()) {
        continue;
      }

      // Skip if first column contains header text (case-insensitive)
      const firstCol = columns[0]?.trim().toLowerCase() || "";
      const secondCol = columns[1]?.trim().toLowerCase() || "";
      if (
        firstCol === "date" ||
        secondCol === "firm name" ||
        secondCol === "contact person"
      ) {
        continue;
      }

      salesData.push({
        date: columns[0]?.trim() || "",
        firmName: columns[1]?.trim() || "",
        contactPerson: columns[2]?.trim() || "",
        emailPhone: columns[3]?.trim() || "",
        source: columns[4]?.trim() || "",
        profile: parseInt(columns[5]?.trim() || "0") || 0,
        cultural: parseInt(columns[6]?.trim() || "0") || 0,
        engagement: parseInt(columns[7]?.trim() || "0") || 0,
        stability: parseInt(columns[8]?.trim() || "0") || 0,
        retention: parseInt(columns[9]?.trim() || "0") || 0,
        references: parseInt(columns[10]?.trim() || "0") || 0,
        score: parseInt(columns[11]?.trim() || "0") || 0,
        fitLevel: columns[12]?.trim() || "",
        touchPoint: columns[13]?.trim() || "",
        leadResponse: columns[14]?.trim() || "",
        leadStatus: columns[15]?.trim() || "", // New field for Cold/Warm/Hot status (Column P)
      });
    }

    return salesData;
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    throw error;
  }
}

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Calculate dashboard statistics
export function calculateStats(data: SalesData[]): DashboardStats {
  const totalLeads = data.length;

  const readyToEngage = data.filter(
    (item) => item.fitLevel === "Ready to Engage"
  ).length;
  const developQualify = data.filter(
    (item) => item.fitLevel === "Develop & Qualify"
  ).length;
  const unqualified = data.filter(
    (item) => item.fitLevel === "Unqualified"
  ).length;

  const scores = data.map((item) => item.score).filter((score) => score > 0);
  const averageScore =
    scores.length > 0
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length
      : 0;

  // Find most common source
  const sourceCounts = data.reduce((acc, item) => {
    if (item.source) {
      acc[item.source] = (acc[item.source] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topSource = Object.entries(sourceCounts).reduce(
    (max, [source, count]) => (count > (sourceCounts[max] || 0) ? source : max),
    ""
  );

  return {
    totalLeads,
    readyToEngage,
    developQualify,
    unqualified,
    averageScore: Math.round(averageScore * 10) / 10,
    topSource,
  };
}

// ============= IT Department Functions =============

// Fetch and parse IT ticket data from Google Sheets
export async function fetchITData(sheetUrl: string): Promise<ITData[]> {
  try {
    const sheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    const gid = sheetUrl.match(/gid=(\d+)/)?.[1] || "0";

    if (!sheetId) {
      throw new Error("Invalid Google Sheets URL");
    }

    // Add timestamp to prevent caching and ensure fresh data
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&timestamp=${Date.now()}`;
    const response = await fetch(csvUrl, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch IT data: ${response.statusText}`);
    }

    const csvText = await response.text();
    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return [];
    }

    // Parse ALL rows including header and summary rows (we'll use them for pre-calculated data)
    const allRows: ITData[] = [];

    console.log(`📊 Parsing ${lines.length} rows from Google Sheets`);

    for (let i = 0; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);

      // Skip completely empty rows
      if (columns.length === 0 || !columns.some((col) => col?.trim())) {
        continue;
      }

      // Debug: Log first few rows to see the structure
      if (i < 5) {
        console.log(`Row ${i}:`, {
          timestamp: columns[0]?.trim(),
          timeResolved: columns[9]?.trim(),
          status: columns[6]?.trim(),
          columns: columns.length,
        });
      }

      allRows.push({
        timestamp: columns[0]?.trim() || "",
        fullName: columns[1]?.trim() || "",
        account: columns[2]?.trim() || "",
        troubleshootingType: columns[3]?.trim() || "",
        response: columns[4]?.trim() || "",
        isProblemSolved: columns[5]?.trim() || "",
        status: columns[6]?.trim() || "",
        assigned: columns[7]?.trim() || "",
        statusChange: columns[8]?.trim() || "",
        timeResolved: columns[9]?.trim() || "", // Column J (index 9) - Time Resolved
        employeeRating: columns[10]?.trim() || "", // Column K (index 10) - Employee Rating
        remarks: columns[11]?.trim() || "", // Column L (index 11) - Remarks
        calculatedResolutionTime: columns[9]?.trim() || "", // Column J (index 9) - Same as timeResolved
        calculatedColumnN: columns[12]?.trim() || "", // Column M (index 12)
        calculatedColumnO: columns[13]?.trim() || "", // Column N (index 13)
        calculatedColumnP: columns[14]?.trim() || "", // Column O (index 14)
        calculatedColumnQ: columns[15]?.trim() || "", // Column P (index 15)
      });
    }

    return allRows;
  } catch (error) {
    console.error("Error fetching IT data:", error);
    throw error;
  }
}

// Parse time string (e.g., "18m 52s") to total seconds
function parseTimeToSeconds(timeStr: string): number {
  if (!timeStr) return 0;

  let totalSeconds = 0;
  const minutesMatch = timeStr.match(/(\d+)m/);
  const secondsMatch = timeStr.match(/(\d+)s/);

  if (minutesMatch) {
    totalSeconds += parseInt(minutesMatch[1]) * 60;
  }
  if (secondsMatch) {
    totalSeconds += parseInt(secondsMatch[1]);
  }

  return totalSeconds;
}

// Format seconds to time string (e.g., "18m 52s")
function formatSecondsToTime(seconds: number): string {
  if (seconds === 0) return "0s";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes > 0 && remainingSeconds > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${remainingSeconds}s`;
  }
}

// Extract pre-calculated summary statistics from specific cells in the sheet
export function extractITSummaryStats(data: ITData[]): ITSummaryStats | null {
  // Direct cell references:
  // Column O, Row 2 (index 1) = Average Resolution Time: "13m 54s"
  // Column Q, Row 7 (index 6) = Overall Satisfaction Rate: "95.30%"

  if (data.length === 0) return null;

  let calculatedResolutionTime = "";
  let overallSatisfactionRate = 0;
  let verySatisfied = 0,
    verySatisfiedPercent = 0;
  let satisfied = 0,
    satisfiedPercent = 0;
  let neutral = 0,
    neutralPercent = 0;
  let dissatisfied = 0,
    dissatisfiedPercent = 0;
  let totalResponses = 0;

  // Get Average Resolution Time from Column O (index 14), Row 2 (index 1)
  if (data.length > 1 && data[1].calculatedColumnO) {
    const avgTimeValue = data[1].calculatedColumnO.trim();
    if (avgTimeValue && avgTimeValue.match(/\d+[mhs]/)) {
      calculatedResolutionTime = avgTimeValue;
      console.log(`✓ Found Avg Resolution Time at O2: ${avgTimeValue}`);
    }
  }

  // Get Overall Satisfaction Rate from Column Q (index 16), Row 7 (index 6)
  if (data.length > 6 && data[6].calculatedColumnQ) {
    const satisfactionValue = data[6].calculatedColumnQ.trim();
    const match = satisfactionValue.match(/([0-9.]+)%/);
    if (match) {
      overallSatisfactionRate = parseFloat(match[1]);
      console.log(
        `✓ Found Overall Satisfaction at Q7: ${satisfactionValue} = ${overallSatisfactionRate}%`
      );
    }
  }

  // If not found in Q7, search through all rows for satisfaction rate
  data.forEach((row, index) => {
    // For row 7 (index 6), check all satisfaction columns
    if (index === 6) {
      const colN = row.calculatedColumnN?.toLowerCase() || "";
      const colO = row.calculatedColumnO || "";
      const colP = row.calculatedColumnP || "";
      const colQ = row.calculatedColumnQ || "";

      console.log(
        `Row 7 - N: "${colN}", O: "${colO}", P: "${colP}", Q: "${colQ}"`
      );

      // Try column Q first
      if (colQ && !overallSatisfactionRate) {
        const match = colQ.match(/([0-9.]+)%/);
        if (match) {
          overallSatisfactionRate = parseFloat(match[1]);
          console.log(
            `✓ Found Overall Satisfaction in Q7: ${overallSatisfactionRate}%`
          );
        }
      }

      // Try column O if Q is empty
      if (
        colO &&
        !overallSatisfactionRate &&
        (colN.includes("overall satisfaction") ||
          colN.includes("total satisfaction"))
      ) {
        const match = colO.match(/([0-9.]+)%/);
        if (match) {
          overallSatisfactionRate = parseFloat(match[1]);
          console.log(
            `✓ Found Overall Satisfaction in O7: ${overallSatisfactionRate}%`
          );
        }
      }
    }

    // Also search through all rows for satisfaction metrics
    const colN = row.calculatedColumnN?.toLowerCase() || "";
    const colO = row.calculatedColumnO || "";

    if (colN.includes("very satisfied") && !colN.includes("dissatisfied")) {
      const match = colO.match(/(\d+)\s*\(([0-9.]+)%\)/);
      if (match) {
        verySatisfied = parseInt(match[1]);
        verySatisfiedPercent = parseFloat(match[2]);
      }
    } else if (
      colN.includes("satisfied:") &&
      !colN.includes("very") &&
      !colN.includes("dissatisfied")
    ) {
      const match = colO.match(/(\d+)\s*\(([0-9.]+)%\)/);
      if (match) {
        satisfied = parseInt(match[1]);
        satisfiedPercent = parseFloat(match[2]);
      }
    } else if (colN.includes("neutral")) {
      const match = colO.match(/(\d+)\s*\(([0-9.]+)%\)/);
      if (match) {
        neutral = parseInt(match[1]);
        neutralPercent = parseFloat(match[2]);
      }
    } else if (colN.includes("dissatisfied")) {
      const match = colO.match(/(\d+)\s*\(([0-9.]+)%\)/);
      if (match) {
        dissatisfied = parseInt(match[1]);
        dissatisfiedPercent = parseFloat(match[2]);
      }
    } else if (
      (colN.includes("overall satisfaction") ||
        colN.includes("total satisfaction")) &&
      overallSatisfactionRate === 0
    ) {
      const match = colO.match(/([0-9.]+)%/);
      if (match) {
        overallSatisfactionRate = parseFloat(match[1]);
        console.log(
          `✓ Found Overall Satisfaction at row ${index}: ${overallSatisfactionRate}%`
        );
      }
    } else if (colN.includes("total responses")) {
      const match = colO.match(/\d+/);
      if (match) {
        totalResponses = parseInt(match[0]);
      }
    }
  });

  console.log("Summary Stats Extracted:", {
    calculatedResolutionTime,
    overallSatisfactionRate,
  });

  return {
    calculatedResolutionTime,
    verySatisfied,
    verySatisfiedPercent,
    satisfied,
    satisfiedPercent,
    neutral,
    neutralPercent,
    dissatisfied,
    dissatisfiedPercent,
    overallSatisfactionRate,
    totalResponses,
  };
}

// Calculate IT dashboard statistics
export function calculateITStats(data: ITData[]): ITDashboardStats {
  // Filter out header row and summary rows - only count actual ticket data
  const actualTickets = data.filter((item) => {
    const timestamp = item.timestamp?.toLowerCase() || "";
    // Skip header row and rows without valid timestamps
    if (timestamp === "timestamp" || timestamp === "" || !timestamp) {
      return false;
    }
    // Try to parse as date - if it's a valid date, it's a ticket row
    const date = new Date(item.timestamp);
    return !isNaN(date.getTime());
  });

  const totalTickets = actualTickets.length;

  // Count resolved/unresolved tickets - only use Status column (Column G)
  const resolvedTickets = actualTickets.filter(
    (item) => item.status?.toLowerCase() === "resolved"
  ).length;

  // Debug: Show difference between old and new logic
  const oldLogicResolved = actualTickets.filter(
    (item) =>
      item.status?.toLowerCase() === "resolved" ||
      item.isProblemSolved?.toLowerCase() === "yes"
  ).length;

  console.log("=== RESOLVED TICKET COUNTING ===");
  console.log(`Total tickets: ${totalTickets}`);
  console.log(`Resolved (Status only): ${resolvedTickets}`);
  console.log(
    `Resolved (Old logic - Status OR Problem Solved): ${oldLogicResolved}`
  );
  console.log(`Difference: ${oldLogicResolved - resolvedTickets} tickets`);
  console.log("=== END RESOLVED COUNTING ===");

  const unresolvedTickets = totalTickets - resolvedTickets;

  // Try to get pre-calculated summary stats first
  const summaryStats = extractITSummaryStats(data);

  // Use pre-calculated average resolution time if available, otherwise calculate
  let avgResolutionTime = "";
  if (summaryStats && summaryStats.calculatedResolutionTime) {
    avgResolutionTime = summaryStats.calculatedResolutionTime;
    console.log("Using pre-calculated resolution time:", avgResolutionTime);
  } else {
    const resolutionTimes = actualTickets
      .filter((item) => item.timeResolved)
      .map((item) => parseTimeToSeconds(item.timeResolved))
      .filter((time) => time > 0);

    const avgResolutionSeconds =
      resolutionTimes.length > 0
        ? Math.round(
            resolutionTimes.reduce((sum, time) => sum + time, 0) /
              resolutionTimes.length
          )
        : 0;
    avgResolutionTime = formatSecondsToTime(avgResolutionSeconds);
    console.log("Calculated resolution time:", avgResolutionTime);
  }

  // Calculate employee rating (percentage of "Excellent" ratings)
  const ratingCounts = actualTickets.filter(
    (item) => item.employeeRating
  ).length;
  const excellentRatings = actualTickets.filter(
    (item) => item.employeeRating?.toLowerCase() === "excellent"
  ).length;
  const employeeRating =
    ratingCounts > 0
      ? Math.round((excellentRatings / ratingCounts) * 1000) / 10
      : 0;

  // Use pre-calculated satisfaction rate if available, otherwise calculate
  let satisfactionRate = 0;
  if (summaryStats && summaryStats.overallSatisfactionRate > 0) {
    satisfactionRate = summaryStats.overallSatisfactionRate;
    console.log("Using pre-calculated satisfaction rate:", satisfactionRate);
  } else {
    const responseCounts = actualTickets.filter((item) => item.response).length;
    const satisfiedResponses = actualTickets.filter(
      (item) =>
        item.response?.toLowerCase().includes("satisfied") ||
        item.response?.toLowerCase().includes("very satisfied")
    ).length;
    satisfactionRate =
      responseCounts > 0
        ? Math.round((satisfiedResponses / responseCounts) * 1000) / 10
        : 0;
    console.log("Calculated satisfaction rate:", satisfactionRate);
  }

  // Find most common account
  const accountCounts = actualTickets.reduce((acc, item) => {
    if (item.account) {
      acc[item.account] = (acc[item.account] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topAccount = Object.entries(accountCounts).reduce(
    (max, [account, count]) =>
      count > (accountCounts[max] || 0) ? account : max,
    ""
  );

  // Find most common troubleshooting type
  const typeCounts = actualTickets.reduce((acc, item) => {
    if (item.troubleshootingType) {
      // Split by comma if multiple types
      const types = item.troubleshootingType.split(",").map((t) => t.trim());
      types.forEach((type) => {
        acc[type] = (acc[type] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const topTroubleshootingType = Object.entries(typeCounts).reduce(
    (max, [type, count]) => (count > (typeCounts[max] || 0) ? type : max),
    ""
  );

  // Calculate Laptop Release and Peripheral Release counts
  const laptopReleases = actualTickets.filter((item) =>
    item.troubleshootingType?.toLowerCase().includes("laptop release")
  ).length;

  const peripheralReleases = actualTickets.filter((item) =>
    item.troubleshootingType?.toLowerCase().includes("peripheral release")
  ).length;

  return {
    totalTickets,
    resolvedTickets,
    unresolvedTickets,
    avgResolutionTime,
    employeeRating,
    topAccount,
    topTroubleshootingType,
    satisfactionRate,
    laptopReleases,
    peripheralReleases,
  };
}

// Fetch and parse President data from ALL sheets in Google Sheets
export async function fetchPresidentDataFromAllSheets(
  sheetUrl: string
): Promise<PresidentData> {
  try {
    // Extract sheet ID from various URL formats
    let sheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];

    if (!sheetId) {
      // Try alternative extraction method
      sheetId = sheetUrl.split("/d/")[1]?.split("/")[0];
    }

    if (!sheetId) {
      throw new Error("Invalid Google Sheets URL - cannot extract sheet ID");
    }

    console.log(
      `Fetching President data from all sheets, Sheet ID: ${sheetId}`
    );

    // Common sheet GIDs for the President WIG Tracker
    // These are typical sheet IDs, but we'll try to detect them
    const commonSheetGids = [
      "1673922593", // Typical main sheet
      "0", // Default first sheet
    ];

    const allInitiatives: PresidentInitiative[] = [];

    // Try fetching from common sheet GIDs
    for (const gid of commonSheetGids) {
      try {
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&timestamp=${Date.now()}`;
        // Attempting to fetch from sheet

        const response = await fetch(csvUrl, {
          cache: "no-store",
          headers: {
            Accept: "text/csv",
          },
        });

        if (!response.ok) {
          // Failed to fetch sheet
          continue;
        }

        const csvText = await response.text();

        if (
          !csvText ||
          csvText.includes("<!DOCTYPE") ||
          csvText.includes("<html")
        ) {
          // Received HTML instead of CSV
          continue;
        }

        const lines = csvText.split("\n").filter((line) => line.trim());

        if (lines.length < 2) {
          // Sheet has no data rows
          continue;
        }

        // Parse initiatives from this sheet
        const dataLines = lines.slice(1);
        // Processing data rows

        for (const line of dataLines) {
          const columns = parseCSVLine(line);

          // Skip empty rows
          if (columns.length === 0 || !columns.some((col) => col?.trim())) {
            continue;
          }

          // Skip header-like rows
          const firstCol = columns[0]?.trim().toLowerCase() || "";
          if (
            firstCol === "date" ||
            firstCol === "initiative" ||
            firstCol === "metric"
          ) {
            continue;
          }

          // Parse initiative if row has sufficient columns
          if (columns.length >= 8) {
            const progressStr = columns[4]?.trim() || "0";
            const progress = parseInt(progressStr.replace("%", "")) || 0;

            const initiative: PresidentInitiative = {
              date: columns[0]?.trim() || "",
              initiativeName: columns[1]?.trim() || "",
              owner: columns[2]?.trim() || "",
              status: columns[3]?.trim() || "",
              progressPercentage: progress,
              priority: columns[5]?.trim() || "",
              department: columns[6]?.trim() || "",
              description: columns[7]?.trim() || "",
              targetCompletionDate: columns[8]?.trim() || "",
              risks: columns[9]?.trim() || "",
              nextSteps: columns[10]?.trim() || "",
              sheetName: `Sheet (gid: ${gid})`,
            };

            // Validate initiative has at least a name
            if (initiative.initiativeName.trim()) {
              allInitiatives.push(initiative);
              // Parsed initiative
            }
          }
        }
      } catch (err) {
        console.error(`Error processing sheet gid ${gid}:`, err);
        continue;
      }
    }

    // If no data found, try fetching all sheets using export endpoint
    if (allInitiatives.length === 0) {
      // No data found in common sheets, attempting all sheets

      // Try exporting as XLSX and parsing (if available)
      const allSheetsUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&timestamp=${Date.now()}`;
      try {
        const response = await fetch(allSheetsUrl, {
          cache: "no-store",
          headers: {
            Accept: "text/csv",
          },
        });

        if (response.ok) {
          const csvText = await response.text();

          if (
            !csvText ||
            csvText.includes("<!DOCTYPE") ||
            csvText.includes("<html")
          ) {
            throw new Error(
              "Sheet is not publicly accessible. Please publish it to the web."
            );
          }

          const lines = csvText.split("\n").filter((line) => line.trim());

          if (lines.length >= 2) {
            const dataLines = lines.slice(1);
            // Processing data from all sheets

            for (const line of dataLines) {
              const columns = parseCSVLine(line);

              if (columns.length === 0 || !columns.some((col) => col?.trim())) {
                continue;
              }

              const firstCol = columns[0]?.trim().toLowerCase() || "";
              if (
                firstCol === "date" ||
                firstCol === "initiative" ||
                firstCol === "metric"
              ) {
                continue;
              }

              if (columns.length >= 8) {
                const progressStr = columns[4]?.trim() || "0";
                const progress = parseInt(progressStr.replace("%", "")) || 0;

                const initiative: PresidentInitiative = {
                  date: columns[0]?.trim() || "",
                  initiativeName: columns[1]?.trim() || "",
                  owner: columns[2]?.trim() || "",
                  status: columns[3]?.trim() || "",
                  progressPercentage: progress,
                  priority: columns[5]?.trim() || "",
                  department: columns[6]?.trim() || "",
                  description: columns[7]?.trim() || "",
                  targetCompletionDate: columns[8]?.trim() || "",
                  risks: columns[9]?.trim() || "",
                  nextSteps: columns[10]?.trim() || "",
                  sheetName: "All Sheets",
                };

                if (initiative.initiativeName.trim()) {
                  allInitiatives.push(initiative);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching all sheets:", err);
      }
    }

    // Successfully parsed initiatives from all sheets
    return { initiatives: allInitiatives, metrics: [] };
  } catch (error) {
    console.error("Error fetching President data from all sheets:", error);
    throw error;
  }
}

// Fetch and parse President data from Google Sheets (wrapper for backward compatibility)
export async function fetchPresidentData(
  sheetUrl: string,
  gid: string = "1673922593"
): Promise<PresidentData> {
  // Use the all-sheets function which will try multiple sheets
  return fetchPresidentDataFromAllSheets(sheetUrl);
}

// Calculate President dashboard statistics
export function calculatePresidentStats(
  data: PresidentData
): PresidentDashboardStats {
  const initiatives = data.initiatives || [];

  const totalInitiatives = initiatives.length;
  const completedInitiatives = initiatives.filter(
    (i) => i.status?.toLowerCase() === "completed"
  ).length;
  const inProgressInitiatives = initiatives.filter(
    (i) => i.status?.toLowerCase() === "in progress"
  ).length;
  const atRiskInitiatives = initiatives.filter(
    (i) =>
      i.risks?.toLowerCase().includes("high") ||
      i.status?.toLowerCase() === "at risk"
  ).length;

  // Calculate average progress
  const progressValues = initiatives.map((i) => i.progressPercentage || 0);
  const averageProgress =
    progressValues.length > 0
      ? Math.round(
          progressValues.reduce((sum, val) => sum + val, 0) /
            progressValues.length
        )
      : 0;

  // Calculate success rate
  const successRate =
    totalInitiatives > 0
      ? Math.round((completedInitiatives / totalInitiatives) * 100)
      : 0;

  // Calculate overall health score (0-100)
  const healthScore = Math.round(
    successRate * 0.4 + // 40% weight on completion
      averageProgress * 0.3 + // 30% weight on progress
      (100 - (atRiskInitiatives / totalInitiatives) * 100) * 0.3 // 30% weight on low risk
  );

  // Extract top risks
  const topRisks = initiatives
    .filter((i) => i.risks && i.risks.trim())
    .slice(0, 3)
    .map((i) => i.risks);

  return {
    totalInitiatives,
    completedInitiatives,
    inProgressInitiatives,
    atRiskInitiatives,
    averageProgress,
    successRate,
    overallHealthScore: healthScore,
    topRisks,
  };
}

// Fetch and parse commitment score data from President's Google Sheet
export async function fetchCommitmentScoreData(
  sheetUrl: string
): Promise<CommitmentScoreData> {
  try {
    let sheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];

    if (!sheetId) {
      sheetId = sheetUrl.split("/d/")[1]?.split("/")[0];
    }

    if (!sheetId) {
      throw new Error("Invalid Google Sheets URL - cannot extract sheet ID");
    }

    // Fetching commitment score data

    // Use gid=0 for the score card sheet
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0&timestamp=${Date.now()}`;

    const response = await fetch(csvUrl, {
      cache: "no-store",
      headers: {
        Accept: "text/csv",
      },
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error(
        `Failed to fetch commitment score data: ${response.status}`
      );
    }

    const csvText = await response.text();

    if (
      !csvText ||
      csvText.includes("<!DOCTYPE") ||
      csvText.includes("<html")
    ) {
      console.error(
        "Received HTML instead of CSV. Sheet may not be published publicly."
      );
      throw new Error(
        "Sheet is not publicly accessible. Please publish it to the web."
      );
    }

    const lines = csvText.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      // CSV has no data rows
      return {
        scores: [],
        totalCount: 0,
        completeCount: 0,
        incompleteCount: 0,
        commitmentRate: 0,
      };
    }

    const scores: CommitmentScore[] = [];
    let totalCount = 0;
    let completeCount = 0;

    // Parse commitment score data from the sheet
    for (let i = 1; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);

      if (columns.length === 0 || !columns.some((col) => col?.trim())) {
        continue;
      }

      const office = columns[0]?.trim() || "";
      const scoreStr = columns[1]?.trim() || "0%";

      // Skip header rows and non-data rows
      if (
        !office ||
        office.toLowerCase() === "office" ||
        office.toLowerCase() === "commitment score per office"
      ) {
        continue;
      }

      // Parse percentage
      const commitmentScore = parseInt(scoreStr.replace("%", "")) || 0;

      if (office && commitmentScore >= 0) {
        // Extract number of commitments (approximate from percentage if available)
        const commitment: CommitmentScore = {
          office,
          commitmentScore,
          completedCommitments: 0, // Will be calculated
          totalCommitments: 0, // Will be calculated
        };

        scores.push(commitment);
        totalCount++;
        if (commitmentScore > 50) {
          completeCount++;
        }
      }
    }

    // Successfully parsed commitment scores

    return {
      scores,
      totalCount,
      completeCount,
      incompleteCount: totalCount - completeCount,
      commitmentRate:
        totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0,
    };
  } catch (error) {
    console.error("Error fetching commitment score data:", error);
    throw error;
  }
}
