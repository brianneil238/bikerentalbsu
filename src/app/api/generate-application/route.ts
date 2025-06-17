import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { promises as fs } from 'fs';
import path from 'path';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// These imports are for DOCX templating and conversion
// You will need to install these packages:
// npm install docxtemplater @docxtemplater/html-module 
// npm install @docxtemplater/image-module --save-exact
// npm install libreoffice-convert

// For DOCX templating
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

// For DOCX to PDF conversion (requires LibreOffice installed on the system)
import libreoffice from 'libreoffice-convert';
import { promisify } from 'util';
const convert = promisify(libreoffice.convert);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    console.log("Backend Session:", session);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { fullName, srCode, address, sex, program, gwa } = await req.json();

    if (!fullName || !srCode || !address || !sex || !program || !gwa) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Load DOCX template
    const templatePath = path.join(process.cwd(), 'public', 'Application-Form-for-Bicycles.docx');
    let content;
    try {
      content = await fs.readFile(templatePath, 'binary');
    } catch (readError) {
      console.error('Error reading DOCX template:', readError);
      return NextResponse.json({ message: 'Application template not found or unreadable.' }, { status: 500 });
    }

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 2. Set the data for the template and render the document
    try {
      doc.render({
        fullName,
        srCode,
        address,
        sex,
        program,
        gwa,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      });
    } catch (renderError) {
      console.error('Error rendering DOCX document:', renderError);
      return NextResponse.json({ message: 'Error processing document template.' }, { status: 500 });
    }

    const filledDocxBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    });

    // 4. Convert DOCX to PDF
    let pdfBuffer: Buffer;
    try {
      // IMPORTANT: This requires LibreOffice to be installed on your system
      // https://www.npmjs.com/package/libreoffice-convert
      pdfBuffer = await convert(filledDocxBuffer, '.pdf', undefined); 
    } catch (conversionError) {
      console.error('Error converting DOCX to PDF:', conversionError);
      return NextResponse.json({ message: 'Failed to convert document to PDF. Ensure LibreOffice is installed.' }, { status: 500 });
    }

    // 5. Save the PDF locally
    const pdfFileName = `application_${session.user.id}_${Date.now()}.pdf`;
    const pdfDirPath = path.join(process.cwd(), 'public', 'generated_pdfs');
    const pdfFilePath = path.join(pdfDirPath, pdfFileName);
    const pdfUrl = `/generated_pdfs/${pdfFileName}`;

    await fs.mkdir(pdfDirPath, { recursive: true }); // Ensure directory exists
    await fs.writeFile(pdfFilePath, pdfBuffer);

    // 6. Store reference in PostgreSQL database (disabled for now)
    // Note: Using BikeRentalApplication model instead for the new implementation

    return NextResponse.json({
      message: 'PDF generated and saved successfully!',
      pdfUrl,
    });
  } catch (error) {
    console.error('API Error generating application:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
} 