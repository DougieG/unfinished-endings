'use client';

import { useState } from 'react';

export default function TestTranscribePage() {
  const [storyId, setStoryId] = useState('26d76ef7');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerTranscription = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/transcribe/${storyId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(`Status: ${response.status}\n\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cardboard p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-serif text-soot mb-6">
          Test Transcription
        </h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-soot mb-2">
            Story ID
          </label>
          <input
            type="text"
            value={storyId}
            onChange={(e) => setStoryId(e.target.value)}
            className="w-full px-4 py-2 border border-soot/20 rounded"
            placeholder="Enter story ID..."
          />
        </div>

        <button
          onClick={triggerTranscription}
          disabled={loading || !storyId}
          className="w-full px-6 py-3 bg-teal text-white rounded hover:bg-teal/90 
                     disabled:bg-soot/20 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing... (this takes 3-4 min)' : 'Trigger Transcription + Panorama'}
        </button>

        {loading && (
          <div className="mt-6 p-4 bg-amber/10 rounded">
            <p className="text-sm text-soot">
              ⏳ Please wait... This process includes:
            </p>
            <ul className="mt-2 text-sm text-soot/80 space-y-1 ml-4">
              <li>• Transcription (~30 sec)</li>
              <li>• Keyword extraction (~10 sec)</li>
              <li>• Narrative beat analysis (~10 sec)</li>
              <li>• Generating 5-7 shadow puppet scenes (~2-3 min)</li>
            </ul>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 rounded">
            <h3 className="font-medium text-red-800 mb-2">Error:</h3>
            <pre className="text-xs text-red-600 overflow-auto">
              {error}
            </pre>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-green-50 rounded">
            <h3 className="font-medium text-green-800 mb-2">✅ Success!</h3>
            <div className="text-sm text-green-700 space-y-2">
              <p><strong>Transcript:</strong> {result.transcript?.substring(0, 200)}...</p>
              <p><strong>Keywords:</strong> {result.keywords?.join(', ')}</p>
              {result.panorama && (
                <p><strong>Panorama:</strong> {result.panorama.scenes.length} scenes generated</p>
              )}
              <a
                href={`/story/${storyId}`}
                target="_blank"
                className="inline-block mt-4 px-4 py-2 bg-teal text-white rounded hover:bg-teal/90"
              >
                View Story →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
