import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQI1mBFgpUtrV81ZIWyxjDNagtwJM9ReeMU_pY15f1fyhb2zzYvXQ2KrCzg1LZGsEeIBlSrLe8FpEEQ/pub?gid=1628066319&single=true&output=csv";
    
    const response = await fetch(csvUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error("Failed to fetch QB data");
    }

    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());

    // Parse header row
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    // Parse employee data
    const employees: any[] = [];
    let totalsRow: any = null;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) continue;

      // Parse CSV with proper quote handling
      const columns: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          columns.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      columns.push(current.trim());

      // Check if this is the totals row
      if (columns[1] === 'TOTAL') {
        totalsRow = {
          totalEmployees: employees.length,
          totalWeeksPresent: parseFloat(columns[18]) || 0,
          totalPaidLeaves: parseFloat(columns[19]) || 0,
          perfectPresenceCount: parseInt(columns[20]) || 0,
          totalAttendanceBonus: parseFloat(columns[23]?.replace(/[,"]/g, '')) || 0,
          totalOnsiteWFH: parseFloat(columns[24]?.replace(/[,"]/g, '')) || 0,
          totalClientSatisfaction: parseFloat(columns[25]?.replace(/[,"]/g, '')) || 0,
          totalTeamContinuity: parseFloat(columns[26]?.replace(/[,"]/g, '')) || 0,
          totalSupervisorAward: parseFloat(columns[27]?.replace(/[,"]/g, '')) || 0,
          totalQuarterlyBonus: parseFloat(columns[28]?.replace(/[,"]/g, '')) || 0,
        };
        continue;
      }

      // Skip if no name (empty row)
      if (!columns[1] || columns[1] === '') continue;

      const employee = {
        id: columns[0],
        name: columns[1],
        account: columns[2],
        dateHired: columns[3],
        requiredWeeks: parseFloat(columns[4]) || 0,
        weeklyAttendance: {
          week1: columns[5] === 'TRUE',
          week2: columns[6] === 'TRUE',
          week3: columns[7] === 'TRUE',
          week4: columns[8] === 'TRUE',
          week5: columns[9] === 'TRUE',
          week6: columns[10] === 'TRUE',
          week7: columns[11] === 'TRUE',
          week8: columns[12] === 'TRUE',
          week9: columns[13] === 'TRUE',
          week10: columns[14] === 'TRUE',
          week11: columns[15] === 'TRUE',
          week12: columns[16] === 'TRUE',
          week13: columns[17] === 'TRUE',
        },
        weeksPresent: parseFloat(columns[18]) || 0,
        paidLeaves: parseFloat(columns[19]) || 0,
        perfectPresenceAward: columns[20] === 'Yes',
        attendanceBonusPerQtr: parseFloat(columns[21]?.replace(/[,"]/g, '')) || 0,
        attendanceBonusPerWk: parseFloat(columns[22]?.replace(/[,"]/g, '')) || 0,
        perfectPresenceAmount: parseFloat(columns[23]?.replace(/[,"]/g, '')) || 0,
        attendanceRelatedBonus: parseFloat(columns[24]?.replace(/[,"]/g, '')) || 0,
        onsiteWFH: parseFloat(columns[25]?.replace(/[,"]/g, '')) || 0,
        clientSatisfaction: parseFloat(columns[26]?.replace(/[,"]/g, '')) || 0,
        teamContinuity: parseFloat(columns[27]?.replace(/[,"]/g, '')) || 0,
        supervisorAward: parseFloat(columns[28]?.replace(/[,"]/g, '')) || 0,
        totalQuarterlyBonus: parseFloat(columns[29]?.replace(/[,"]/g, '')) || 0,
        status: columns[30] || 'Regular',
      };

      employees.push(employee);
    }

    // Calculate summary by account
    const accountSummary: Record<string, any> = {};
    employees.forEach(emp => {
      if (!accountSummary[emp.account]) {
        accountSummary[emp.account] = {
          account: emp.account,
          employeeCount: 0,
          totalBonus: 0,
          avgBonus: 0,
          totalAttendanceBonus: 0,
          totalClientSatisfaction: 0,
          totalTeamContinuity: 0,
          totalSupervisorAward: 0,
        };
      }
      accountSummary[emp.account].employeeCount++;
      accountSummary[emp.account].totalBonus += emp.totalQuarterlyBonus;
      accountSummary[emp.account].totalAttendanceBonus += emp.attendanceRelatedBonus;
      accountSummary[emp.account].totalClientSatisfaction += emp.clientSatisfaction;
      accountSummary[emp.account].totalTeamContinuity += emp.teamContinuity;
      accountSummary[emp.account].totalSupervisorAward += emp.supervisorAward;
    });

    // Calculate averages
    Object.values(accountSummary).forEach((acc: any) => {
      acc.avgBonus = acc.totalBonus / acc.employeeCount;
    });

    // Status breakdown
    const statusBreakdown = {
      regular: employees.filter(e => e.status === 'Regular').length,
      probationary: employees.filter(e => e.status === 'Probationary').length,
      resigned: employees.filter(e => e.status === 'Resigned').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        employees,
        totals: totalsRow,
        accountSummary: Object.values(accountSummary),
        statusBreakdown,
        summary: {
          totalEmployees: employees.length,
          totalBonusPayout: totalsRow?.totalQuarterlyBonus || 0,
          avgBonusPerEmployee: (totalsRow?.totalQuarterlyBonus || 0) / employees.length,
          totalAttendanceBonus: totalsRow?.totalAttendanceBonus || 0,
          totalClientSatisfaction: totalsRow?.totalClientSatisfaction || 0,
          totalTeamContinuity: totalsRow?.totalTeamContinuity || 0,
          totalSupervisorAward: totalsRow?.totalSupervisorAward || 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching QB data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch data",
      },
      { status: 500 }
    );
  }
}

