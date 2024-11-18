// components/CompetitorsDisplay.tsx
import React from 'react';

interface Competitor {
  title: string;
  url: string;
  summary: string;
}

interface CompetitorDisplayProps {
  competitors: Competitor[];
}

export default function CompetitorsDisplay({ competitors }: CompetitorDisplayProps) {
  if (!competitors?.length) return null;

  return (
    <div className="mt-8 space-y-6 opacity-0 animate-fade-up [animation-delay:200ms]">
      <h2 className="text-2xl font-medium mb-4">
        Similar Companies
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitors.map((competitor, index) => (
          <div
            key={competitor.url}
            className="bg-white p-6 border hover:ring-brand-default hover:ring-1 transition-all duration-200 opacity-0 animate-fade-up"
            style={{ animationDelay: `${(index + 1) * 200}ms` }}
          >
            <a
              href={competitor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <h3 className="text-lg font-medium text-brand-default group-hover:text-brand-default/80 transition-colors mb-2">
                {competitor.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {competitor.summary}
              </p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}