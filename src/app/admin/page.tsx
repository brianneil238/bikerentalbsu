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
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  {app.status === 'PENDING' || app.status === 'UNDER_REVIEW' ? (
                    <div className="flex space-x-2">
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
                    </div>
                  ) : (
                    <span className="text-gray-500">Action Taken</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
