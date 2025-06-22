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
    <div className="container mx-auto px-4 py-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button onClick={fetchApplications} className="btn-secondary">
          Refresh Applications
        </button>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Applicant</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SR-Code</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Submitted</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap font-semibold">{app.firstName} {app.lastName}</p>
                  <p className="text-gray-600 whitespace-no-wrap text-xs">{app.user.email}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{app.srCode}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{formatDate(app.submittedAt)}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    app.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    app.status === 'UNDER_REVIEW' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800' // PENDING
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setSelectedApplication(app)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      View
                    </button>
                    {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                      <>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'APPROVED')}
                          className="btn-primary py-1 px-3 text-xs"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-xs"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-8 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Application Details</h3>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6 text-sm max-h-[70vh] overflow-y-auto pr-4">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <h4 className="md:col-span-3 text-lg font-semibold text-gray-700 border-b pb-2">Personal Information</h4>
                <div><strong>Full Name:</strong> {selectedApplication.firstName} {selectedApplication.middleName} {selectedApplication.lastName}</div>
                <div><strong>SR-Code:</strong> {selectedApplication.srCode}</div>
                <div><strong>Email:</strong> {selectedApplication.user.email}</div>
                <div><strong>Phone:</strong> {selectedApplication.phoneNumber}</div>
                <div><strong>Sex:</strong> {selectedApplication.sex}</div>
                <div><strong>Date of Birth:</strong> {formatDate(selectedApplication.dateOfBirth)}</div>
              </div>

              {/* Academic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h4 className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2">Academic & Lifestyle</h4>
                <div><strong>College/Program:</strong> {selectedApplication.collegeProgram}</div>
                <div><strong>GWA (Last Sem):</strong> {selectedApplication.gwaLastSemester || 'N/A'}</div>
                <div className="md:col-span-2"><strong>Extracurriculars:</strong> {selectedApplication.extracurricularActivities || 'N/A'}</div>
              </div>

              {/* Address Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h4 className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2">Address</h4>
                <div><strong>Address:</strong> {`${selectedApplication.houseNo} ${selectedApplication.streetName}, ${selectedApplication.barangay}`}</div>
                <div><strong>City/Municipality:</strong> {selectedApplication.municipalityCity}</div>
                <div><strong>Province:</strong> {selectedApplication.province}</div>
                <div><strong>Distance from Campus:</strong> {selectedApplication.distanceFromCampus} km</div>
              </div>

              {/* Financial & Usage Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <h4 className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2">Financial & Usage</h4>
                <div><strong>Monthly Family Income:</strong> ₱{selectedApplication.monthlyFamilyIncome || 'N/A'}</div>
                <div><strong>Intended Duration:</strong> {selectedApplication.durationOfUse}</div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t mt-6 space-x-4">
              <button
                onClick={() => setSelectedApplication(null)}
                className="btn-secondary"
              >
                Close
              </button>
              {(selectedApplication.status === 'PENDING' || selectedApplication.status === 'UNDER_REVIEW') && (
                <>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApplication.id, 'APPROVED');
                      setSelectedApplication(null);
                    }}
                    className="btn-primary"
                  >
                    Approve Application
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateStatus(selectedApplication.id, 'REJECTED');
                      setSelectedApplication(null);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Reject Application
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
