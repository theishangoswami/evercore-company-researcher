// CompanyResearchHome.tsx

"use client";
import { useState, FormEvent } from "react";
import LinkedInDisplay from "./LinkedinDisplay";
import CompetitorsDisplay from "./CompetitorsDisplay";
import NewsDisplay from "./NewsDisplay";

export default function CompanyResearcher() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyUrl, setCompanyUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [linkedinData, setLinkedinData] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any>([]);
  const [news, setNews] = useState<any[]>([]);

  // LinkedIn API fetch function
  const fetchLinkedInData = async (url: string) => {
    try {
      const response = await fetch('/api/scrapelinkedin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('LinkedIn research failed');
      }

      const data = await response.json();
      return data.results[0];
    } catch (error) {
      console.error('Error fetching LinkedIn data:', error);
      throw error;
    }
  };

  // Competitors API fetch function
  const fetchCompetitors = async (url: string) => {
    try {
      const response = await fetch('/api/findcompetitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch competitors');
      }

      const data = await response.json();
      return data.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        summary: result.summary,
      }));
    } catch (error) {
      console.error('Error fetching competitors:', error);
      throw error;
    }
  };

  // New function to fetch news
  const fetchNews = async (url: string) => {
    try {
      const response = await fetch('/api/findnews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('News research failed');
      }

      const data = await response.json();
      return data.results.filter((item: any) => item.image && item.title).slice(0, 6);
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  };


  // Main Research Function
  const handleResearch = async (e: FormEvent) => {
    e.preventDefault();

    if (!companyUrl) {
      setError("Please enter a company URL");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const linkedinPromise = fetchLinkedInData(companyUrl)
        .then((data) => setLinkedinData(data))
        .catch((error) => setError(error instanceof Error ? error.message : 'An error occurred with LinkedIn'));

      const competitorsPromise = fetchCompetitors(companyUrl)
        .then((data) => setCompetitors(data))
        .catch((error) => setError(error instanceof Error ? error.message : 'An error occurred with competitors'));

      const newsPromise = fetchNews(companyUrl)
        .then((data) => setNews(data))
        .catch((error) => setError(error instanceof Error ? error.message : 'An error occurred with news'));

      await Promise.allSettled([linkedinPromise, competitorsPromise, newsPromise]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl p-6 z-10">
      <h1 className="md:text-6xl text-4xl pb-5 font-medium opacity-0 animate-fade-up [animation-delay:200ms]">
        <span className="text-brand-default"> Company </span>
        Researcher
      </h1>

      <p className="text-black mb-12 opacity-0 animate-fade-up [animation-delay:400ms]">
        Enter a company URL for detailed research info. Instantly know any company inside out.
      </p>

      <form onSubmit={handleResearch} className="space-y-6 mb-20">
        <input
          value={companyUrl}
          onChange={(e) => setCompanyUrl(e.target.value)}
          placeholder="Enter Company URL"
          className="w-full bg-white p-3 border box-border outline-none rounded-sm ring-2 ring-brand-default resize-none opacity-0 animate-fade-up [animation-delay:600ms]"
        />
        <button
          type="submit"
          className={`w-full text-white font-semibold px-2 py-2 rounded-sm transition-opacity opacity-0 animate-fade-up [animation-delay:800ms] min-h-[50px] ${
            isGenerating ? 'bg-gray-400' : 'bg-brand-default ring-2 ring-brand-default'
          } transition-colors`}
          disabled={isGenerating}
        >
          {isGenerating ? 'Researching...' : 'Research Now'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700">
          {error}
        </div>
      )}

      {linkedinData && <LinkedInDisplay data={linkedinData} />}

      {competitors.length > 0 && <CompetitorsDisplay competitors={competitors} />}

      {news.length > 0 && <NewsDisplay news={news} />}

    </div>
  );
}