// LinkedInDisplay.tsx
import { Building2, Globe, MapPin, Users, Link as LinkIcon } from 'lucide-react';
import Image from 'next/image';

interface LinkedInData {
  text: string;
  url: string;
  image: string;
  title: string;
}

interface ProcessedData {
  name: string;
  description: string;
  industry: string;
  companySize: string;
  headquarters: string;
  type: string;
  website?: string | undefined;
  linkedinUrl: string;
  logo: string;
  specialties: string[];
}

function processLinkedInText(data: LinkedInData): ProcessedData {
  const extract = (start: string, end: string) => {
    const startIndex = data.text.indexOf(start);
    if (startIndex === -1) return '';
    const afterStart = data.text.substring(startIndex + start.length);
    const endIndex = end ? afterStart.indexOf(end) : -1;
    return endIndex === -1 ? afterStart.trim() : afterStart.substring(0, endIndex).trim();
  };

  const companySize = extract('Company size\n', '\n');
  const headquarters = extract('Headquarters\n', '\n');
  const type = extract('Type\n', '\n');
  const industry = extract('Industry\n', '\n');
  const specialtiesText = extract('Specialties\n', '\n');
  const specialties = specialtiesText ? specialtiesText.split(',').map(s => s.trim()).filter(Boolean) : [];

  return {
    name: data.title || extract('Title:', '\n'),
    description: extract('About us\n', '\n'),
    industry,
    companySize,
    headquarters,
    type,
    linkedinUrl: data.url,
    specialties,
    logo: data.image
  };
}

export default function LinkedInDisplay({ data }: { data: LinkedInData }) {
  const processedData = processLinkedInText(data);

  return (
    <div className="bg-white p-6 md:p-8 w-full max-w-4xl mx-auto border shadow-sm opacity-0 animate-fade-up">
      <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
        {processedData.logo && (
          <div className="w-20 h-20 md:w-24 md:h-24 relative flex-shrink-0 mx-0">
            <Image
              src={processedData.logo}
              alt={`${processedData.name} logo`}
              fill
              className="object-contain"
            />
          </div>
        )}
        <div className="text-left">
          <h2 className="text-2xl font-bold mb-4">{processedData.name}</h2>
            <p className="text-lg text-gray-800 leading-relaxed">
              {processedData.description}
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {processedData.companySize && (
            <InfoItem
            icon={<Users className="w-5 h-5" />}
            label="Company Size"
            value={processedData.companySize}
            />
        )}
        {processedData.headquarters && (
            <InfoItem
            icon={<MapPin className="w-5 h-5" />}
            label="Headquarters"
            value={processedData.headquarters}
            />
        )}
        {processedData.industry && (
            <InfoItem
            icon={<Globe className="w-5 h-5" />}
            label="Industry"
            value={processedData.industry}
            />
        )}
        {processedData.type && (
            <InfoItem
            icon={<Building2 className="w-5 h-5" />}
            label="Company Type"
            value={processedData.type}
            />
        )}
        {processedData.linkedinUrl && (
            <InfoItem
            icon={<LinkIcon className="w-5 h-5" />}
            label="LinkedIn"
            value={processedData.linkedinUrl}
            isLink
            />
        )}
      </div>

      {processedData.specialties.length > 0 && (
        <div className="mt-8">

          <div className="flex flex-wrap gap-2">
            {processedData.specialties.map((specialty, index) => (
              <span
                key={index}
                className="bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const InfoItem = ({
  icon,
  label,
  value,
  isLink = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLink?: boolean;
}) => (
  <div className="flex items-start gap-3">
    <div className="text-blue-600 mt-1">{icon}</div>
    <div>
      <h3 className="font-medium text-gray-700">{label}</h3>

      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-gray-600 break-words">{value}</p>
      )}

    </div>
  </div>
);