import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQI1mBFgpUtrV81ZIWyxjDNagtwJM9ReeMU_pY15f1fyhb2zzYvXQ2KrCzg1LZGsEeIBlSrLe8FpEEQ/pub?gid=879272353&single=true&output=csv";
    
    const response = await fetch(csvUrl, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error("Failed to fetch attendance bonus data");
    }

    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());

    // Parse CSV data
    const teamData: any[] = [];
    let totalRow: any = null;
    let hiredResignedRow: any = null;

    // Start from line 3 (skip header rows)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines and notes
      if (!line.trim() || line.toLowerCase().includes('note:')) {
        continue;
      }
      
      const columns = line.split(',').map(col => col.trim().replace(/"/g, ''));

      if (columns[0] === 'TOTAL') {
        totalRow = {
          august: parseInt(columns[1]) || 0,
          september: parseInt(columns[2]) || 0,
          october: parseInt(columns[3]) || 0,
        };
      } else if (columns[0] === 'Hired/Resigned') {
        hiredResignedRow = {
          september: parseInt(columns[2]) || 0,
          october: parseInt(columns[3]) || 0,
        };
      } else if (columns[0] && columns[0] !== '') {
        teamData.push({
          account: columns[0],
          august: parseInt(columns[1]) || 0,
          september: parseInt(columns[2]) || 0,
          october: parseInt(columns[3]) || 0,
          withBonus: columns[4] === 'Yes',
        });
      }
    }

    // Calculate summary statistics
    const withBonusCount = teamData.filter(team => team.withBonus).length;
    const withoutBonusCount = teamData.filter(team => !team.withBonus).length;
    
    // Calculate average employees per month
    const avgAugust = totalRow ? Math.round(totalRow.august / teamData.length) : 0;
    const avgSeptember = totalRow ? Math.round(totalRow.september / teamData.length) : 0;
    const avgOctober = totalRow ? Math.round(totalRow.october / teamData.length) : 0;

    return NextResponse.json({
      success: true,
      data: {
        teams: teamData,
        totals: totalRow,
        hiredResigned: hiredResignedRow,
        summary: {
          totalTeams: teamData.length,
          withBonusCount,
          withoutBonusCount,
          avgAugust,
          avgSeptember,
          avgOctober,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching attendance bonus data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch data",
      },
      { status: 500 }
    );
  }
}

