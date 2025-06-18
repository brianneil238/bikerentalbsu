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

interface Rental {
  id: string;
  startTime: string;
  endTime: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  bike: Bike;
  distance: number | null;
  carbonSaved: number | null;
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
  const [submittedApplicationData, setSubmittedApplicationData] = useState<ApplicationFormData | null>(null);
  const [showApplicationReceipt, setShowApplicationReceipt] = useState(false);
  const [currentRental, setCurrentRental] = useState<Rental | null>(null);
  const [showRentalStatus, setShowRentalStatus] = useState(false);
  const [isExtendingRental, setIsExtendingRental] = useState(false);
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
      fetchCurrentRental();
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
          setSubmittedApplicationData(activeApplication);
        }
      }
    } catch (err) {
      console.error('Error checking existing application:', err);
    }
  };

  const fetchCurrentRental = async () => {
    try {
      const response = await fetch('/api/rentals');
      if (response.ok) {
        const rentals = await response.json();
        const activeRental = rentals.find((r: Rental) => r.status === 'ACTIVE');
        setCurrentRental(activeRental || null);
      }
    } catch (err) {
      console.error('Error fetching current rental:', err);
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
      setSubmittedApplicationData(applicationData);
      
      // Show success message
      alert('Application submitted successfully! You can now view your application receipt and proceed to rent a bike.');
      
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleDownloadPDF = async (dataToUse?: ApplicationFormData) => {
    const formData = dataToUse || applicationData;
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData: formData,
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
      a.download = `bike_rental_application_${formData.lastName}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err) {
      console.error('PDF download error:', err);
      setError('Failed to download PDF. Please try again.');
    }
  };

  const handleExtendRental = async () => {
    if (!currentRental || isExtendingRental) return;
    
    setIsExtendingRental(true);
    setError(null);

    try {
      const response = await fetch('/api/rentals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentalId: currentRental.id,
          action: 'extend',
          extendHours: 2 // Extend by 2 hours
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to extend rental');
      }

      // Refresh rental data
      await fetchCurrentRental();
      alert('Rental extended successfully by 2 hours!');
      
    } catch (err) {
      console.error('Extend rental error:', err);
      setError(err instanceof Error ? err.message : 'Failed to extend rental. Please try again.');
    } finally {
      setIsExtendingRental(false);
    }
  };

  const handleEndRental = async () => {
    if (!currentRental) return;

    try {
      const response = await fetch('/api/rentals', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentalId: currentRental.id,
          action: 'end',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end rental');
      }

      setCurrentRental(null);
      setShowRentalStatus(false);
      alert('Rental ended successfully! You can now rent another bike.');
      
    } catch (err) {
      console.error('End rental error:', err);
      setError('Failed to end rental. Please try again.');
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

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-8">
        {submittedApplicationData && (
          <button
            onClick={() => setShowApplicationReceipt(!showApplicationReceipt)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{showApplicationReceipt ? 'Hide' : 'View'} Application Receipt</span>
          </button>
        )}
        
        {currentRental && (
          <button
            onClick={() => setShowRentalStatus(!showRentalStatus)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{showRentalStatus ? 'Hide' : 'View'} Rental Status</span>
          </button>
        )}
      </div>

      {/* Application Receipt */}
      {showApplicationReceipt && submittedApplicationData && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-blue-600">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-800">Application Receipt</h2>
            <div className="flex space-x-3">
                             <button
                 onClick={(e) => { e.preventDefault(); handleDownloadPDF(submittedApplicationData); }}
                 className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center space-x-2"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
                 <span>Download PDF</span>
               </button>
              <button
                onClick={() => setShowApplicationReceipt(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-medium"
              >
                Close
              </button>
            </div>
          </div>
          
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-gray-50 p-4 rounded-lg">
               <h3 className="text-lg font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">Personal Information</h3>
               <div className="space-y-3">
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Full Name</span>
                   <span className="text-base font-bold text-gray-900 mt-1">{submittedApplicationData.firstName} {submittedApplicationData.middleName} {submittedApplicationData.lastName}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">SR Code</span>
                   <span className="text-base font-bold text-gray-900 mt-1">{submittedApplicationData.srCode}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sex</span>
                   <span className="text-base font-bold text-gray-900 mt-1">{submittedApplicationData.sex}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Date of Birth</span>
                   <span className="text-base font-bold text-gray-900 mt-1">{new Date(submittedApplicationData.dateOfBirth).toLocaleDateString()}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone Number</span>
                   <span className="text-base font-bold text-gray-900 mt-1">{submittedApplicationData.phoneNumber}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email Address</span>
                   <span className="text-base font-bold text-blue-600 mt-1">{submittedApplicationData.email}</span>
                 </div>
               </div>
             </div>
             <div className="bg-gray-50 p-4 rounded-lg">
               <h3 className="text-lg font-bold text-blue-800 mb-4 border-b-2 border-blue-200 pb-2">Academic & Other Details</h3>
               <div className="space-y-3">
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">College/Program</span>
                   <span className="text-base font-bold text-gray-900 mt-1">{submittedApplicationData.collegeProgram}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">GWA Last Semester</span>
                   <span className="text-base font-bold text-green-600 mt-1">{submittedApplicationData.gwaLastSemester || 'Not provided'}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Distance from Campus</span>
                   <span className="text-base font-bold text-gray-900 mt-1">{submittedApplicationData.distanceFromCampus}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Duration of Use</span>
                   <span className="text-base font-bold text-gray-900 mt-1">{submittedApplicationData.durationOfUse}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Home Address</span>
                   <span className="text-sm font-medium text-gray-900 mt-1 leading-relaxed">
                     {submittedApplicationData.houseNo} {submittedApplicationData.streetName}<br/>
                     {submittedApplicationData.barangay}, {submittedApplicationData.municipalityCity}<br/>
                     {submittedApplicationData.province}
                   </span>
                 </div>
                 {submittedApplicationData.extracurricularActivities && (
                   <div className="flex flex-col">
                     <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Extracurricular Activities</span>
                     <span className="text-sm font-medium text-gray-900 mt-1">{submittedApplicationData.extracurricularActivities}</span>
                   </div>
                 )}
                 {submittedApplicationData.monthlyFamilyIncome && (
                   <div className="flex flex-col">
                     <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Monthly Family Income</span>
                     <span className="text-base font-bold text-green-600 mt-1">₱{parseFloat(submittedApplicationData.monthlyFamilyIncome).toLocaleString()}</span>
                   </div>
                 )}
               </div>
             </div>
           </div>
          
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-medium">Application Status: Submitted Successfully</span>
            </div>
          </div>
        </div>
      )}

      {/* Rental Status */}
      {showRentalStatus && currentRental && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border-l-4 border-green-600">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-green-800">Current Rental Status</h2>
            <button
              onClick={() => setShowRentalStatus(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-medium"
            >
              Close
            </button>
          </div>
          
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-gray-50 p-4 rounded-lg">
               <h3 className="text-lg font-bold text-green-800 mb-4 border-b-2 border-green-200 pb-2">Rental Details</h3>
               <div className="space-y-3">
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bike Number</span>
                   <span className="text-lg font-bold text-gray-900 mt-1">#{currentRental.bike.bikeNumber}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Model</span>
                   <span className="text-base font-bold text-gray-900 mt-1">{currentRental.bike.model}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Start Time</span>
                   <span className="text-base font-bold text-gray-900 mt-1">{new Date(currentRental.startTime).toLocaleString()}</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</span>
                   <span className="mt-1">
                     <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold uppercase">
                       {currentRental.status}
                     </span>
                   </span>
                 </div>
                 {currentRental.distance && (
                   <div className="flex flex-col">
                     <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Distance Traveled</span>
                     <span className="text-base font-bold text-blue-600 mt-1">{currentRental.distance.toFixed(2)} km</span>
                   </div>
                 )}
                 {currentRental.carbonSaved && (
                   <div className="flex flex-col">
                     <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Carbon Saved</span>
                     <span className="text-base font-bold text-green-600 mt-1">{currentRental.carbonSaved.toFixed(2)} kg CO₂</span>
                   </div>
                 )}
               </div>
             </div>
                         <div className="bg-gray-50 p-4 rounded-lg">
               <h3 className="text-lg font-bold text-green-800 mb-4 border-b-2 border-green-200 pb-2">Quick Actions</h3>
               <div className="space-y-4">
                 <button
                   onClick={handleExtendRental}
                   disabled={isExtendingRental}
                   className={`w-full px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all duration-200 ${
                     isExtendingRental 
                       ? 'bg-gray-400 cursor-not-allowed text-gray-700' 
                       : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg text-white'
                   }`}
                 >
                   <div className="flex items-center justify-center space-x-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     <span>{isExtendingRental ? 'Extending...' : 'Extend Rental (+2 hours)'}</span>
                   </div>
                 </button>
                 <button
                   onClick={handleEndRental}
                   className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 hover:shadow-lg font-bold text-sm uppercase tracking-wide transition-all duration-200"
                 >
                   <div className="flex items-center justify-center space-x-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m0 0a9 9 0 01-9-9m9 9v-9" />
                     </svg>
                     <span>End Rental</span>
                   </div>
                 </button>
                 <button
                   onClick={() => window.location.href = '/rent/active'}
                   className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 hover:shadow-lg font-bold text-sm uppercase tracking-wide transition-all duration-200"
                 >
                   <div className="flex items-center justify-center space-x-2">
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     <span>View Live Tracking</span>
                   </div>
                 </button>
               </div>
             </div>
          </div>
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
              onClick={() => handleDownloadPDF()}
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