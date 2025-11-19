'use client';

import { useEffect, useState } from 'react';

type KeyInfo = {
  time: string;
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  repeat: boolean;
};

export default function KeyDebugPage() {
  const [lastEvent, setLastEvent] = useState<KeyInfo | null>(null);
  const [events, setEvents] = useState<KeyInfo[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const info: KeyInfo = {
        time: new Date().toLocaleTimeString(),
        key: e.key,
        code: e.code,
        altKey: e.altKey,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        shiftKey: e.shiftKey,
        repeat: e.repeat,
      };

      setLastEvent(info);
      setEvents(prev => [info, ...prev].slice(0, 20));
      console.log('key event', info);
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Key Debug</h1>
      <p>Press hardware buttons or lift/replace the handset. Last key event will appear below.</p>

      {lastEvent ? (
        <section>
          <h2>Last event</h2>
          <ul>
            <li>Time: {lastEvent.time}</li>
            <li>key: {String(lastEvent.key)}</li>
            <li>code: {String(lastEvent.code)}</li>
            <li>
              modifiers:
              {lastEvent.ctrlKey && ' Ctrl'}
              {lastEvent.altKey && ' Alt'}
              {lastEvent.shiftKey && ' Shift'}
              {lastEvent.metaKey && ' Meta'}
              {!lastEvent.ctrlKey && !lastEvent.altKey && !lastEvent.shiftKey && !lastEvent.metaKey && ' none'}
            </li>
            <li>repeat: {lastEvent.repeat ? 'yes' : 'no'}</li>
          </ul>
        </section>
      ) : (
        <p>No key events yet.</p>
      )}

      <section>
        <h2>Recent events</h2>
        <ol>
          {events.map((e, idx) => (
            <li key={idx}>
              {e.time} — {e.code} ({e.key})
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
