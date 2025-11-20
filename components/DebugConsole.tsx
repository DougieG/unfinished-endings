'use client';

import { useEffect, useState, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  type: 'log' | 'error' | 'warn';
  message: string;
}

export default function DebugConsole() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Intercept console methods
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type: 'log' | 'error' | 'warn', ...args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      const entry: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message
      };

      setLogs(prev => [...prev.slice(-50), entry]); // Keep last 50 logs
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('log', ...args);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', ...args);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', ...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-black/80 text-white px-4 py-2 rounded text-xs"
      >
        Show Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 text-white h-64 overflow-hidden flex flex-col">
      <div className="flex justify-between items-center p-2 bg-gray-900">
        <h3 className="text-xs font-bold">DEBUG CONSOLE</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setLogs([])}
            className="text-xs bg-red-600 px-3 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs bg-gray-700 px-3 py-1 rounded"
          >
            Hide
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-xs font-mono space-y-1">
        {logs.map((log, i) => (
          <div
            key={i}
            className={`${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'warn' ? 'text-yellow-400' :
              'text-green-400'
            }`}
          >
            <span className="text-gray-500">[{log.timestamp}]</span>{' '}
            <span className="whitespace-pre-wrap">{log.message}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
