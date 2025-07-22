'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-12 animate-fade-in">
      <div className="max-w-md w-full text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800">Oops!</h1>
        <p className="text-gray-600 text-lg md:text-xl">
          Something went wrong. Please try again later.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-3 rounded-md bg-gray-900 text-white font-semibold hover:bg-gray-800 transition"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 rounded-md border border-gray-300 text-gray-800 font-semibold hover:bg-gray-100 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
