// CompanyResearchHome.tsx

"use client";
import { useState, FormEvent } from "react";
import LinkedInDisplay from "./linkedin/LinkedinDisplay";
import CompetitorsDisplay from "./competitors/CompetitorsDisplay";
import NewsDisplay from "./news/NewsDisplay";
import CompanySummary from "./companycontent/CompanySummar";
import ProfileDisplay from "./twitter/TwitterProfileDisplay";
import RecentTweetsDisplay from "./twitter/RecentTweetsDisplay";
import YoutubeVideosDisplay from "./youtube/YoutubeVideosDisplay";
import RedditDisplay from "./reddit/RedditDisplay";

export default function CompanyResearcher() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyUrl, setCompanyUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [linkedinData, setLinkedinData] = useState<any>(null);
  const [competitors, setCompetitors] = useState<any>([]);
  const [news, setNews] = useState<any[]>([]);
  const [companySummary, setCompanySummary] = useState<any>(null);
  const [twitterProfileText, setTwitterProfileText] = useState<any>(null);
  const [recentTweets, setRecentTweets] = useState<any[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [redditPosts, setRedditPosts] = useState<any[]>([]);

  // Function to extract domain name from URL
  const extractDomain = (url: string): string => {
    try {
      // Add protocol if not present
      const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
      const domain = new URL(urlWithProtocol).hostname;
      // Remove 'www.' if present
      return domain.replace(/^www\./, '');
    } catch (error) {
      // If URL parsing fails, return the original input
      // This allows for direct domain input like "exa.ai"
      return url.replace(/^www\./, '');
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

  // Main Research Function
  const handleResearch = async (e: FormEvent) => {
    e.preventDefault();

    if (!companyUrl) {
      setError("Please enter a company URL");
      return;
    }

    setIsGenerating(true);
    setError(null);

    // Extract the domain name from the input URL
    const domainName = extractDomain(companyUrl);

    try {
      const linkedinPromise = fetchLinkedInData(domainName)
        .then((data) => setLinkedinData(data))
        .catch((error) => setError(error instanceof Error ? error.message : 'An error occurred with LinkedIn'));

      const competitorsPromise = fetchCompetitors(domainName)
        .then((data) => setCompetitors(data))
        .catch((error) => setError(error instanceof Error ? error.message : 'An error occurred with competitors'));

      const newsPromise = fetchNews(domainName)
        .then((data) => setNews(data))
        .catch((error) => setError(error instanceof Error ? error.message : 'An error occurred with news'));
        
      const websiteDataPromise = fetchWebsiteData(domainName)
        .then((data) => setCompanySummary(data.companySummary))
        .catch((error) => setError(error instanceof Error ? error.message : 'An error occurred with company summary'));

      const twitterPromise = fetchTwitterProfile(domainName)
        .then((data) => setTwitterProfileText(data))
        .catch((error) => setError(error instanceof Error ? error.message : 'An error occurred with Twitter profile'));

      const youtubePromise = fetchYoutubeVideos(domainName)
        .then((data) => setYoutubeVideos(data))
        .catch((error) => setError(error instanceof Error ? error.message : 'An error occurred with YouTube videos'));

      const redditPromise = fetchRedditPosts(domainName)
        .then((data) => setRedditPosts(data))
        .catch((error) => setError(error instanceof Error ? error.message : 'An error occurred with Reddit posts'));

      await Promise.allSettled([
        linkedinPromise,
        competitorsPromise,
        newsPromise,
        websiteDataPromise,
        twitterPromise,
        youtubePromise,
        redditPromise
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
        <div className="mt-4 mb-4 p-3 bg-red-100 border border-red-400 text-red-700">
          {error}
        </div>
      )}

      {linkedinData && <LinkedInDisplay data={linkedinData} />}

      {twitterProfileText && (
        <>
          <ProfileDisplay rawText={twitterProfileText.text} username={twitterProfileText.username} />
          <RecentTweetsDisplay tweets={recentTweets} />
        </>
      )}

      {youtubeVideos.length > 0 && <YoutubeVideosDisplay videos={youtubeVideos} />}

      {redditPosts.length > 0 && <RedditDisplay posts={redditPosts} />}

      {competitors.length > 0 && <CompetitorsDisplay competitors={competitors} />}

      {news.length > 0 && <NewsDisplay news={news} />}

      {companySummary && <CompanySummary summary={companySummary} />}

    </div>
  );
}