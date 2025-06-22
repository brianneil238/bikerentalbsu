'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BikeStatus } from '@/types/index';
import { FileText, ChevronDown, ChevronUp, Clock, Calendar, CheckCircle, AlertTriangle, XCircle, Hourglass } from 'lucide-react';

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
  const [applicationStatus, setApplicationStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | null>(null);
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
        if (applications && applications.length > 0) {
          // Assuming the user has only one most recent application to consider
          const latestApplication = applications[0];
          setHasApplication(true);
          setSubmittedApplicationData(latestApplication);
          setApplicationStatus(latestApplication.status);
          
          if (latestApplication.status === 'APPROVED') {
            setCurrentStep('bikes');
          }
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
      setApplicationStatus('PENDING');
      
      // Show success message
      alert('Application submitted successfully! You will be notified once it has been reviewed by an administrator.');
      
    } catch (err) {
      console.error('Application submission error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  const handleExtendRental = async () => {
    if (!currentRental) return;

    setIsExtendingRental(true);
    try {
      const response = await fetch(`/api/rentals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'extend', rentalId: currentRental.id }),
      });

      if (response.ok) {
        alert('Rental extended successfully!');
        fetchCurrentRental(); // Refresh rental data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to extend rental.');
      }
    } catch (err) {
      console.error('Extend rental error:', err);
      alert(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setIsExtendingRental(false);
    }
  };

  const handleEndRental = async () => {
    if (!currentRental) return;
    
    if (confirm('Are you sure you want to end your current rental?')) {
      try {
        const response = await fetch(`/api/rentals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'end', rentalId: currentRental.id }),
        });
  
        if (response.ok) {
          alert('Rental ended successfully!');
          setCurrentRental(null); // Clear current rental
          window.location.href = '/rent/active'; // Redirect to see final stats
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to end rental.');
        }
      } catch (err) {
        console.error('End rental error:', err);
        alert(err instanceof Error ? err.message : 'An error occurred.');
      }
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

  const renderApplicationStatus = () => {
    if (!hasApplication || !applicationStatus) return null;

    let statusStyles = 'border-l-4 p-4 my-4 rounded-r-lg ';
    let icon = null;
    let statusText = '';

    switch (applicationStatus) {
      case 'APPROVED':
        statusStyles += 'bg-blue-50 border-blue-500 text-blue-800';
        icon = <CheckCircle className="inline-block mr-2" />;
        statusText = 'Your application has been approved! You can now select a bike.';
        break;
      case 'PENDING':
        statusStyles += 'bg-yellow-50 border-yellow-500 text-yellow-800';
        icon = <Hourglass className="inline-block mr-2" />;
        statusText = 'Your application is pending review. You will be notified of the outcome.';
        break;
      case 'UNDER_REVIEW':
        statusStyles += 'bg-blue-50 border-blue-500 text-blue-800';
        icon = <Hourglass className="inline-block mr-2" />;
        statusText = 'Your application is currently under review by an administrator.';
        break;
      case 'REJECTED':
        statusStyles += 'bg-red-50 border-red-500 text-red-800';
        icon = <XCircle className="inline-block mr-2" />;
        statusText = 'Your application has been rejected. Please contact support for more information.';
        break;
      default:
        return null;
    }

    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className={statusStyles} role="alert">
          <p className="font-semibold">
            {icon}
            Application Status: <span className="font-bold">{applicationStatus}</span>
          </p>
          <p>{statusText}</p>
        </div>
      </div>
    );
  };

  const renderApplicationForm = () => {
    return (
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Bike Rental Application Form</h2>
        <form onSubmit={handleApplicationSubmit} className="space-y-6">
          {/* Personal Information */}
          <fieldset className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <legend className="text-lg font-semibold text-gray-700 col-span-full mb-2">Personal Information</legend>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
              <input type="text" id="firstName" name="firstName" value={applicationData.firstName} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="middleName" className="block text-sm font-medium text-gray-700">Middle Name</label>
              <input type="text" id="middleName" name="middleName" value={applicationData.middleName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
              <input type="text" id="lastName" name="lastName" value={applicationData.lastName} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="srCode" className="block text-sm font-medium text-gray-700">SR Code</label>
              <input type="text" id="srCode" name="srCode" value={applicationData.srCode} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
             <div>
              <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
              <select id="sex" name="sex" value={applicationData.sex} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Select...</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" id="dateOfBirth" name="dateOfBirth" value={applicationData.dateOfBirth} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
             <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input type="tel" id="phoneNumber" name="phoneNumber" value={applicationData.phoneNumber} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
             <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" name="email" value={applicationData.email} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </fieldset>

          {/* Academic and Lifestyle */}
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <legend className="text-lg font-semibold text-gray-700 col-span-full mb-2">Academic & Lifestyle</legend>
            <div>
              <label htmlFor="collegeProgram" className="block text-sm font-medium text-gray-700">College/Program</label>
              <input type="text" id="collegeProgram" name="collegeProgram" value={applicationData.collegeProgram} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="gwaLastSemester" className="block text-sm font-medium text-gray-700">GWA (Last Semester)</label>
              <input type="number" step="0.01" id="gwaLastSemester" name="gwaLastSemester" value={applicationData.gwaLastSemester} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="extracurricularActivities" className="block text-sm font-medium text-gray-700">Extracurricular Activities</label>
              <textarea id="extracurricularActivities" name="extracurricularActivities" rows={3} value={applicationData.extracurricularActivities} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
            </div>
          </fieldset>

          {/* Address Information */}
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <legend className="text-lg font-semibold text-gray-700 col-span-full mb-2">Address</legend>
            <div>
              <label htmlFor="houseNo" className="block text-sm font-medium text-gray-700">House No./Bldg</label>
              <input type="text" id="houseNo" name="houseNo" value={applicationData.houseNo} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="streetName" className="block text-sm font-medium text-gray-700">Street Name</label>
              <input type="text" id="streetName" name="streetName" value={applicationData.streetName} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="barangay" className="block text-sm font-medium text-gray-700">Barangay</label>
              <input type="text" id="barangay" name="barangay" value={applicationData.barangay} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="municipalityCity" className="block text-sm font-medium text-gray-700">Municipality/City</label>
              <input type="text" id="municipalityCity" name="municipalityCity" value={applicationData.municipalityCity} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
             <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700">Province</label>
              <input type="text" id="province" name="province" value={applicationData.province} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
             <div>
              <label htmlFor="distanceFromCampus" className="block text-sm font-medium text-gray-700">Distance from Campus (km)</label>
              <input type="number" step="0.1" id="distanceFromCampus" name="distanceFromCampus" value={applicationData.distanceFromCampus} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </fieldset>

          {/* Financial and Usage Information */}
          <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <legend className="text-lg font-semibold text-gray-700 col-span-full mb-2">Financial & Usage</legend>
            <div>
              <label htmlFor="monthlyFamilyIncome" className="block text-sm font-medium text-gray-700">Monthly Family Income</label>
              <select id="monthlyFamilyIncome" name="monthlyFamilyIncome" value={applicationData.monthlyFamilyIncome} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Select...</option>
                <option value="Below 10,000">Below ₱10,000</option>
                <option value="10,001 - 20,000">₱10,001 - ₱20,000</option>
                <option value="20,001 - 50,000">₱20,001 - ₱50,000</option>
                <option value="Above 50,000">Above ₱50,000</option>
              </select>
            </div>
            <div>
              <label htmlFor="durationOfUse" className="block text-sm font-medium text-gray-700">Intended Duration of Use</label>
              <select id="durationOfUse" name="durationOfUse" value={applicationData.durationOfUse} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                <option value="">Select...</option>
                <option value="One-time">One-time Rental</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Semester">Entire Semester</option>
              </select>
            </div>
          </fieldset>
          
          <div className="flex justify-end pt-6 border-t">
            <button type="submit" disabled={isSubmittingApplication} className="btn-primary">
              {isSubmittingApplication ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    );
  };
  
  const renderBikes = () => {
    return (
      <>
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Available Bikes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bikes.map((bike) => (
            <div key={bike.id} className="card p-6 flex flex-col justify-between hover:shadow-xl transition-shadow">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Bike #{bike.bikeNumber}</h3>
                <p className="text-gray-600 mb-2">{bike.model}</p>
                <span
                  className={`px-3 py-1 text-sm rounded-full font-semibold ${
                    bike.status === 'AVAILABLE'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {bike.status}
                </span>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleRentBike(bike.id)}
                  disabled={bike.status !== 'AVAILABLE' || isRenting}
                  className="w-full btn-primary"
                >
                  {isRenting ? 'Processing...' : 'Rent This Bike'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }
  
  if (error) {
    return (
      <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md">
        <h3 className="font-bold text-lg mb-2">An Error Occurred</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-100 min-h-screen">

      {/* Buttons for Application Receipt and Rental Status */}
      {(hasApplication || currentRental) && (
        <div className="w-full max-w-4xl mx-auto mb-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {hasApplication && (
            <button 
              onClick={() => setShowApplicationReceipt(!showApplicationReceipt)}
              className="w-full flex justify-between items-center p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <FileText className="mr-3 text-blue-600" />
                <span className="font-semibold text-gray-800">View Submitted Application</span>
              </div>
              {showApplicationReceipt ? <ChevronUp /> : <ChevronDown />}
            </button>
          )}
          {currentRental && (
             <button 
              onClick={() => setShowRentalStatus(!showRentalStatus)}
              className="w-full flex justify-between items-center p-4 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <Clock className="mr-3 text-blue-600" />
                <span className="font-semibold text-gray-800">Manage Current Rental</span>
              </div>
              {showRentalStatus ? <ChevronUp /> : <ChevronDown />}
            </button>
          )}
        </div>
      )}
      
      {/* Collapsible Application Receipt */}
      {showApplicationReceipt && submittedApplicationData && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Application Receipt</h3>
          <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm text-gray-700">
            {JSON.stringify(submittedApplicationData, null, 2)}
          </pre>
        </div>
      )}

      {/* Collapsible Rental Status */}
      {showRentalStatus && currentRental && (
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl mx-auto mb-6">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Rental Status</h3>
          <div className="space-y-3 text-gray-700">
            <p><span className="font-semibold text-gray-800">Bike Model:</span> {currentRental.bike.model}</p>
            <p><span className="font-semibold text-gray-800">Bike Number:</span> {currentRental.bike.bikeNumber}</p>
            <p><span className="font-semibold text-gray-800">Start Time:</span> {new Date(currentRental.startTime).toLocaleString()}</p>
            <div className="flex space-x-4 pt-4 border-t mt-4">
              <button onClick={handleExtendRental} disabled={isExtendingRental} className="btn-secondary">
                {isExtendingRental ? 'Extending...' : 'Extend Rental (1 hr)'}
              </button>
              <button onClick={handleEndRental} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-semibold">
                End Rental
              </button>
            </div>
          </div>
        </div>
      )}

      {renderApplicationStatus()}
      
      {currentStep === 'application' && !hasApplication && (
        renderApplicationForm()
      )}

      {currentStep === 'bikes' && (
        <div className="w-full max-w-6xl mx-auto">
          {renderBikes()}
        </div>
      )}
    </div>
  );
} 