'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BikeStatus } from '@/types/index';

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

interface ApplicationFormData {
  firstName: string;
  lastName: string;
  middleName: string;
  srCode: string;
  sex: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  collegeProgram: string;
  gwaLastSemester: string;
  extracurricularActivities: string;
  houseNo: string;
  streetName: string;
  barangay: string;
  municipalityCity: string;
  province: string;
  distanceFromCampus: string;
  monthlyFamilyIncome: string;
  durationOfUse: string;
}

export default function RentPage() {
  const { data: session, status } = useSession();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRenting, setIsRenting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'application' | 'bikes'>('application');
  const [hasApplication, setHasApplication] = useState(false);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);
  const [applicationData, setApplicationData] = useState<ApplicationFormData>({
    firstName: '',
    lastName: '',
    middleName: '',
    srCode: '',
    sex: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
    collegeProgram: '',
    gwaLastSemester: '',
    extracurricularActivities: '',
    houseNo: '',
    streetName: '',
    barangay: '',
    municipalityCity: '',
    province: '',
    distanceFromCampus: '',
    monthlyFamilyIncome: '',
    durationOfUse: ''
  });

  // Debug session
  console.log('🔍 Rent Page - Session status:', status);
  console.log('🔍 Rent Page - Session data:', session);

  useEffect(() => {
    if (status === 'loading') return; // Wait for session to load
    
    // Let NextAuth middleware handle authentication redirects
    // Only fetch bikes if we're authenticated
    if (status === 'unauthenticated') {
      console.log('User not authenticated');
      return;
    }
    
    // If we have a session, check for existing application and fetch bikes
    if (status === 'authenticated' && session) {
      console.log('User authenticated, checking application and fetching bikes');
      checkExistingApplication();
      fetchBikes();
    }
  }, [status, session]);

  const checkExistingApplication = async () => {
    try {
      const response = await fetch('/api/applications');
      if (response.ok) {
        const applications = await response.json();
        const activeApplication = applications.find((app: any) => 
          ['PENDING', 'APPROVED', 'UNDER_REVIEW'].includes(app.status)
        );
        
        if (activeApplication) {
          setHasApplication(true);
          setCurrentStep('bikes');
        }
      }
    } catch (err) {
      console.error('Error checking existing application:', err);
    }
  };

  const fetchBikes = async () => {
    try {
      setError(null);
      const response = await fetch('/api/bikes');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch bikes`);
      }
      
      const data = await response.json();
      setBikes(data);
    } catch (err) {
      console.error('Fetch bikes error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load bikes. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmittingApplication) return;
    
    setIsSubmittingApplication(true);
    setError(null);

    try {
      // Submit application
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit application');
      }

      // Application submitted successfully
      setHasApplication(true);
      setCurrentStep('bikes');
      
      // Show success message
      alert('Application submitted successfully! You can now proceed to rent a bike.');
      
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: applicationData,
          userId: session?.user?.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bike_rental_application_${applicationData.lastName}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('PDF download error:', err);
      setError('Failed to download PDF. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRentBike = async (bikeId: string) => {
    if (isRenting) return;
    
    setIsRenting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bikeId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to rent bike`);
      }

      const rental = await response.json();
      
      // Success - redirect to active rental page
      window.location.href = '/rent/active';
    } catch (err) {
      console.error('Rent bike error:', err);
      setError(err instanceof Error ? err.message : 'Failed to rent bike. Please try again.');
    } finally {
      setIsRenting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          Please log in to rent a bike.
          <br />
          <a href="/login" className="text-green-600 hover:text-green-800">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-green-800">Rent a Bike</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-medium ${
            currentStep === 'application' || hasApplication ? 'bg-green-600' : 'bg-gray-300'
          }`}>
            1
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700">Application Form</span>
        </div>
        <div className="w-16 h-1 bg-gray-200 mx-4">
          <div className={`h-1 transition-all duration-300 ${
            hasApplication ? 'bg-green-600 w-full' : 'bg-gray-200 w-0'
          }`}></div>
        </div>
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-medium ${
            currentStep === 'bikes' && hasApplication ? 'bg-green-600' : 'bg-gray-300'
          }`}>
            2
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700">Select Bike</span>
        </div>
      </div>

      {currentStep === 'application' && !hasApplication && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-green-800">Bike Rental Application Form</h2>
            <button
              onClick={handleDownloadPDF}
              disabled={!applicationData.firstName || !applicationData.lastName}
              className={`px-4 py-2 rounded-lg text-white font-medium ${
                applicationData.firstName && applicationData.lastName
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Download PDF
            </button>
          </div>
          
          <form onSubmit={handleApplicationSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={applicationData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={applicationData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    value={applicationData.middleName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your middle name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SR Code *
                  </label>
                  <input
                    type="text"
                    name="srCode"
                    value={applicationData.srCode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 20-12345"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sex *
                  </label>
                  <select
                    name="sex"
                    value={applicationData.sex}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={applicationData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={applicationData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., +63 912 345 6789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={applicationData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    College/Program *
                  </label>
                  <input
                    type="text"
                    name="collegeProgram"
                    value={applicationData.collegeProgram}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., BS Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GWA Last Semester
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    max="5.00"
                    name="gwaLastSemester"
                    value={applicationData.gwaLastSemester}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 1.75"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extracurricular Activities
                  </label>
                  <textarea
                    name="extracurricularActivities"
                    value={applicationData.extracurricularActivities}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="List your extracurricular activities, if any"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Present Home Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    House No. *
                  </label>
                  <input
                    type="text"
                    name="houseNo"
                    value={applicationData.houseNo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="House/Lot/Block No."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Name *
                  </label>
                  <input
                    type="text"
                    name="streetName"
                    value={applicationData.streetName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Street name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Barangay *
                  </label>
                  <input
                    type="text"
                    name="barangay"
                    value={applicationData.barangay}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Barangay"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Municipality/City *
                  </label>
                  <input
                    type="text"
                    name="municipalityCity"
                    value={applicationData.municipalityCity}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Municipality or City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Province *
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={applicationData.province}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Province"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance from Campus *
                  </label>
                  <select
                    name="distanceFromCampus"
                    value={applicationData.distanceFromCampus}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select distance</option>
                    <option value="Less than 1 km">Less than 1 km</option>
                    <option value="1 km but less than 5 km">1 km but less than 5 km</option>
                    <option value="5 km and above">5 km and above</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial & Usage Information */}
            <div className="border-l-4 border-green-600 pl-4">
              <h3 className="text-lg font-semibold text-green-800 mb-4">Financial & Usage Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Family Income
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="monthlyFamilyIncome"
                    value={applicationData.monthlyFamilyIncome}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter amount in PHP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intended Duration of Use *
                  </label>
                  <select
                    name="durationOfUse"
                    value={applicationData.durationOfUse}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select duration</option>
                    <option value="One Semester">One Semester</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                disabled={isSubmittingApplication}
                className={`px-6 py-3 rounded-lg text-white font-medium ${
                  isSubmittingApplication 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isSubmittingApplication ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      )}

      {(currentStep === 'bikes' || hasApplication) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bike List Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-800">Available Bikes</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="h-24 bg-gray-100 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : bikes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No bikes available at the moment.
              </div>
            ) : (
              <div className="space-y-4">
                {bikes.map((bike) => (
                  <div
                    key={bike.id}
                    className="p-4 rounded-lg border border-green-200"
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
                          disabled={isRenting}
                          className={`px-4 py-2 rounded-lg text-white font-medium ${
                            isRenting 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {isRenting ? 'Renting...' : 'Rent'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-800">How to Rent</h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">1</span>
                <p>Choose an available bike from the list</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">2</span>
                <p>Click the "Rent" button to start your rental</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">3</span>
                <p>You'll be redirected to your active rental page</p>
              </div>
              <div className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">4</span>
                <p>End your rental when you're done</p>
              </div>
            </div>

            {session && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Account Info</h3>
                <p className="text-sm text-blue-700">
                  Logged in as: {session.user?.email}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 