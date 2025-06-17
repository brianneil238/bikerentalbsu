import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { generatePDF } from "@/lib/pdf";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { templatePath, formData } = await request.json();
    if (!templatePath || !formData) {
      return NextResponse.json({ error: "Missing templatePath or formData." }, { status: 400 });
    }

    // Generate PDF (using libreoffice-convert) (Step 1)
    const pdfBuffer = await generatePDF(templatePath, formData);

    // (Step 2: In production, upload pdfBuffer to Supabase Storage and get a public URL.)
    // For local dev, we'll use a relative URL (e.g. "/generated_pdfs/rental_agreement.pdf").
    const pdfFileName = "rental_agreement.pdf";
    const pdfUrl = "/generated_pdfs/" + pdfFileName;

    // (Step 3: Update GeneratedApplication record in the database.)
    // (Note: In production, you'd use the public URL from Supabase Storage.)
    // (For demo, we'll assume a "rentalId" is provided (or you can create a dummy one).)
    // (If you do not have a rentalId, you can omit the rentalId field or create a dummy record.)
    // Removed as pdfUrl will be saved to Rental record via rental API
    // const dummyRentalId = "dummy-rental-id"; // (Replace with actual rentalId if available.)
    // await prisma.generatedApplication.create({
    //   data: {
    //     userId: session.user.id,
    //     rentalId: dummyRentalId, // (In production, use the real rentalId.)
    //     pdfUrl: pdfUrl,
    //   },
    // });

    // (Step 4: Return the PDF as a downloadable attachment.)
    // Changed to return the pdfUrl and pdfBuffer directly
    return NextResponse.json({ pdfUrl, pdfBuffer: pdfBuffer.toString('base64') });
  } catch (err) {
    console.error("PDF conversion error:", err);
    return NextResponse.json({ error: "Conversion failed: " + (err instanceof Error ? err.message : String(err)) }, { status: 500 });
  }
} 