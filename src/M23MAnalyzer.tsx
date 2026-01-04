import React, { useState } from 'react';
import axios from 'axios';
import { Search, Loader2 } from 'lucide-react';

// The API base URL is fetched from the environment variable VITE_API_URL
const API_BASE = import.meta.env.VITE_API_URL || 'https://telstp-ai-agent-globe.vercel.app';

interface Publication {
  title: string;
  abstract: string;
}

interface AnalysisResult {
  summary: string;
  publications: Publication[];
}

const M23MAnalyzer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeResearch = async (researchQuery: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // POST request to the new backend endpoint: /m23m/analyze
      const response = await axios.post(`${API_BASE}/m23m/analyze`, { query: researchQuery });
      
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.message || 'Analysis failed with an unknown error.');
      }
    } catch (err) {
      console.error("M2-3M Frontend Error:", err);
      setError('Failed to connect to the M2-3M analysis service. Please check the network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      analyzeResearch(query.trim());
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
        <Search className="w-6 h-6 mr-2 text-blue-600" />
        M2-3M Research Analyzer
      </h2>
      <p className="text-gray-600 mb-6">
        Input your research query to receive a deep analysis based on the internal TELsTP publications database.
      </p>

      <form onSubmit={handleSubmit} className="flex space-x-3 mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your research query..."
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-150 disabled:bg-blue-400 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              Analyze
            </>
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Analysis Report</h3>
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap">
            {result.summary}
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Referenced Publications</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {result.publications.map((pub, index) => (
              <li key={index} className="pl-2">
                <span className="font-medium">{pub.title}</span>: {pub.abstract.substring(0, 100)}...
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default M23MAnalyzer;
