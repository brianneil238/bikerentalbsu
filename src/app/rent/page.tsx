'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { BikeStatus } from '@@/index';

// Dynamically import the map component to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg" />
  ),
});

interface Bike {
  id: string;
  bikeNumber: string;
  status: BikeStatus;
  currentLocation: {
    lat: number;
    lng: number;
  } | null;
  model: string;
}

export default function RentPage() {
  const { data: session, status } = useSession();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New state for application form - expanded to match DOCX template
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [srCode, setSrCode] = useState('');
  const [sex, setSex] = useState(''); // Male or Female
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState(session?.user?.email || ''); // Pre-fill with session email
  const [collegeProgram, setCollegeProgram] = useState('');
  const [gwaLastSemester, setGwaLastSemester] = useState('');
  const [extracurricularActivities, setExtracurricularActivities] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [streetName, setStreetName] = useState('');
  const [barangay, setBarangay] = useState('');
  const [municipalityCity, setMunicipalityCity] = useState('');
  const [province, setProvince] = useState('');
  const [distanceFromCampus, setDistanceFromCampus] = useState(''); // Less than 1 km, 1 km but less than 5 km, 5 km and above
  const [monthlyFamilyIncome, setMonthlyFamilyIncome] = useState('');
  const [durationOfUse, setDurationOfUse] = useState(''); // One Semester, Others

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  
  // Application form submission state
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState<string | null>(null);
  const [applicationError, setApplicationError] = useState<string | null>(null);

  useEffect(() => {
    fetchBikes();
    // Set up real-time updates
    const interval = setInterval(fetchBikes, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [session]); // Add session to dependency array if emailAddress is pre-filled

  const fetchBikes = async () => {
    try {
      const response = await fetch('/api/bikes');
      if (!response.ok) throw new Error('Failed to fetch bikes');
      const data = await response.json();
      setBikes(data);
    } catch (err) {
      setError('Failed to load bikes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRentBike = async (bikeId: string) => {
    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bikeId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      const rental = await response.json(); // Capture the rental object
      
      // Trigger PDF generation after successful rental
      if (session?.user?.id && rental?.id) {
        await handleGeneratePdf(session.user.id, rental.id); // Pass userId and rentalId
      }

      // Refresh bike list
      fetchBikes();
      // Redirect to active rental page
      window.location.href = '/rent/active';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rent bike');
    }
  };

  const handleGeneratePdf = async (
    userId: string,
    rentalId: string
  ) => {
    setIsGeneratingPdf(true);
    setPdfUrl(null);
    setPdfError(null);

    console.log("Generating PDF for userId:", userId, "and rentalId:", rentalId);

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: {
            lastName,
            firstName,
            middleName,
            srCode,
            sex,
            dateOfBirth,
            phoneNumber,
            emailAddress,
            collegeProgram,
            gwaLastSemester,
            extracurricularActivities,
            houseNo,
            streetName,
            barangay,
            municipalityCity,
            province,
            distanceFromCampus,
            monthlyFamilyIncome,
            durationOfUse,
          },
          userId: userId,
          rentalId: rentalId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      const blob = await response.blob(); // Get the response as a blob
      const url = URL.createObjectURL(blob);

      setPdfUrl(url); // Set the URL for download

    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Form submitted!');
    setIsSubmittingApplication(true);
    setApplicationError(null);
    setApplicationSuccess(null);

    try {
      console.log('📤 Sending application data...');
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          middleName,
          srCode,
          sex,
          dateOfBirth,
          phoneNumber,
          email: emailAddress,
          collegeProgram,
          gwaLastSemester: gwaLastSemester ? parseFloat(gwaLastSemester) : null,
          extracurricularActivities,
          houseNo,
          streetName,
          barangay,
          municipalityCity,
          province,
          distanceFromCampus,
          monthlyFamilyIncome: monthlyFamilyIncome ? parseFloat(monthlyFamilyIncome) : null,
          durationOfUse,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to submit application');
      }

      const result = await response.json();
      console.log('✅ Application submitted successfully:', result);
      setApplicationSuccess(result.message);
      
      // Optionally clear the form after successful submission
      // You can uncomment these lines if you want to reset the form
      // setFirstName(''); setLastName(''); setMiddleName(''); etc.
      
    } catch (err) {
      setApplicationError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-green-800">Rent a Bike</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <div className="card p-4">
            <h2 className="text-xl font-semibold mb-4 text-green-800">Available Bikes</h2>
            <div className="h-[600px] rounded-lg overflow-hidden">
              <Map
                bikes={bikes}
                selectedBike={selectedBike}
                onBikeSelect={setSelectedBike}
              />
            </div>
          </div>
        </div>

        {/* Bike List Section */}
        <div className="card p-4">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Bike List</h2>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-24 bg-gray-100 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {bikes.map((bike) => (
                <div
                  key={bike.id}
                  className={`p-4 rounded-lg border ${
                    selectedBike?.id === bike.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-green-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-green-800">Bike #{bike.bikeNumber}</h3>
                      <p className="text-sm text-gray-600">{bike.model}</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${
                          bike.status === 'AVAILABLE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {bike.status}
                      </span>
                    </div>
                    {bike.status === 'AVAILABLE' && (
                      <button
                        onClick={() => handleRentBike(bike.id)}
                        className="btn-primary"
                      >
                        Rent
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Application Form Section */}
      <div className="mt-12 card p-6">
        <h2 className="text-2xl font-bold mb-6 text-green-800">Bike Rental Application Form</h2>
        <p className="text-gray-600 mb-6">Please fill out the form below to generate your official application document.</p>

        {applicationError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            Error submitting application: {applicationError}
          </div>
        )}

        {applicationSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold">{applicationSuccess}</p>
          </div>
        )}

        {pdfError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            Error generating PDF: {pdfError}
          </div>
        )}

        {pdfUrl && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            <p className="font-semibold mb-2">PDF generated successfully!</p>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline"
            >
              Download your application PDF
            </a>
          </div>
        )}

        <button
          onClick={async () => {
            const formData = {
              firstName,
              lastName,
              middleName,
              srCode,
              sex,
              dateOfBirth,
              phoneNumber,
              emailAddress,
              collegeProgram,
              gwaLastSemester,
              extracurricularActivities,
              houseNo,
              streetName,
              barangay,
              municipalityCity,
              province,
              distanceFromCampus,
              monthlyFamilyIncome,
              durationOfUse
            };
            try {
              const res = await fetch("/api/pdf", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templatePath: "public/templates/rental_agreement_template.docx", formData }) });
              if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to generate PDF");
              }
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "rental_agreement.pdf";
              a.click();
              window.URL.revokeObjectURL(url);
            } catch (err) {
               setPdfError(err instanceof Error ? err.message : "Unknown error");
            }
          }}
          className="btn-primary mb-6"
        >
          Download Rental Agreement PDF
        </button>

        <form onSubmit={handleApplicationSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-green-700 mb-1">Last Name</label>
            <input
              type="text"
              id="lastName"
              className="form-input input-short"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-green-700 mb-1">First Name</label>
            <input
              type="text"
              id="firstName"
              className="form-input input-short"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="middleName" className="block text-sm font-medium text-green-700 mb-1">Middle Name</label>
            <input
              type="text"
              id="middleName"
              className="form-input input-short"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="srCode" className="block text-sm font-medium text-green-700 mb-1">SR Code</label>
            <input
              type="text"
              id="srCode"
              className="form-input input-short"
              value={srCode}
              onChange={(e) => setSrCode(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="sex" className="block text-sm font-medium text-green-700 mb-1">Sex</label>
            <select
              id="sex"
              className="form-input input-short"
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              required
            >
              <option value="">Select Sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-green-700 mb-1">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              className="form-input input-short"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-green-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              className="form-input input-short"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="emailAddress" className="block text-sm font-medium text-green-700 mb-1">Email Address</label>
            <input
              type="email"
              id="emailAddress"
              className="form-input input-short"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="collegeProgram" className="block text-sm font-medium text-green-700 mb-1">College Program</label>
            <input
              type="text"
              id="collegeProgram"
              className="form-input input-short"
              value={collegeProgram}
              onChange={(e) => setCollegeProgram(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="gwaLastSemester" className="block text-sm font-medium text-green-700 mb-1">GWA Last Semester</label>
            <input
              type="number"
              id="gwaLastSemester"
              step="0.01"
              className="form-input input-short"
              value={gwaLastSemester}
              onChange={(e) => setGwaLastSemester(e.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label htmlFor="extracurricularActivities" className="block text-sm font-medium text-green-700 mb-1">Extracurricular Activities</label>
            <textarea
              id="extracurricularActivities"
              rows={3}
              className="form-input input-long"
              value={extracurricularActivities}
              onChange={(e) => setExtracurricularActivities(e.target.value)}
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="houseNo" className="block text-sm font-medium text-green-700 mb-1">House Number</label>
            <input
              type="text"
              id="houseNo"
              className="form-input input-short"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="streetName" className="block text-sm font-medium text-green-700 mb-1">Street Name</label>
            <input
              type="text"
              id="streetName"
              className="form-input input-short"
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="barangay" className="block text-sm font-medium text-green-700 mb-1">Barangay</label>
            <input
              type="text"
              id="barangay"
              className="form-input input-short"
              value={barangay}
              onChange={(e) => setBarangay(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="municipalityCity" className="block text-sm font-medium text-green-700 mb-1">Municipality/City</label>
            <input
              type="text"
              id="municipalityCity"
              className="form-input input-short"
              value={municipalityCity}
              onChange={(e) => setMunicipalityCity(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="province" className="block text-sm font-medium text-green-700 mb-1">Province</label>
            <input
              type="text"
              id="province"
              className="form-input input-short"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="distanceFromCampus" className="block text-sm font-medium text-green-700 mb-1">Distance from Campus</label>
            <select
              id="distanceFromCampus"
              className="form-input input-short"
              value={distanceFromCampus}
              onChange={(e) => setDistanceFromCampus(e.target.value)}
              required
            >
              <option value="">Select Distance</option>
              <option value="Less than 1 km">Less than 1 km</option>
              <option value="1 km but less than 5 km">1 km but less than 5 km</option>
              <option value="5 km and above">5 km and above</option>
            </select>
          </div>

          <div>
            <label htmlFor="monthlyFamilyIncome" className="block text-sm font-medium text-green-700 mb-1">Monthly Family Income</label>
            <input
              type="number"
              id="monthlyFamilyIncome"
              step="0.01"
              className="form-input input-short"
              value={monthlyFamilyIncome}
              onChange={(e) => setMonthlyFamilyIncome(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="durationOfUse" className="block text-sm font-medium text-green-700 mb-1">Duration of Use</label>
            <select
              id="durationOfUse"
              className="form-input input-short"
              value={durationOfUse}
              onChange={(e) => setDurationOfUse(e.target.value)}
              required
            >
              <option value="">Select Duration</option>
              <option value="One Semester">One Semester</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={isSubmittingApplication}
                className="btn-primary"
              >
                {isSubmittingApplication ? 'Submitting Application...' : 'Submit Application'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  if (session?.user?.id) {
                    handleGeneratePdf(session.user.id, 'temp-rental-id');
                  }
                }}
                disabled={isGeneratingPdf}
                className="btn-secondary"
              >
                {isGeneratingPdf ? 'Generating PDF...' : 'Generate Application PDF'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 