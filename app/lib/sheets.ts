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
  score: number;
  fitLevel: string;
  touchPoint: string;
  leadResponse: string;
  note: string;
  leadStatus: string; // New field for Cold/Warm/Hot status (Column P)
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

// Convert Google Sheets URL to CSV export URL
export function getCSVUrl(sheetUrl: string): string {
  const sheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (!sheetId) {
    throw new Error('Invalid Google Sheets URL');
  }
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`;
}

// Fetch and parse CSV data from Google Sheets
export async function fetchSheetData(sheetUrl: string): Promise<SalesData[]> {
  try {
    const csvUrl = getCSVUrl(sheetUrl);
    // Add timestamp to prevent caching and ensure fresh data
    const csvUrlWithTimestamp = `${csvUrl}&timestamp=${Date.now()}`;
    const response = await fetch(csvUrlWithTimestamp, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return [];
    }
    
    // Skip header row and parse data
    const dataLines = lines.slice(1);
    const salesData: SalesData[] = [];
    
    for (const line of dataLines) {
      const columns = parseCSVLine(line);
      
      // Skip empty rows or header-like rows
      if (columns.length < 15 || !columns[1]?.trim()) {
        continue;
      }
      
      // Skip if first column contains header text (case-insensitive)
      const firstCol = columns[0]?.trim().toLowerCase() || '';
      const secondCol = columns[1]?.trim().toLowerCase() || '';
      if (firstCol === 'date' || secondCol === 'firm name' || secondCol === 'contact person') {
        continue;
      }
      
      salesData.push({
        date: columns[0]?.trim() || '',
        firmName: columns[1]?.trim() || '',
        contactPerson: columns[2]?.trim() || '',
        emailPhone: columns[3]?.trim() || '',
        source: columns[4]?.trim() || '',
        profile: parseInt(columns[5]?.trim() || '0') || 0,
        cultural: parseInt(columns[6]?.trim() || '0') || 0,
        engagement: parseInt(columns[7]?.trim() || '0') || 0,
        stability: parseInt(columns[8]?.trim() || '0') || 0,
        retention: parseInt(columns[9]?.trim() || '0') || 0,
        score: parseInt(columns[10]?.trim() || '0') || 0,
        fitLevel: columns[11]?.trim() || '',
        touchPoint: columns[12]?.trim() || '',
        leadResponse: columns[13]?.trim() || '',
        note: columns[14]?.trim() || '',
        leadStatus: columns[15]?.trim() || '', // New field for Cold/Warm/Hot status (Column P)
      });
    }
    
    return salesData;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}

// Parse CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
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
  
  const readyToEngage = data.filter(item => item.fitLevel === 'Ready to Engage').length;
  const developQualify = data.filter(item => item.fitLevel === 'Develop & Qualify').length;
  const unqualified = data.filter(item => item.fitLevel === 'Unqualified').length;
  
  const scores = data.map(item => item.score).filter(score => score > 0);
  const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
  
  // Find most common source
  const sourceCounts = data.reduce((acc, item) => {
    if (item.source) {
      acc[item.source] = (acc[item.source] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const topSource = Object.entries(sourceCounts).reduce((max, [source, count]) => 
    count > (sourceCounts[max] || 0) ? source : max, '');
  
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
    const gid = sheetUrl.match(/gid=(\d+)/)?.[1] || '0';
    
    if (!sheetId) {
      throw new Error('Invalid Google Sheets URL');
    }
    
    // Add timestamp to prevent caching and ensure fresh data
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}&timestamp=${Date.now()}`;
    const response = await fetch(csvUrl, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch IT data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return [];
    }
    
    // Parse ALL rows including header and summary rows (we'll use them for pre-calculated data)
    const allRows: ITData[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const columns = parseCSVLine(lines[i]);
      
      // Skip completely empty rows
      if (columns.length === 0 || !columns.some(col => col?.trim())) {
        continue;
      }
      
      allRows.push({
        timestamp: columns[0]?.trim() || '',
        fullName: columns[1]?.trim() || '',
        account: columns[2]?.trim() || '',
        troubleshootingType: columns[3]?.trim() || '',
        response: columns[4]?.trim() || '',
        isProblemSolved: columns[5]?.trim() || '',
        status: columns[6]?.trim() || '',
        assigned: columns[7]?.trim() || '',
        statusChange: columns[8]?.trim() || '',
        timeResolved: columns[10]?.trim() || '', // Column K (index 10)
        employeeRating: columns[11]?.trim() || '', // Column L (index 11)
        remarks: columns[12]?.trim() || '', // Column M (index 12)
        calculatedResolutionTime: columns[10]?.trim() || '', // Same as timeResolved - Column K
        calculatedColumnN: columns[13]?.trim() || '', // Column N (index 13)
        calculatedColumnO: columns[14]?.trim() || '', // Column O (index 14)
        calculatedColumnP: columns[15]?.trim() || '', // Column P (index 15)
        calculatedColumnQ: columns[16]?.trim() || '', // Column Q (index 16)
      });
    }
    
    return allRows;
  } catch (error) {
    console.error('Error fetching IT data:', error);
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
  if (seconds === 0) return '0s';
  
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
  
  let calculatedResolutionTime = '';
  let overallSatisfactionRate = 0;
  let verySatisfied = 0, verySatisfiedPercent = 0;
  let satisfied = 0, satisfiedPercent = 0;
  let neutral = 0, neutralPercent = 0;
  let dissatisfied = 0, dissatisfiedPercent = 0;
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
      console.log(`✓ Found Overall Satisfaction at Q7: ${satisfactionValue} = ${overallSatisfactionRate}%`);
    }
  }
  
  // If not found in Q7, search through all rows for satisfaction rate
  data.forEach((row, index) => {
    // For row 7 (index 6), check all satisfaction columns
    if (index === 6) {
      const colN = row.calculatedColumnN?.toLowerCase() || '';
      const colO = row.calculatedColumnO || '';
      const colP = row.calculatedColumnP || '';
      const colQ = row.calculatedColumnQ || '';
      
      console.log(`Row 7 - N: "${colN}", O: "${colO}", P: "${colP}", Q: "${colQ}"`);
      
      // Try column Q first
      if (colQ && !overallSatisfactionRate) {
        const match = colQ.match(/([0-9.]+)%/);
        if (match) {
          overallSatisfactionRate = parseFloat(match[1]);
          console.log(`✓ Found Overall Satisfaction in Q7: ${overallSatisfactionRate}%`);
        }
      }
      
      // Try column O if Q is empty
      if (colO && !overallSatisfactionRate && (colN.includes('overall satisfaction') || colN.includes('total satisfaction'))) {
        const match = colO.match(/([0-9.]+)%/);
        if (match) {
          overallSatisfactionRate = parseFloat(match[1]);
          console.log(`✓ Found Overall Satisfaction in O7: ${overallSatisfactionRate}%`);
        }
      }
    }
    
    // Also search through all rows for satisfaction metrics
    const colN = row.calculatedColumnN?.toLowerCase() || '';
    const colO = row.calculatedColumnO || '';
    
    if (colN.includes('very satisfied') && !colN.includes('dissatisfied')) {
      const match = colO.match(/(\d+)\s*\(([0-9.]+)%\)/);
      if (match) {
        verySatisfied = parseInt(match[1]);
        verySatisfiedPercent = parseFloat(match[2]);
      }
    } else if (colN.includes('satisfied:') && !colN.includes('very') && !colN.includes('dissatisfied')) {
      const match = colO.match(/(\d+)\s*\(([0-9.]+)%\)/);
      if (match) {
        satisfied = parseInt(match[1]);
        satisfiedPercent = parseFloat(match[2]);
      }
    } else if (colN.includes('neutral')) {
      const match = colO.match(/(\d+)\s*\(([0-9.]+)%\)/);
      if (match) {
        neutral = parseInt(match[1]);
        neutralPercent = parseFloat(match[2]);
      }
    } else if (colN.includes('dissatisfied')) {
      const match = colO.match(/(\d+)\s*\(([0-9.]+)%\)/);
      if (match) {
        dissatisfied = parseInt(match[1]);
        dissatisfiedPercent = parseFloat(match[2]);
      }
    } else if ((colN.includes('overall satisfaction') || colN.includes('total satisfaction')) && overallSatisfactionRate === 0) {
      const match = colO.match(/([0-9.]+)%/);
      if (match) {
        overallSatisfactionRate = parseFloat(match[1]);
        console.log(`✓ Found Overall Satisfaction at row ${index}: ${overallSatisfactionRate}%`);
      }
    } else if (colN.includes('total responses')) {
      const match = colO.match(/\d+/);
      if (match) {
        totalResponses = parseInt(match[0]);
      }
    }
  });
  
  console.log('Summary Stats Extracted:', { calculatedResolutionTime, overallSatisfactionRate });
  
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
  const actualTickets = data.filter(item => {
    const timestamp = item.timestamp?.toLowerCase() || '';
    // Skip header row and rows without valid timestamps
    if (timestamp === 'timestamp' || timestamp === '' || !timestamp) {
      return false;
    }
    // Try to parse as date - if it's a valid date, it's a ticket row
    const date = new Date(item.timestamp);
    return !isNaN(date.getTime());
  });
  
  const totalTickets = actualTickets.length;
  
  // Count resolved/unresolved tickets
  const resolvedTickets = actualTickets.filter(item => 
    item.status?.toLowerCase() === 'resolved' || 
    item.isProblemSolved?.toLowerCase() === 'yes'
  ).length;
  const unresolvedTickets = totalTickets - resolvedTickets;
  
  // Try to get pre-calculated summary stats first
  const summaryStats = extractITSummaryStats(data);
  
  // Use pre-calculated average resolution time if available, otherwise calculate
  let avgResolutionTime = '';
  if (summaryStats && summaryStats.calculatedResolutionTime) {
    avgResolutionTime = summaryStats.calculatedResolutionTime;
    console.log('Using pre-calculated resolution time:', avgResolutionTime);
  } else {
    const resolutionTimes = actualTickets
      .filter(item => item.timeResolved)
      .map(item => parseTimeToSeconds(item.timeResolved))
      .filter(time => time > 0);
    
    const avgResolutionSeconds = resolutionTimes.length > 0
      ? Math.round(resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length)
      : 0;
    avgResolutionTime = formatSecondsToTime(avgResolutionSeconds);
    console.log('Calculated resolution time:', avgResolutionTime);
  }
  
  // Calculate employee rating (percentage of "Excellent" ratings)
  const ratingCounts = actualTickets.filter(item => item.employeeRating).length;
  const excellentRatings = actualTickets.filter(item => 
    item.employeeRating?.toLowerCase() === 'excellent'
  ).length;
  const employeeRating = ratingCounts > 0 
    ? Math.round((excellentRatings / ratingCounts) * 1000) / 10 
    : 0;
  
  // Use pre-calculated satisfaction rate if available, otherwise calculate
  let satisfactionRate = 0;
  if (summaryStats && summaryStats.overallSatisfactionRate > 0) {
    satisfactionRate = summaryStats.overallSatisfactionRate;
    console.log('Using pre-calculated satisfaction rate:', satisfactionRate);
  } else {
    const responseCounts = actualTickets.filter(item => item.response).length;
    const satisfiedResponses = actualTickets.filter(item => 
      item.response?.toLowerCase().includes('satisfied') || 
      item.response?.toLowerCase().includes('very satisfied')
    ).length;
    satisfactionRate = responseCounts > 0 
      ? Math.round((satisfiedResponses / responseCounts) * 1000) / 10 
      : 0;
    console.log('Calculated satisfaction rate:', satisfactionRate);
  }
  
  // Find most common account
  const accountCounts = actualTickets.reduce((acc, item) => {
    if (item.account) {
      acc[item.account] = (acc[item.account] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const topAccount = Object.entries(accountCounts).reduce((max, [account, count]) => 
    count > (accountCounts[max] || 0) ? account : max, '');
  
  // Find most common troubleshooting type
  const typeCounts = actualTickets.reduce((acc, item) => {
    if (item.troubleshootingType) {
      // Split by comma if multiple types
      const types = item.troubleshootingType.split(',').map(t => t.trim());
      types.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);
  
  const topTroubleshootingType = Object.entries(typeCounts).reduce((max, [type, count]) => 
    count > (typeCounts[max] || 0) ? type : max, '');
  
  return {
    totalTickets,
    resolvedTickets,
    unresolvedTickets,
    avgResolutionTime,
    employeeRating,
    topAccount,
    topTroubleshootingType,
    satisfactionRate,
  };
}
