'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (response.ok) {
      router.refresh();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-cardboard flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white/50 rounded-lg p-8 shadow-2xl">
        <h1 className="text-3xl font-serif text-soot mb-6 text-center">
          Admin Access
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-sans text-soot/60 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-soot/20 rounded-sm focus:outline-none focus:ring-2 focus:ring-amber"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">
              Invalid password. Please try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full px-6 py-3 bg-soot text-cardboard font-sans rounded-sm
                       hover:bg-soot/90 transition-all duration-400"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
