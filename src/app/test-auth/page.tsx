'use client';

import { useSession } from 'next-auth/react';

export default function TestAuth() {
  const { data: session, status } = useSession();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Session:</strong> {session ? 'Yes' : 'No'}</p>
        {session && (
          <div className="mt-2">
            <p><strong>User ID:</strong> {session.user?.id}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Role:</strong> {session.user?.role}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <a href="/rent" className="bg-blue-500 text-white px-4 py-2 rounded">
          Go to Rent Page
        </a>
      </div>
    </div>
  );
} 