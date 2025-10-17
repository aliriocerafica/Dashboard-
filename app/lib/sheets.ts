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
}

export interface DashboardStats {
  totalLeads: number;
  readyToEngage: number;
  developQualify: number;
  unqualified: number;
  averageScore: number;
  topSource: string;
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
    const response = await fetch(csvUrl);
    
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
