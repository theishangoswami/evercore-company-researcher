// CompanyResearchHome.tsx

"use client";
import { useState, FormEvent } from "react";
import LinkedInDisplay from "./linkedin/LinkedinDisplay";
import CompetitorsDisplay from "./competitors/CompetitorsDisplay";
import NewsDisplay from "./news/NewsDisplay";
import CompanySummary from "./companycontent/CompanySummar";
import FundingDisplay from "./companycontent/FundingDisplay";
import ProfileDisplay from "./twitter/TwitterProfileDisplay";
import RecentTweetsDisplay from "./twitter/RecentTweetsDisplay";
import YoutubeVideosDisplay from "./youtube/YoutubeVideosDisplay";
import RedditDisplay from "./reddit/RedditDisplay";
import GitHubDisplay from "./github/GitHubDisplay";
import FinancialReportDisplay from './financial/FinancialReportDisplay';
import TikTokDisplay from './tiktok/TikTokDisplay';
import WikipediaDisplay from './wikipedia/WikipediaDisplay';
import CrunchbaseDisplay from './crunchbase/CrunchbaseDisplay';
import PitchBookDisplay from './pitchbook/PitchBookDisplay';
import TracxnDisplay from "./tracxn/TracxnDisplay";


export default function CompanyResearcher() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyUrl, setCompanyUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [linkedinData, setLinkedinData] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any>([]);
  const [news, setNews] = useState<any[]>([]);
  const [companySummary, setCompanySummary] = useState<any>(null);
  const [twitterProfileText, setTwitterProfileText] = useState<any>(null);
  const [recentTweets, setRecentTweets] = useState<any[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [redditPosts, setRedditPosts] = useState<any[]>([]);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [fundingData, setFundingData] = useState<any>(null);
  const [financialReport, setFinancialReport] = useState<any>(null);
  const [tiktokData, setTiktokData] = useState<any>(null);
  const [wikipediaData, setWikipediaData] = useState<any>(null);
  const [crunchbaseData, setCrunchbaseData] = useState<any>(null);
  const [pitchbookData, setPitchbookData] = useState<any>(null);
  const [tracxnData, setTracxnData] = useState<any>(null);

  // Function to validate and extract domain name from URL
  const extractDomain = (url: string): string | null => {
    try {
      // Remove any trailing slashes and get everything before the first slash
      const cleanUrl = url.trim().toLowerCase().split('/')[0];
      
      // Regular expression to validate domain format
      const domainRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      
      if (!domainRegex.test(cleanUrl)) {
        return null;
      }

      // If URL starts with http(s), parse it properly
      if (cleanUrl.startsWith('http')) {
        const parsedUrl = new URL(cleanUrl);
        return parsedUrl.hostname.replace(/^www\./, '');
      }
      
      // Otherwise just remove www. if present
      return cleanUrl.replace(/^www\./, '');

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
      return data.results.filter((item: any) => item.title).slice(0, 6);
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  };

  // Function to fetch subpages, main page data, and then pass both to the companysummary API
  const fetchWebsiteData = async (url: string) => {
    try {
      // Step 1: Fetch data from subpages and main page in parallel
      const subpagesFetch = fetch('/api/scrapewebsitesubpages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      const mainPageFetch = fetch('/api/scrapewebsiteurl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      // Run both requests in parallel and await their results
      const [subpagesResponse, mainPageResponse] = await Promise.all([subpagesFetch, mainPageFetch]);

      if (!subpagesResponse.ok) {
        throw new Error('Failed to fetch subpages data');
      }
      if (!mainPageResponse.ok) {
        throw new Error('Failed to fetch main website data');
      }

      const subpagesData = await subpagesResponse.json();
      const mainPageData = await mainPageResponse.json();

      console.log(subpagesData.results);
      console.log(mainPageData.results);

      // Pass the parsed data to the companysummary API
      const companySummaryResponse = await fetch('/api/companysummary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subpages: subpagesData.results,
          mainpage: mainPageData.results,
          websiteurl: url
        }),
      });

      const companySummaryData = await companySummaryResponse.json();

      // Return the final summarized data
      return {
        companySummary: companySummaryData.result,
      };
    } catch (error) {
      console.error('Error fetching website data:', error);
      throw error;
    }
  };

  // Recent tweets fetch function
  const fetchRecentTweets = async (username: string) => {
    try {
      const response = await fetch('/api/scraperecenttweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recent tweets');
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching recent tweets:', error);
      throw error;
    }
  };

  // Twitter profile fetch function
  const fetchTwitterProfile = async (url: string) => {
    try {
      const response = await fetch('/api/scrapetwitterprofile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Twitter profile');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        // Fetch tweets separately without waiting
        if (result.author) {
          fetchRecentTweets(result.author)
            .then(tweets => setRecentTweets(tweets))
            .catch(error => console.error('Error fetching recent tweets:', error));
        }
        return {
          text: result.text,
          username: result.author
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching Twitter profile:', error);
      throw error;
    }
  };
  // Youtube videos fetch function
  const fetchYoutubeVideos = async (url: string) => {
    try {
      const response = await fetch('/api/fetchyoutubevideos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch YouTube videos');
      }
  
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      throw error;
    }
  };

  // Reddit posts fetch function
  const fetchRedditPosts = async (url: string) => {
    try {
      const response = await fetch('/api/scrapereddit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Reddit posts');
      }

      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error('Error fetching Reddit posts:', error);
      throw error;
    }
  };

  // GitHub URL fetch function
  const fetchGitHubUrl = async (url: string) => {
    try {
      const response = await fetch('/api/fetchgithuburl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch GitHub URL');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0].url;
      }
      return null;
    } catch (error) {
      console.error('Error fetching GitHub URL:', error);
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

  // TikTok fetch function
  const fetchTikTokProfile = async (url: string) => {
    try {
      const response = await fetch('/api/fetchtiktok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch TikTok profile');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching TikTok profile:', error);
      throw error;
    }
  };

  // Wikipedia fetch function
  const fetchWikipedia = async (url: string) => {
    try {
      const response = await fetch('/api/fetchwikipedia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteurl: url }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Wikipedia data');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return {
          text: data.results[0].text,
          url: data.results[0].url
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching Wikipedia data:', error);
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

  // Main Research Function
  const handleResearch = async (e: FormEvent) => {
    e.preventDefault();

    if (!companyUrl) {
      setErrors({ form: "Please enter a company URL" });
      return;
    }

    const domainName = extractDomain(companyUrl);
    
    if (!domainName) {
      setErrors({ form: "Please enter a valid URL (e.g., 'example.com', 'www.example.com', or 'https://example.com')" });
      return;
    }

    setIsGenerating(true);
    setErrors({});

    try {
      const linkedinPromise = fetchLinkedInData(domainName)
        .then((data) => setLinkedinData(data))
        .catch((error) => setErrors(prev => ({ ...prev, linkedin: error instanceof Error ? error.message : 'An error occurred with LinkedIn' })));

      const competitorsPromise = fetchCompetitors(domainName)
        .then((data) => setCompetitors(data))
        .catch((error) => setErrors(prev => ({ ...prev, competitors: error instanceof Error ? error.message : 'An error occurred with competitors' })));

      const newsPromise = fetchNews(domainName)
        .then((data) => setNews(data))
        .catch((error) => setErrors(prev => ({ ...prev, news: error instanceof Error ? error.message : 'An error occurred with news' })));
        
      const websiteDataPromise = fetchWebsiteData(domainName)
        .then((data) => setCompanySummary(data.companySummary))
        .catch((error) => setErrors(prev => ({ ...prev, summary: error instanceof Error ? error.message : 'An error occurred with company summary' })));

      const twitterPromise = fetchTwitterProfile(domainName)
        .then((data) => setTwitterProfileText(data))
        .catch((error) => setErrors(prev => ({ ...prev, twitter: error instanceof Error ? error.message : 'An error occurred with Twitter profile' })));

      const youtubePromise = fetchYoutubeVideos(domainName)
        .then((data) => setYoutubeVideos(data))
        .catch((error) => setErrors(prev => ({ ...prev, youtube: error instanceof Error ? error.message : 'An error occurred with YouTube videos' })));

      const redditPromise = fetchRedditPosts(domainName)
        .then((data) => setRedditPosts(data))
        .catch((error) => setErrors(prev => ({ ...prev, reddit: error instanceof Error ? error.message : 'An error occurred with Reddit posts' })));

      const githubPromise = fetchGitHubUrl(domainName)
        .then((url) => setGithubUrl(url))
        .catch((error) => setErrors(prev => ({ ...prev, github: error instanceof Error ? error.message : 'An error occurred with GitHub' })));

      const fundingPromise = fetchFunding(domainName)
        .then((data) => setFundingData(data))
        .catch((error) => setErrors(prev => ({ ...prev, funding: error instanceof Error ? error.message : 'An error occurred with funding data' })));

      const financialReportPromise = fetchFinancialReport(domainName)
        .then((data) => setFinancialReport(data))
        .catch((error) => setErrors(prev => ({ ...prev, financial: error instanceof Error ? error.message : 'An error occurred with financial report' })));

      const tiktokPromise = fetchTikTokProfile(domainName)
        .then((data) => setTiktokData(data))
        .catch((error) => setErrors(prev => ({ ...prev, tiktok: error instanceof Error ? error.message : 'An error occurred with TikTok profile' })));

      const wikipediaPromise = fetchWikipedia(domainName)
        .then((data) => setWikipediaData(data))
        .catch((error) => setErrors(prev => ({ ...prev, wikipedia: error instanceof Error ? error.message : 'An error occurred with Wikipedia data' })));

      const crunchbasePromise = fetchCrunchbase(domainName)
        .then((data) => setCrunchbaseData(data))
        .catch((error) => setErrors(prev => ({ ...prev, crunchbase: error instanceof Error ? error.message : 'An error occurred with Crunchbase data' })));

      const pitchbookPromise = fetchPitchbook(domainName)
        .then((data) => setPitchbookData(data))
        .catch((error) => setErrors(prev => ({ ...prev, pitchbook: error instanceof Error ? error.message : 'An error occurred with PitchBook data' })));

      const tracxnPromise = fetchTracxn(domainName)
        .then((data) => setTracxnData(data))
        .catch((error) => setErrors(prev => ({ ...prev, tracxn: error instanceof Error ? error.message : 'An error occurred with Tracxn data' })));

      await Promise.allSettled([
        linkedinPromise,
        competitorsPromise,
        newsPromise,
        websiteDataPromise,
        twitterPromise,
        youtubePromise,
        redditPromise,
        githubPromise,
        fundingPromise,
        financialReportPromise,
        tiktokPromise,
        wikipediaPromise,
        crunchbasePromise,
        pitchbookPromise,
        tracxnPromise
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-5xl p-6 z-10 mb-20 mt-6">
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
          placeholder="Enter Company URL (e.g., example.com)"
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

      {Object.entries(errors).map(([key, message]) => (
        <div key={key} className="mt-4 mb-4 p-3 bg-red-100 border border-red-400 text-red-700">
          {message}
        </div>
      ))}

   

      {linkedinData && <LinkedInDisplay data={linkedinData} />}

      {twitterProfileText && (
        <>
          <ProfileDisplay rawText={twitterProfileText.text} username={twitterProfileText.username} />
          <RecentTweetsDisplay tweets={recentTweets} />
        </>
      )}

      {githubUrl && <GitHubDisplay githubUrl={githubUrl} />}

      {youtubeVideos.length > 0 && <YoutubeVideosDisplay videos={youtubeVideos} />}

      {redditPosts.length > 0 && <RedditDisplay posts={redditPosts} />}

      {competitors.length > 0 && <CompetitorsDisplay competitors={competitors} />}

      {news.length > 0 && <NewsDisplay news={news} />}

      {wikipediaData && <WikipediaDisplay data={wikipediaData} />}

      {fundingData && <FundingDisplay fundingData={fundingData} />}

      {crunchbaseData && <CrunchbaseDisplay data={crunchbaseData} />}

      {pitchbookData && <PitchBookDisplay data={pitchbookData} />}

      {tracxnData && <TracxnDisplay data={tracxnData} />}

      {financialReport && <FinancialReportDisplay report={financialReport} />}

      {tiktokData && <TikTokDisplay data={tiktokData} />}

      {companySummary && <CompanySummary summary={companySummary} />}

    </div>
  );
}