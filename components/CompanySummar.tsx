import React from 'react';

interface SummaryItem {
  heading: string;
  text: string;
}

interface CompanySummaryProps {
  summary: SummaryItem[];
}

const CompanySummary: React.FC<CompanySummaryProps> = ({ summary }) => {
  return (
    <div className="w-full space-y-6 mt-20">
      <h2 className="text-2xl font-medium mb-8 ml-1">Company Overview</h2>
      
      <div className="bg-white border shadow-sm p-8 opacity-0 animate-fade-up [animation-delay:800ms]">
        <div className="space-y-8">
          {summary.map((item, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{item.heading.split(' ')[0]}</span>
                <div className="space-y-3 pt-1 w-full">
                  <h3 className="font-semibold text-lg">
                    {item.heading.split(' ').slice(1).join(' ')}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {item.text}
                  </p>
                </div>
              </div>
              
              {index < summary.length - 1 && (
                <div className="pt-6">
                  <div className="border-t border-gray-100"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompanySummary;