'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  srCode: string;
  sex: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchApplications();
  }, [status, session, router]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/applications');
      
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          status: newStatus,
          notes: reviewNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Refresh applications list
      await fetchApplications();
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateOnly = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage bike rental applications
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => router.push('/')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Back to Site
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Applications</h3>
            <p className="text-3xl font-bold text-green-600">{applications.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {applications.filter(app => app.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Approved</h3>
            <p className="text-3xl font-bold text-green-600">
              {applications.filter(app => app.status === 'APPROVED').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">
              {applications.filter(app => app.status === 'REJECTED').length}
            </p>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Rental Applications</h2>
          </div>
          
          {applications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No applications found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SR Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Program
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.firstName} {application.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{application.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.srCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.collegeProgram}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(application.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-6 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white mb-10">
            <div className="mt-3">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">
                  Application Receipt
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 space-y-6 text-sm">
                {/* Personal Information */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-base text-gray-800 mb-3">Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 text-gray-900">
                    <p><span className="font-medium text-gray-500">Full Name:</span> {`${selectedApplication.firstName} ${selectedApplication.middleName || ''} ${selectedApplication.lastName}`}</p>
                    <p><span className="font-medium text-gray-500">Date of Birth:</span> {formatDateOnly(selectedApplication.dateOfBirth)}</p>
                    <p><span className="font-medium text-gray-500">Sex:</span> {selectedApplication.sex}</p>
                    <p><span className="font-medium text-gray-500">Email:</span> {selectedApplication.email}</p>
                    <p><span className="font-medium text-gray-500">Phone Number:</span> {selectedApplication.phoneNumber}</p>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-base text-gray-800 mb-3">Academic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-900">
                    <p><span className="font-medium text-gray-500">SR Code:</span> {selectedApplication.srCode}</p>
                    <p><span className="font-medium text-gray-500">Program:</span> {selectedApplication.collegeProgram}</p>
                    <p><span className="font-medium text-gray-500">GWA Last Semester:</span> {selectedApplication.gwaLastSemester || 'N/A'}</p>
                    <p className="md:col-span-2"><span className="font-medium text-gray-500">Extracurricular Activities:</span> {selectedApplication.extracurricularActivities || 'None'}</p>
                  </div>
                </div>

                {/* Address Information */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-base text-gray-800 mb-3">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-900">
                    <p className="md:col-span-2"><span className="font-medium text-gray-500">Address:</span> {`${selectedApplication.houseNo}, ${selectedApplication.streetName}, ${selectedApplication.barangay}, ${selectedApplication.municipalityCity}, ${selectedApplication.province}`}</p>
                    <p><span className="font-medium text-gray-500">Distance from Campus:</span> {selectedApplication.distanceFromCampus}</p>
                  </div>
                </div>

                {/* Financial & Usage Information */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold text-base text-gray-800 mb-3">Financial & Usage Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-900">
                    <p><span className="font-medium text-gray-500">Monthly Family Income:</span> {selectedApplication.monthlyFamilyIncome ? `₱${selectedApplication.monthlyFamilyIncome.toLocaleString()}` : 'N/A'}</p>
                    <p><span className="font-medium text-gray-500">Duration of Use:</span> {selectedApplication.durationOfUse}</p>
                  </div>
                </div>

                {/* Application Status */}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h4 className="font-semibold text-base text-gray-800 mb-3">Application Status & Review</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-gray-900">
                    <div>
                      <span className="font-medium text-gray-500">Submitted:</span> {formatDate(selectedApplication.submittedAt)}
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Current Status:</span>
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                        {selectedApplication.status}
                      </span>
                    </div>
                    {selectedApplication.reviewedAt && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-500">Reviewed At:</span> {formatDate(selectedApplication.reviewedAt)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Notes
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={3}
                      placeholder="Add review notes (optional)..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setSelectedApplication(null);
                      setReviewNotes('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  
                  {selectedApplication.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'APPROVED')}
                      disabled={isUpdating}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {isUpdating ? 'Updating...' : 'Approve'}
                    </button>
                  )}
                  
                  {selectedApplication.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'REJECTED')}
                      disabled={isUpdating}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isUpdating ? 'Updating...' : 'Reject'}
                    </button>
                  )}
                  
                  {selectedApplication.status !== 'UNDER_REVIEW' && (
                    <button
                      onClick={() => handleStatusUpdate(selectedApplication.id, 'UNDER_REVIEW')}
                      disabled={isUpdating}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isUpdating ? 'Updating...' : 'Mark Under Review'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 