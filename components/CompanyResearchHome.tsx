// CompanyResearchHome.tsx

"use client";
import { useState, FormEvent } from "react";
import LinkedInDisplay from "./linkedin/LinkedinDisplay";
import CompetitorsDisplay from "./competitors/CompetitorsDisplay";
import NewsDisplay from "./news/NewsDisplay";
import FundingDisplay from "./companycontent/FundingDisplay";
import FinancialReportDisplay from './financial/FinancialReportDisplay';
import CrunchbaseDisplay from './crunchbase/CrunchbaseDisplay';
import PitchBookDisplay from './pitchbook/PitchBookDisplay';
import TracxnDisplay from "./tracxn/TracxnDisplay";
import FoundersDisplay from "./founders/FoundersDisplay";
import {
  LinkedInSkeleton,
  CompetitorsSkeleton,
  NewsSkeleton,
  FoundersSkeleton,
  FinancialSkeleton,
  FundingSkeleton,
} from "./skeletons/ResearchSkeletons";
import Link from "next/link";

interface LinkedInData {
  text: string;
  url: string;
  image: string;
  title: string;
  [key: string]: any;
}

interface Competitor {
  title: string;
  url: string;
  summary: string;
  [key: string]: any;
}

interface NewsItem {
  url: string;
  title: string;
  image: string;
  author?: string;
  publishedDate?: string;
  favicon?: string;
  [key: string]: any;
}

interface Founder {
  url: string;
  title: string;
  [key: string]: any;
}

export default function CompanyResearcher() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyUrl, setCompanyUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [linkedinData, setLinkedinData] = useState<LinkedInData | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[] | null>(null);
  const [news, setNews] = useState<NewsItem[] | null>(null);
  const [fundingData, setFundingData] = useState<any>(null);
  const [financialReport, setFinancialReport] = useState<any>(null);
  const [crunchbaseData, setCrunchbaseData] = useState<any>(null);
  const [pitchbookData, setPitchbookData] = useState<any>(null);
  const [tracxnData, setTracxnData] = useState<any>(null);
  const [founders, setFounders] = useState<Founder[] | null>(null);
  const [showAllCompetitors, setShowAllCompetitors] = useState(false);
  const [showAllNews, setShowAllNews] = useState(false);

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return '';
    }
  };

  // Function to check if a string is a valid URL
  const isValidUrl = (url: string): boolean => {
    try {
      // Remove any whitespace
      url = url.trim();
      
      // Check if it's just a single word without dots
      if (!url.includes('.')) {
        return false;
      }

      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const urlObj = new URL(url);
      // Check if hostname has at least one dot and no spaces
      return urlObj.hostname.includes('.') && !urlObj.hostname.includes(' ');
    } catch {
      return false;
    }
  };

  // Function to validate and extract domain name from URL
  const extractDomain = (url: string): string | null => {
    try {
      if (!isValidUrl(url)) {
        return null;
      }

      let cleanUrl = url.trim().toLowerCase();
      
      // Add protocol if missing
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = 'https://' + cleanUrl;
      }

      // Parse URL
      const parsedUrl = new URL(cleanUrl);
      
      // Get domain without www.
      const domain = parsedUrl.hostname.replace(/^www\./, '');
      
      // Additional validation: domain should have at least one dot and no spaces
      if (!domain.includes('.') || domain.includes(' ')) {
        return null;
      }

      return domain;
    } catch (error) {
      return null;
    }
  };

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

  // Function to scrape main page
  const scrapeMainPage = async (url: string) => {
    try {
      const response = await fetch('/api/scrapewebsiteurl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch main website data');
      }

      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error scraping main page:', error);
      throw error;
    }
  };

  // Update fetchCompetitors to only use main page data
  const fetchCompetitors = async (summary: string, url: string) => {
    try {
      const response = await fetch('/api/findcompetitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          websiteurl: url, 
          summaryText: summary 
        }),
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
      return data.results.filter((item: any) => item.title).slice(0, 6);
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  };

  // Funding API fetch function
  const fetchFunding = async (url: string) => {
    try {
      const response = await fetch('/api/fetchfunding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch funding data');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching funding data:', error);
      throw error;
    }
  };

  // Financial report fetch function
  const fetchFinancialReport = async (url: string) => {
    try {
      const response = await fetch('/api/fetchfinancialreport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch financial report');
      }

      const data = await response.json();
      return data.results || null;
    } catch (error) {
      console.error('Error fetching financial report:', error);
      throw error;
    }
  };

  // Crunchbase fetch function
  const fetchCrunchbase = async (url: string) => {
    try {
      const response = await fetch('/api/fetchcrunchbase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Crunchbase data');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching Crunchbase data:', error);
      throw error;
    }
  };

  // PitchBook fetch function
  const fetchPitchbook = async (url: string) => {
    try {
      const response = await fetch('/api/fetchpitchbook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch PitchBook data');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching PitchBook data:', error);
      throw error;
    }
  };

  // Tracxn fetch function
  const fetchTracxn = async (url: string) => {
    try {
      const response = await fetch('/api/fetchtracxn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Tracxn data');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching Tracxn data:', error);
      throw error;
    }
  };

  // Founders fetch function
  const fetchFounders = async (url: string) => {
    try {
      const response = await fetch('/api/fetchfounders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch founders');
      }

      const data = await response.json();
      // Filter out company and post URLs, only keep individual profiles
      return data.results.filter((result: any) => 
        !result.url.includes('/company/') && 
        !result.url.includes('/post/') &&
        result.url.includes('/in/')
      );
    } catch (error) {
      console.error('Error fetching founders:', error);
      throw error;
    }
  };

  // Add helper function to process LinkedIn text
  const processLinkedInText = (data: LinkedInData) => {
    const extract = (marker: string): string => {
      const index = data.text.indexOf(marker);
      if (index === -1) return '';
      
      const start = index + marker.length;
      const possibleEndMarkers = ['Industry', 'Company size', 'Headquarters', '\n\n'];
      let end = data.text.length;
      
      for (const endMarker of possibleEndMarkers) {
        const nextIndex = data.text.indexOf(endMarker, start);
        if (nextIndex !== -1 && nextIndex < end && nextIndex > start) {
          end = nextIndex;
        }
      }
      
      return data.text.substring(start, end).trim();
    };

    return {
      companySize: extract('Company size'),
      industry: extract('Industry'),
      headquarters: extract('Headquarters'),
      companyType: extract('Company type')
    };
  };

  // Add helper function to parse company size
  const parseCompanySize = (size: string): number => {
    if (!size) return 0;
    // Extract first number from string (e.g. "1,001-5,000" -> 1001)
    const match = size.match(/(\d+(?:,\d+)*)/);
    if (!match) return 0;
    return parseInt(match[1].replace(/,/g, ''));
  };

  // Extract company name from LinkedIn data
  const getCompanyName = (linkedinData: LinkedInData | null): string => {
    if (!linkedinData) return 'Company';
    // Get company name from title or the beginning of the text
    const name = linkedinData.title.replace(/\s*(-|\|)\s*LinkedIn\s*$/, '').trim();
    return name || 'Company';
  };

  // Extract company description
  const getCompanyDescription = (linkedinData: LinkedInData | null): string => {
    if (!linkedinData) return '';
    const lines = linkedinData.text.split('\n');
    // Look for the description line (usually the second non-empty line)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && 
          !line.includes('followers') && 
          !line.includes('employees') && 
          !line.includes('Industry') && 
          !line.includes('Company size') &&
          !line.includes('Headquarters') && 
          !line.includes('Company type') &&
          !line.startsWith('http')) {
        // Return the short description line
        return line.replace(/^#+\s*/, '').replace(/^#\s*/, '').trim();
      }
    }
    return '';
  };

  // Main Research Function
  const handleResearch = async (e: FormEvent) => {
    e.preventDefault();

    if (!companyUrl) {
      setErrors({ form: "Please enter a company URL" });
      return;
    }

    const domainName = extractDomain(companyUrl);
    
    if (!domainName) {
      setErrors({ form: "Please enter a valid company URL ('example.com')" });
      return;
    }

    setIsGenerating(true);
    setErrors({});

    // Reset all states to null
    setLinkedinData(null);
    setCompetitors(null);
    setNews(null);
    setFundingData(null);
    setFinancialReport(null);
    setCrunchbaseData(null);
    setPitchbookData(null);
    setTracxnData(null);
    setFounders(null);
    setShowAllCompetitors(false);
    setShowAllNews(false);

    try {
      // Run all API calls in parallel
      const promises = [
        // Main page scraping and dependent calls
        (async () => {
          const mainPageData = await scrapeMainPage(domainName);
          if (mainPageData && mainPageData[0]?.summary) {
            await fetchCompetitors(mainPageData[0].summary, domainName)
              .then((data) => setCompetitors(data))
              .catch((error) => setErrors(prev => ({ ...prev, competitors: error instanceof Error ? error.message : 'An error occurred with competitors' })));
          }
        })().catch((error) => setErrors(prev => ({ ...prev, websiteData: error instanceof Error ? error.message : 'An error occurred with website data' }))),

        // Independent API calls
        fetchLinkedInData(domainName)
          .then((data) => setLinkedinData(data))
          .catch((error) => setErrors(prev => ({ ...prev, linkedin: error instanceof Error ? error.message : 'An error occurred with LinkedIn' }))),

        fetchNews(domainName)
          .then((data) => setNews(data))
          .catch((error) => setErrors(prev => ({ ...prev, news: error instanceof Error ? error.message : 'An error occurred with news' }))),

        fetchFunding(domainName)
          .then((data) => setFundingData(data))
          .catch((error) => setErrors(prev => ({ ...prev, funding: error instanceof Error ? error.message : 'An error occurred with funding data' }))),

        fetchFinancialReport(domainName)
          .then((data) => setFinancialReport(data))
          .catch((error) => setErrors(prev => ({ ...prev, financial: error instanceof Error ? error.message : 'An error occurred with financial report' }))),

        fetchCrunchbase(domainName)
          .then((data) => setCrunchbaseData(data))
          .catch((error) => setErrors(prev => ({ ...prev, crunchbase: error instanceof Error ? error.message : 'An error occurred with Crunchbase data' }))),

        fetchPitchbook(domainName)
          .then((data) => setPitchbookData(data))
          .catch((error) => setErrors(prev => ({ ...prev, pitchbook: error instanceof Error ? error.message : 'An error occurred with PitchBook data' }))),

        fetchTracxn(domainName)
          .then((data) => setTracxnData(data))
          .catch((error) => setErrors(prev => ({ ...prev, tracxn: error instanceof Error ? error.message : 'An error occurred with Tracxn data' }))),

        fetchFounders(domainName)
          .then((data) => setFounders(data))
          .catch((error) => setErrors(prev => ({ ...prev, founders: error instanceof Error ? error.message : 'An error occurred with founders' })))
      ];

      await Promise.allSettled(promises);
    } finally {
      setIsGenerating(false);
    }
  };

  // Check if we should show the dashboard (when generating or when we have data)
  const showDashboard = isGenerating || linkedinData || founders || financialReport || 
                       fundingData || crunchbaseData || pitchbookData || 
                       tracxnData || competitors || news;

  if (!showDashboard) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-semibold text-gray-900 mb-4">
              Company Researcher
            </h1>
            <p className="text-gray-600 text-lg">
              Enter a company URL for detailed research info. Instantly know any company inside out.
            </p>
          </div>

          <form onSubmit={handleResearch} className="space-y-4 mb-8">
            <div>
              <input
                value={companyUrl}
                onChange={(e) => setCompanyUrl(e.target.value)}
                placeholder="Enter Company URL (e.g., example.com)"
                className="w-full bg-white p-4 border-2 border-brand-default rounded-lg focus:ring-2 focus:ring-brand-default focus:border-brand-default outline-none transition-colors text-gray-900"
              />
            </div>
            <button
              type="submit"
              className={`w-full text-white font-medium py-4 rounded-lg transition-all ${
                isGenerating 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-brand-default hover:bg-blue-600'
              }`}
              disabled={isGenerating}
            >
              {isGenerating ? 'Researching...' : 'Research Now'}
            </button>
          </form>

          {Object.entries(errors).map(([key, message]) => (
            <div key={key} className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {message}
            </div>
          ))}

          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-500 text-sm">Powered by</span>
            <a 
              href="https://exa.ai" 
              target="_blank" 
              rel="origin"
              className="hover:opacity-80 transition-opacity"
            >
              <img src="/exa_logo.png" alt="Exa Logo" className="h-5 object-contain" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {linkedinData?.image ? (
                <div className="w-16 h-16 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                  <img 
                    src={linkedinData.image} 
                    alt="Company Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse flex-shrink-0"></div>
              )}
              <div>
                <h1 className="text-3xl font-semibold text-gray-900 mb-1">
                  {linkedinData ? getCompanyName(linkedinData) : (
                    <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
                  )}
                </h1>
                <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
                  {linkedinData ? getCompanyDescription(linkedinData) : (
                    <span className="block h-5 bg-gray-200 rounded w-96 animate-pulse"></span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setLinkedinData(null);
                setCompetitors(null);
                setNews(null);
                setFundingData(null);
                setFinancialReport(null);
                setCrunchbaseData(null);
                setPitchbookData(null);
                setTracxnData(null);
                setFounders(null);
                setShowAllCompetitors(false);
                setShowAllNews(false);
              }}
              className="px-5 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors font-medium border border-gray-200 text-sm"
            >
              New Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Top Row - Key Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Company Info Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-brand-default" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">Company Details</h3>
            </div>
            {linkedinData ? (
              <div className="space-y-3">
                {(() => {
                  const processed = processLinkedInText(linkedinData);
                  return (
                    <>
                      {processed.companySize && (
                        <div className="flex justify-between items-center py-1">
                          <span className="text-gray-600 font-medium text-sm">Size</span>
                          <span className="text-gray-900 font-semibold text-sm">{processed.companySize}</span>
                        </div>
                      )}
                      {processed.industry && (
                        <div className="flex justify-between items-center py-1 border-t border-gray-100">
                          <span className="text-gray-600 font-medium text-sm">Industry</span>
                          <span className="text-gray-900 font-semibold text-sm">{processed.industry}</span>
                        </div>
                      )}
                      {processed.headquarters && (
                        <div className="flex justify-between items-center py-1 border-t border-gray-100">
                          <span className="text-gray-600 font-medium text-sm">Headquarters</span>
                          <span className="text-gray-900 font-semibold text-sm">{processed.headquarters}</span>
                        </div>
                      )}
                      {processed.companyType && (
                        <div className="flex justify-between items-center py-1 border-t border-gray-100">
                          <span className="text-gray-600 font-medium text-sm">Type</span>
                          <span className="text-gray-900 font-semibold text-sm">{processed.companyType}</span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-36 animate-pulse"></div>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>

          {/* Leadership Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">Leadership</h3>
            </div>
            {founders && founders.length > 0 ? (
              <div className="space-y-2">
                {founders.slice(0, 3).map((founder, index) => (
                  <a
                    key={index}
                    href={founder.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div className="w-8 h-8 bg-brand-default rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 text-xs">
                      {founder.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-default truncate">
                        {founder.title}
                      </p>
                      <p className="text-xs text-gray-500">LinkedIn Profile</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3 p-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-40 animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Funding Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">Funding</h3>
            </div>
            {fundingData || crunchbaseData ? (
              <div className="space-y-3">
                {fundingData && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">Latest Round</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{fundingData.summary}</p>
                  </div>
                )}
                {crunchbaseData && (
                  <div className="pt-2 border-t border-gray-100">
                    <a 
                      href={crunchbaseData.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-brand-default hover:text-blue-600 transition-colors"
                    >
                      View on Crunchbase
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-36 animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row - Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Similar Companies */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">Similar Companies</h3>
            </div>
            {competitors && competitors.length > 0 ? (
              <div className="space-y-2">
                {competitors.slice(0, showAllCompetitors ? competitors.length : 4).map((competitor, index) => (
                  <a 
                    key={index}
                    href={competitor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div>
                      <span className="font-medium text-gray-900 group-hover:text-brand-default transition-colors mb-2 text-sm">
                        {competitor.title}
                      </span>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                        {competitor.summary}
                      </p>
                    </div>
                  </a>
                ))}
                {competitors.length > 4 && (
                  <button
                    onClick={() => setShowAllCompetitors(!showAllCompetitors)}
                    className="w-full text-center py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showAllCompetitors ? 'Show less' : `Show ${competitors.length - 4} more`}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-2">
                    <div className="h-4 bg-gray-200 rounded w-48 animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent News */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-900">Recent News</h3>
            </div>
            {news && news.length > 0 ? (
              <div className="space-y-3">
                {news.slice(0, showAllNews ? news.length : 5).map((item, index) => (
                  <a 
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                  >
                    <div>
                      <span className="font-medium text-gray-900 group-hover:text-brand-default transition-colors leading-relaxed line-clamp-2 text-sm mb-2">
                        {item.title}
                      </span>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {item.favicon && (
                          <div className="w-3 h-3 rounded-sm overflow-hidden flex-shrink-0">
                            <img 
                              src={item.favicon} 
                              alt="Source favicon" 
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        {item.author && (
                          <span className="font-medium">{item.author}</span>
                        )}
                        {item.author && item.publishedDate && (
                          <span>•</span>
                        )}
                        {item.publishedDate && (
                          <span>{formatDate(item.publishedDate)}</span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
                {news.length > 5 && (
                  <button
                    onClick={() => setShowAllNews(!showAllNews)}
                    className="w-full text-center py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showAllNews ? 'Show less' : `Show ${news.length - 5} more`}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-3">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse mb-2"></div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <span className="text-gray-300">•</span>
                      <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}