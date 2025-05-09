import { ExcelService } from '@/lib/excel-service';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate if all required fields are present
    const requiredFields = [
      'professional',
      'licenseNumber',
      'authorizedSession',
      'patientName',
      'responsible',
      'healthPlan',
      'weekDays',
    ];
    
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Generate the attendance spreadsheet
    const spreadsheetBuffer = await ExcelService.generateAttendanceSheet(data);
    
    // Create response with Excel file
    const response = new NextResponse(spreadsheetBuffer);
    
    // Set headers for download
    response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.headers.set('Content-Disposition', 'attachment; filename="attendance-sheet.xlsx"');
    
    return response;
  } catch (error) {
    console.error('Error generating spreadsheet:', error);
    return NextResponse.json(
      { error: 'Error generating spreadsheet. Please verify your data and try again.' },
      { status: 500 }
    );
  }
} 