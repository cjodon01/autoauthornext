'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DebugPage() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [userAgent, setUserAgent] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set',
      NODE_ENV: process.env.NODE_ENV || 'Not Set',
    });

    // Get user agent
    setUserAgent(navigator.userAgent);
    setTimestamp(new Date().toISOString());
  }, []);

  return (
    <div className="min-h-screen bg-dark p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Vercel Deployment Debug</h1>
        
        <div className="grid gap-6">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Environment Variables</h2>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-white/70">{key}:</span>
                  <span className={`font-mono ${value === 'Set' ? 'text-green-400' : 'text-red-400'}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">System Info</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/70">User Agent:</span>
                <span className="text-white font-mono text-sm">{userAgent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Timestamp:</span>
                <span className="text-white font-mono text-sm">{timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">URL:</span>
                <span className="text-white font-mono text-sm">{typeof window !== 'undefined' ? window.location.href : 'Server-side'}</span>
              </div>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Test Links</h2>
            <div className="space-y-2">
              <Link href="/tools" className="block text-blue-400 hover:text-blue-300">Tools Page</Link>
              <Link href="/dashboard" className="block text-blue-400 hover:text-blue-300">Dashboard</Link>
              <Link href="/" className="block text-blue-400 hover:text-blue-300">Home Page</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 