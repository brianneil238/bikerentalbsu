'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// Assuming Application type is defined elsewhere and can be imported
// For now, let's define a basic version here
interface Application {
  id: string;
  firstName: string;
  lastName: string;
  srCode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  submittedAt: string;
  user: {
    email: string;
  };
  middleName?: string;
  sex: string;
  dateOfBirth: string;
  phoneNumber: string;
  collegeProgram: string;
  gwaLastSemester?: number;
  extracurricularActivities?: string;
  houseNo: string;
  streetName: string;
  barangay: string;
  municipalityCity: string;
  province: string;
  distanceFromCampus: string;
  monthlyFamilyIncome?: number;
  durationOfUse: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchApplications();
    } else if (status === 'authenticated') {
      // Non-admin user, set error
      setError('You do not have permission to access this page.');
      setIsLoading(false);
    } else if (status === 'unauthenticated') {
      setError('Please log in to view this page.');
      setIsLoading(false);
    }
  }, [session, status]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/applications');
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      setApplications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/admin/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ applicationId: id, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update status to ${newStatus}`);
      }

      // Refresh the list of applications
      fetchApplications();
    } catch (err) {
      alert(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  if (session?.user?.role !== 'ADMIN') {
    return <div className="text-center mt-10 text-red-500">Access Denied.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard: Rental Applications</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SR-Code</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{app.firstName} {app.lastName}</p>
                  <p className="text-gray-600 whitespace-no-wrap text-xs">{app.user.email}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{app.srCode}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{new Date(app.submittedAt).toLocaleDateString()}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${
                    app.status === 'APPROVED' ? 'text-green-900' :
                    app.status === 'REJECTED' ? 'text-red-900' :
                    'text-yellow-900'
                  }`}>
                    <span aria-hidden className={`absolute inset-0 ${
                      app.status === 'APPROVED' ? 'bg-green-200' :
                      app.status === 'REJECTED' ? 'bg-red-200' :
                      'bg-yellow-200'
                    } opacity-50 rounded-full`}></span>
                    <span className="relative">{app.status}</span>
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="text-indigo-600 hover:text-indigo-900 font-bold py-2 px-4 rounded"
                    >
                      View
                    </button>
                    {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <button
              onClick={() => setSelectedApplication(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Application Details</h3>
            <div className="space-y-6 text-sm">

              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold text-base text-gray-800 mb-3">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 text-gray-900">
                  <p><span className="font-medium text-gray-600">Full Name:</span><br/>{`${selectedApplication.firstName} ${selectedApplication.middleName || ''} ${selectedApplication.lastName}`}</p>
                  <p><span className="font-medium text-gray-600">Date of Birth:</span><br/>{formatDate(selectedApplication.dateOfBirth)}</p>
                  <p><span className="font-medium text-gray-600">Sex:</span><br/>{selectedApplication.sex}</p>
                  <p><span className="font-medium text-gray-600">Email:</span><br/>{selectedApplication.user.email}</p>
                  <p><span className="font-medium text-gray-600">Phone Number:</span><br/>{selectedApplication.phoneNumber}</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold text-base text-gray-800 mb-3">Academic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3 text-gray-900">
                  <p><span className="font-medium text-gray-600">SR Code:</span><br/>{selectedApplication.srCode}</p>
                  <p><span className="font-medium text-gray-600">Program:</span><br/>{selectedApplication.collegeProgram}</p>
                  <p><span className="font-medium text-gray-600">GWA Last Semester:</span><br/>{selectedApplication.gwaLastSemester || 'N/A'}</p>
                  <p className="col-span-full"><span className="font-medium text-gray-600">Extracurricular Activities:</span><br/>{selectedApplication.extracurricularActivities || 'None'}</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold text-base text-gray-800 mb-3">Address & Usage Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-gray-900">
                  <p className="col-span-full"><span className="font-medium text-gray-600">Address:</span><br/>{`${selectedApplication.houseNo}, ${selectedApplication.streetName}, ${selectedApplication.barangay}, ${selectedApplication.municipalityCity}, ${selectedApplication.province}`}</p>
                  <p><span className="font-medium text-gray-600">Distance from Campus:</span><br/>{selectedApplication.distanceFromCampus}</p>
                  <p><span className="font-medium text-gray-600">Duration of Use:</span><br/>{selectedApplication.durationOfUse}</p>
                  <p><span className="font-medium text-gray-600">Monthly Family Income:</span><br/>{selectedApplication.monthlyFamilyIncome ? `₱${selectedApplication.monthlyFamilyIncome.toLocaleString()}` : 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
