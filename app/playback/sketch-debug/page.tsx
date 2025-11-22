'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface DebugLog {
  timestamp: string;
  level: 'info' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function SketchDebugPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [uploading, setUploading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  const addLog = (level: DebugLog['level'], message: string, data?: any) => {
    const log: DebugLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };
    setLogs(prev => [...prev, log]);
    console.log(`[${level.toUpperCase()}]`, message, data || '');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addLog('info', 'File selected', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeKB: Math.round(file.size / 1024),
      lastModified: new Date(file.lastModified).toISOString()
    });

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      addLog('success', 'Preview created');
    };
    reader.readAsDataURL(file);
  };

  const testBasicAPI = async () => {
    addLog('info', 'Testing basic API endpoint...');
    try {
      const response = await fetch('/api/sketch/test');
      const data = await response.json();
      addLog('success', 'Basic API test passed', data);
      return { success: true, data };
    } catch (error) {
      addLog('error', 'Basic API test failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return { success: false, error };
    }
  };

  const testSharp = async () => {
    addLog('info', 'Testing Sharp library...');
    try {
      const response = await fetch('/api/sketch/test-sharp');
      const data = await response.json();
      addLog(data.status === 'ok' ? 'success' : 'error', 'Sharp test result', data);
      return { success: data.status === 'ok', data };
    } catch (error) {
      addLog('error', 'Sharp test failed', {
        error: error instanceof Error ? error.message : String(error)
      });
      return { success: false, error };
    }
  };

  const runAllTests = async () => {
    setTestResults(null);
    addLog('info', '═══ Starting System Tests ═══');
    
    const results = {
      basicAPI: await testBasicAPI(),
      sharp: await testSharp(),
      browser: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled
      }
    };
    
    setTestResults(results);
    addLog('info', '═══ Tests Complete ═══', results);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      addLog('error', 'No file selected');
      return;
    }

    setUploading(true);
    addLog('info', '═══ Starting Upload ═══');

    try {
      const formData = new FormData();
      formData.append('form_image', selectedFile);
      formData.append('title', 'DEBUG TEST');
      formData.append('first_name', 'Brooke');
      formData.append('email', 'debug@test.com');

      addLog('info', 'Sending request to /api/sketch/upload-raw...');
      
      const startTime = Date.now();
      const response = await fetch('/api/sketch/upload-raw', {
        method: 'POST',
        body: formData
      });
      const duration = Date.now() - startTime;

      addLog('info', `Response received in ${duration}ms`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          addLog('error', 'Upload failed with JSON error', errorData);
        } catch (e) {
          const text = await response.text();
          addLog('error', 'Upload failed with non-JSON response', {
            status: response.status,
            responsePreview: text.substring(0, 500)
          });
        }
        return;
      }

      const data = await response.json();
      addLog('success', '✅ Upload successful!', data);

    } catch (err) {
      addLog('error', 'Upload exception', {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      });
    } finally {
      setUploading(false);
      addLog('info', '═══ Upload Complete ═══');
    }
  };

  const copyDebugInfo = () => {
    const debugInfo = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      testResults,
      logs: logs.map(log => ({
        time: log.timestamp,
        level: log.level,
        message: log.message,
        data: log.data
      })),
      fileInfo: selectedFile ? {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size
      } : null
    };

    const formatted = JSON.stringify(debugInfo, null, 2);
    navigator.clipboard.writeText(formatted);
    addLog('success', '📋 Debug info copied to clipboard!');
  };

  const clearLogs = () => {
    setLogs([]);
    setTestResults(null);
  };

  return (
    <div className="min-h-screen bg-soot p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-cardboard rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-soot mb-2">
            🔧 Sketch Upload Debug Panel
          </h1>
          <p className="text-soot/70">
            For Brooke: Test uploads and copy debug info to share with Doug
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column: Upload Test */}
          <div className="space-y-6">
            
            {/* System Tests */}
            <div className="bg-cardboard rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-soot mb-4">1. System Tests</h2>
              <button
                onClick={runAllTests}
                className="w-full bg-teal hover:bg-teal/90 text-canvas font-medium py-3 rounded transition-colors"
              >
                Run System Tests
              </button>
              
              {testResults && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className={`p-2 rounded ${testResults.basicAPI.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    {testResults.basicAPI.success ? '✅' : '❌'} Basic API
                  </div>
                  <div className={`p-2 rounded ${testResults.sharp.success ? 'bg-green-100' : 'bg-red-100'}`}>
                    {testResults.sharp.success ? '✅' : '❌'} Sharp Library
                  </div>
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className="bg-cardboard rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-soot mb-4">2. Upload Test File</h2>
              
              <label className="block w-full mb-4">
                <div className={`
                  border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                  transition-colors
                  ${selectedFile 
                    ? 'border-teal bg-teal/5' 
                    : 'border-soot/30 hover:border-teal hover:bg-teal/5'
                  }
                `}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div>
                      <div className="text-4xl mb-2">✅</div>
                      <p className="font-medium text-soot">{selectedFile.name}</p>
                      <p className="text-sm text-soot/60">
                        {Math.round(selectedFile.size / 1024)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-2">📸</div>
                      <p className="font-medium text-soot">Click to select image</p>
                    </div>
                  )}
                </div>
              </label>

              {preview && (
                <div className="mb-4">
                  <img src={preview} alt="Preview" className="w-full rounded shadow" />
                </div>
              )}

              <button
                onClick={uploadFile}
                disabled={!selectedFile || uploading}
                className={`
                  w-full font-medium py-3 rounded transition-colors
                  ${!selectedFile || uploading
                    ? 'bg-soot/20 text-soot/40 cursor-not-allowed'
                    : 'bg-amber hover:bg-amber/90 text-soot'
                  }
                `}
              >
                {uploading ? '⏳ Uploading...' : '📤 Test Upload'}
              </button>
            </div>

            {/* Copy Debug Info */}
            <div className="bg-cardboard rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-soot mb-4">3. Copy Debug Info</h2>
              <div className="space-y-2">
                <button
                  onClick={copyDebugInfo}
                  className="w-full bg-teal hover:bg-teal/90 text-canvas font-medium py-3 rounded transition-colors"
                >
                  📋 Copy All Debug Info
                </button>
                <button
                  onClick={clearLogs}
                  className="w-full bg-soot/10 hover:bg-soot/20 text-soot font-medium py-2 rounded transition-colors text-sm"
                >
                  Clear Logs
                </button>
                <p className="text-xs text-soot/60 mt-2">
                  Click "Copy All Debug Info" then paste it in a message to Doug
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Logs */}
          <div className="bg-cardboard rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-soot mb-4">
              Debug Logs ({logs.length})
            </h2>
            
            <div className="bg-soot/5 rounded p-4 max-h-[800px] overflow-y-auto font-mono text-xs space-y-2">
              {logs.length === 0 ? (
                <p className="text-soot/40 text-center py-8">
                  No logs yet. Run tests or try an upload to see debug info here.
                </p>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-2 rounded ${
                      log.level === 'error' ? 'bg-red-100' :
                      log.level === 'success' ? 'bg-green-100' :
                      'bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-soot/40">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className={`font-bold ${
                        log.level === 'error' ? 'text-red-600' :
                        log.level === 'success' ? 'text-green-600' :
                        'text-blue-600'
                      }`}>
                        {log.level === 'error' ? '❌' :
                         log.level === 'success' ? '✅' : 'ℹ️'}
                      </span>
                      <div className="flex-1">
                        <div className="text-soot font-medium">{log.message}</div>
                        {log.data && (
                          <pre className="mt-1 text-soot/60 text-xs overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Instructions */}
        <div className="mt-6 bg-amber/20 border-2 border-amber rounded-lg p-6">
          <h3 className="font-bold text-soot mb-2">📋 Instructions for Brooke:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-soot/80">
            <li>Click "Run System Tests" - wait for results</li>
            <li>Select an image file (the form photo)</li>
            <li>Click "Test Upload" - watch the logs</li>
            <li>Click "Copy All Debug Info"</li>
            <li>Paste the copied info in a message to Doug</li>
          </ol>
          <p className="mt-3 text-xs text-soot/60">
            The debug info contains everything Doug needs to diagnose the issue!
          </p>
        </div>

      </div>
    </div>
  );
}
