import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const { formData, userId, rentalId } = await req.json();
    
    console.log('🚀 PDF Generation started for user:', userId);

    // Validate required form data
    if (!formData || !formData.firstName || !formData.lastName) {
      return NextResponse.json(
        { message: 'Missing required form data' }, 
        { status: 400 }
      );
    }

    // Create HTML content for the PDF
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Bike Rental Application</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section h3 { color: #2d5016; border-bottom: 2px solid #2d5016; padding-bottom: 5px; }
        .field { margin: 10px 0; }
        .field-label { font-weight: bold; display: inline-block; width: 200px; }
        .field-value { display: inline-block; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BIKE RENTAL APPLICATION FORM</h1>
        <p>Application Date: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <div class="section">
        <h3>Personal Information</h3>
        <div class="field">
          <span class="field-label">Full Name:</span>
          <span class="field-value">${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">SR Code:</span>
          <span class="field-value">${formData.srCode || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Sex:</span>
          <span class="field-value">${formData.sex || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Date of Birth:</span>
          <span class="field-value">${formData.dateOfBirth || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Phone Number:</span>
          <span class="field-value">${formData.phoneNumber || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Email Address:</span>
          <span class="field-value">${formData.emailAddress || formData.email || ''}</span>
        </div>
      </div>

      <div class="section">
        <h3>Academic Information</h3>
        <div class="field">
          <span class="field-label">College Program:</span>
          <span class="field-value">${formData.collegeProgram || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">GWA Last Semester:</span>
          <span class="field-value">${formData.gwaLastSemester || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Extracurricular Activities:</span>
          <span class="field-value">${formData.extracurricularActivities || ''}</span>
        </div>
      </div>

      <div class="section">
        <h3>Address Information</h3>
        <div class="field">
          <span class="field-label">House Number:</span>
          <span class="field-value">${formData.houseNo || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Street Name:</span>
          <span class="field-value">${formData.streetName || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Barangay:</span>
          <span class="field-value">${formData.barangay || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Municipality/City:</span>
          <span class="field-value">${formData.municipalityCity || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Province:</span>
          <span class="field-value">${formData.province || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Distance from Campus:</span>
          <span class="field-value">${formData.distanceFromCampus || ''}</span>
        </div>
      </div>

      <div class="section">
        <h3>Financial & Usage Information</h3>
        <div class="field">
          <span class="field-label">Monthly Family Income:</span>
          <span class="field-value">${formData.monthlyFamilyIncome || ''}</span>
        </div>
        <div class="field">
          <span class="field-label">Duration of Use:</span>
          <span class="field-value">${formData.durationOfUse || ''}</span>
        </div>
      </div>

      <div class="footer">
        <p>This is an official bike rental application form generated on ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
    `;

    console.log('📝 HTML content generated successfully');

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    
    console.log('✅ PDF generated successfully, size:', pdfBuffer.length, 'bytes');

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="bike_rental_application_${formData.lastName}_${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    return NextResponse.json(
      { 
        message: 'Error generating PDF', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
} 