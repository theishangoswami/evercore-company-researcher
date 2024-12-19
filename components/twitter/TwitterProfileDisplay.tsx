// components/twitter/TwitterProfileDisplay.tsx
import { Calendar, Users, TwitterIcon, Link as LinkIcon } from "lucide-react";
import TagPill from "../ui/tag-pill";

interface ExtractedInfo {
  bio?: string;
  profile_url?: string;
  name?: string;
  created_at?: string;
  followers_count?: string;
  statuses_count?: string;
  username?: string;
}

const extractInfoFromText = (text: string): ExtractedInfo => {
  const info: ExtractedInfo = {};
  
  // Extract bio
  const bioMatch = text.match(/^(.*?)(?=\| (?:profile_url:|name:|created_at:))/);
  if (bioMatch) {
    info.bio = bioMatch[1].trim();
  }
  
  const extractBeforeDoubleSpace = (str: string): string => {
    const parts = str.split('  ');
    return parts[0].trim();
  };

  const extractYear = (dateStr: string): string => {
    const match = dateStr.match(/20\d{2}/);
    return match ? match[0] : dateStr;
  };

  const regexPatterns: Record<keyof Omit<ExtractedInfo, 'bio' | 'username'>, RegExp> = {
    profile_url: /\| profile_url:\s*([^\s|]+)/,
    name: /\| name:\s*([^|]+)/,
    created_at: /\| created_at:\s*([^|]+)/,
    followers_count: /\| followers_count:\s*([^|]+)/,
    statuses_count: /\| statuses_count:\s*([^|]+)/,
  };

  // Extract and process each field
  Object.entries(regexPatterns).forEach(([key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      let value = match[1].trim();
      
      // Apply special processing based on field
      if (key === 'location' || key === 'statuses_count') {
        value = extractBeforeDoubleSpace(value);
      } else if (key === 'created_at') {
        value = extractYear(value);
      }
      
      info[key as keyof ExtractedInfo] = value;
    }
  });

  return info;
};

interface ProfileDisplayProps {
  rawText: string;
  username?: string;
}

export default function ProfileDisplay({ rawText, username }: ProfileDisplayProps) {
  const extractedInfo = extractInfoFromText(rawText);
  const { name, followers_count, statuses_count, created_at, profile_url, bio } = extractedInfo;

  return (
    <div className="mt-20 w-full bg-white p-4 sm:p-8 border shadow-sm rounded-none opacity-0 animate-fade-up [animation-delay:200ms]">
      <div className="space-y-6 sm:space-y-8">
        <div>
          {name && <h1 className="text-2xl sm:text-3xl font-bold text-brand-default mb-1">{name}</h1>}
          {username && <h2 className="text-gray-600 text-base sm:text-lg">@{username}</h2>}
        </div>
        {bio && <p className="text-gray-800 text-base sm:text-lg leading-relaxed">{bio}</p>}

        <div className="flex flex-wrap gap-2 max-w-full">
          {followers_count && (
            <TagPill content={`${followers_count} followers`} icon={<Users className="w-4 h-4" />} />
          )}
          {statuses_count && (
            <TagPill content={`Tweeted ${statuses_count} times`} icon={<TwitterIcon className="w-4 h-4" />} />
          )}
          {created_at && (
            <TagPill content={`Joined in ${created_at}`} icon={<Calendar className="w-4 h-4" />} />
          )}
          {profile_url && (
            <TagPill content={profile_url} icon={<LinkIcon className="w-4 h-4" />} />
          )}
        </div>
      </div>
    </div>
  );
}
