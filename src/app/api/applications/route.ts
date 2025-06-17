import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    console.log('🚀 Application API called');
    const session = await getServerSession(authOptions);
    console.log('👤 Session:', session?.user?.id);

    if (!session || !session.user) {
      console.log('❌ No session found');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.json();
    console.log('📝 Form data received:', Object.keys(formData));
    
    // Validate required fields
    const requiredFields = [
      'firstName', 'lastName', 'srCode', 'sex', 'dateOfBirth', 
      'phoneNumber', 'email', 'collegeProgram', 'houseNo', 
      'streetName', 'barangay', 'municipalityCity', 'province', 
      'distanceFromCampus', 'durationOfUse'
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if user already has a pending or approved application
    const existingApplication = await prisma.bikeRentalApplication.findFirst({
      where: {
        userId: session.user.id,
        status: {
          in: ['PENDING', 'APPROVED', 'UNDER_REVIEW']
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { message: 'You already have an active application. Please wait for it to be processed.' },
        { status: 400 }
      );
    }

    // Create the application
    console.log('💾 Creating application for user:', session.user.id);
    const application = await prisma.bikeRentalApplication.create({
      data: {
        userId: session.user.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName || null,
        srCode: formData.srCode,
        sex: formData.sex,
        dateOfBirth: new Date(formData.dateOfBirth),
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        collegeProgram: formData.collegeProgram,
        gwaLastSemester: formData.gwaLastSemester ? parseFloat(formData.gwaLastSemester) : null,
        extracurricularActivities: formData.extracurricularActivities || null,
        houseNo: formData.houseNo,
        streetName: formData.streetName,
        barangay: formData.barangay,
        municipalityCity: formData.municipalityCity,
        province: formData.province,
        distanceFromCampus: formData.distanceFromCampus,
        monthlyFamilyIncome: formData.monthlyFamilyIncome ? parseFloat(formData.monthlyFamilyIncome) : null,
        durationOfUse: formData.durationOfUse,
        status: 'PENDING'
      }
    });

    console.log('✅ Application created successfully:', application.id);
    return NextResponse.json({
      message: 'Application submitted successfully!',
      applicationId: application.id,
      status: application.status
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating application:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's applications
    const applications = await prisma.bikeRentalApplication.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        submittedAt: 'desc'
      }
    });

    return NextResponse.json(applications);

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 