// PreviewClaimCard.tsx
import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface Claim {
  claim: string;
  assessment: string;
  summary: string;
  original_text: string;
  fixed_original_text: string;
  confidence_score: number;
  url_sources?: string[];
}

interface PreviewClaimCardProps {
  claim: Claim;
  onAcceptFix: (claim: Claim) => void;
}

export const PreviewClaimCard: React.FC<PreviewClaimCardProps> = ({ claim, onAcceptFix }) => {
  const isTrue = claim.assessment.toLowerCase().includes('true');
  const hasFix = claim.fixed_original_text !== claim.original_text;
  const [isExpanded, setIsExpanded] = useState(true);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  return (
    <div className="bg-white border rounded-none shadow-sm p-4 sm:p-6 space-y-3 sm:space-y-4 opacity-0 animate-fade-up [animation-delay:600ms]">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left flex items-center justify-between group touch-manipulation"
      >
        <div className="flex items-center gap-2 sm:gap-3 flex-1 -mt-0.5">
          <span
            className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-none text-xs sm:text-sm font-medium ${
              isTrue
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            <span className="mr-1.5 sm:mr-2 text-xs sm:text-sm">{isTrue ? '✅' : '❌'}</span>
            <span className="text-xs sm:text-sm">{isTrue ? 'Supported' : 'Refuted'}</span>
          </span>
          <span className="text-gray-600 text-xs sm:text-sm">
            {claim.confidence_score}% Confident
          </span>
        </div>
        <ChevronDown 
          className={`text-gray-400 transition-transform duration-300 ease-out-expo w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Collapsible Content */}
      <div 
        className={`grid transition-[grid-template-rows] duration-500 ease-out-expo overflow-hidden ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0">
          <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 leading-snug">{claim.claim}</h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{claim.summary}</p>

            {/* Sources Section */}
            <div className="pt-2">
              <button
                onClick={() => setSourcesExpanded(!sourcesExpanded)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors group touch-manipulation"
              >
                <ChevronRight 
                  className={`transition-transform duration-300 ease-out-expo w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] ${
                    sourcesExpanded ? 'rotate-90' : ''
                  }`}
                />
                <span className="font-medium text-sm sm:text-base">Sources</span>
                <span className="text-xs text-gray-400">
                  ({claim.url_sources?.length || 0})
                </span>
              </button>
              
              <div 
                className={`grid transition-[grid-template-rows] duration-500 ease-out-expo overflow-hidden ${
                  sourcesExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="min-h-0">
                  <ul className="space-y-2 pl-5 sm:pl-7 pt-2">
                    {claim.url_sources && claim.url_sources.length > 0 ? (
                      claim.url_sources.map((source, idx) => (
                        <li key={idx}>
                          <a
                            href={source}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline text-xs sm:text-sm break-all block touch-manipulation"
                          >
                            {source}
                          </a>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic text-xs sm:text-sm">No sources available</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hasFix && (
        <div className="pt-4 sm:pt-5 space-y-2">
            <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 text-sm sm:text-base">Suggested Fix</span>
            </div>
                <div className="space-y-2 pb-2">
                    <p className="text-gray-500 line-through text-sm sm:text-base">{claim.original_text}</p>
                    <p className="text-green-700 text-sm sm:text-base">{claim.fixed_original_text}</p>
                </div>
                <button
                    onClick={() => onAcceptFix(claim)}
                    className="w-full mt-3 sm:mt-4 px-4 py-2.5 sm:py-3 bg-brand-default text-white font-semibold rounded-none hover:ring-1 transition-colors text-sm sm:text-base touch-manipulation"
                    >
                    Accept Fix
                </button>
        </div>
        )}

    </div>
  );
};