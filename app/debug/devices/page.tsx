'use client';

import { useEffect, useState } from 'react';

export default function DevicesDebugPage() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = async () => {
    try {
      // Request permission first to get labels
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devs = await navigator.mediaDevices.enumerateDevices();
      setDevices(devs);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(String(err));
    }
  };

  useEffect(() => {
    refreshDevices();
    navigator.mediaDevices.addEventListener('devicechange', refreshDevices);
    return () => navigator.mediaDevices.removeEventListener('devicechange', refreshDevices);
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>Audio Devices Debug</h1>
      <button onClick={refreshDevices} style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
        Refresh List
      </button>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>Error: {error}</div>}

      <div style={{ display: 'grid', gap: '1rem' }}>
        <section>
          <h2>Audio Inputs (Microphones)</h2>
          <ul style={{ fontFamily: 'monospace' }}>
            {devices.filter(d => d.kind === 'audioinput').map((d, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>Label:</strong> {d.label || '(unknown)'}<br/>
                <strong>ID:</strong> {d.deviceId}<br/>
                <strong>Group:</strong> {d.groupId}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Audio Outputs (Speakers)</h2>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Note: iOS Safari may not list outputs or allow selection.</p>
          <ul style={{ fontFamily: 'monospace' }}>
            {devices.filter(d => d.kind === 'audiooutput').map((d, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                <strong>Label:</strong> {d.label || '(unknown)'}<br/>
                <strong>ID:</strong> {d.deviceId}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
