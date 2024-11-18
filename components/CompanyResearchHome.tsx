"use client";

import { useState, FormEvent } from "react";

export default function CompanyResearcher() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [researchResult, setResearchResult] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleResearch = async (e: FormEvent) => {
    e.preventDefault(); // Prevent form submission refresh
    console.log("Research initiated for company URL.");

    if (!companyUrl) {
      setError("Please enter a company URL for research.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);

    try {
      console.log("Making API request to /api/exa");
      const response = await fetch('/api/exa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: companyUrl }),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch research result.');
      }

      const data = await response.json();
      console.log("Received data:", data);

      if (data.researchResult) {
        setResearchResult(data.researchResult);
      } else {
        setError("No research information found.");
      }
    } catch (error) {
      console.error('Error in handleResearch:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
      setResearchResult('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full border-6 max-w-4xl p-6">
      <h1 className="md:text-6xl text-4xl pb-5 font-medium opacity-0 animate-fade-up [animation-delay:200ms]">
        <span className="text-brand-default"> Company </span>
        Researcher
      </h1>

      <p className="text-black mb-12 opacity-0 animate-fade-up [animation-delay:400ms]">
        Enter a company URL for detailed research info. Instantly know any company inside out.
      </p>

      <form onSubmit={handleResearch} className="space-y-6">
        <input
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
          placeholder="Enter Company URL"
          className="w-full bg-white p-3 border box-border outline-none rounded-sm ring-2 ring-brand-default resize-none opacity-0 animate-fade-up [animation-delay:600ms]"
        />
        <button
          type="submit"
          className={`w-full bg-brand-default text-white font-semibold px-2 py-2 rounded-sm transition-opacity opacity-0 animate-fade-up [animation-delay:800ms] min-h-[50px] ring-2 ring-brand-default ${
            isGenerating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isGenerating}
        >
          {isGenerating ? 'Researching...' : 'Research Now'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {researchResult && (
        <div className="mt-20 w-full bg-white p-4 border outline-none resize-none min-h-[200px] overflow-auto rounded opacity-0 animate-fade-up [animation-delay:200ms]">
          {researchResult}
        </div>
      )}
    </div>
  );
}