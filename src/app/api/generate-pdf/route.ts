import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const runtime = 'nodejs20.x';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { htmlContent } = body;

    if (!htmlContent) {
      return NextResponse.json({ error: 'htmlContent is required' }, { status: 400 });
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: 'shell',
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px',
      },
    });

    await browser.close();

    return new NextResponse(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="rental_agreement.pdf"',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (error instanceof Error) {
        return NextResponse.json({ error: 'Failed to generate PDF', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
} 