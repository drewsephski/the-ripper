import React, { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface ClaimsListResult {
  claim: string;
  assessment: string;
  summary: string;
  fixed_original_text: string;
  confidence_score: number;
  url_sources?: string[];
}

interface ClaimsListResultsProps {
  results: ClaimsListResult[];
}

const ClaimsListResults: React.FC<ClaimsListResultsProps> = ({ results }) => {
  const [expandedClaims, setExpandedClaims] = useState<Set<number>>(
    new Set(results.map((_, idx) => idx))
  );
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());

  const toggleClaim = (index: number) => {
    setExpandedClaims(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleSources = (index: number) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getStatusBadge = (assessment: string) => {
    const isTrue = assessment.toLowerCase().includes('true');
    return (
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
    );
  };

  return (
    <div className="mt-6 w-full bg-white p-4 sm:p-6 border rounded-none shadow-sm space-y-6 sm:space-y-8">
      {results
      .filter((result) => result.assessment.toLowerCase() !== 'insufficient information')
      .map((result, index) => {
        const isClaimExpanded = expandedClaims.has(index);
        const isSourcesExpanded = expandedSources.has(index);
        
        return (
          <div key={index} className="border-b border-gray-100 last:border-0 pb-4 sm:pb-6 last:pb-0">
            {/* Claim Header - Always Visible */}
            <button
              onClick={() => toggleClaim(index)}
              className="w-full text-left flex items-center justify-between group touch-manipulation"
            >
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 -mt-0.5">
                {getStatusBadge(result.assessment)}
                <span className="text-gray-600 text-xs sm:text-sm">
                  {result.confidence_score}% Confident
                </span>
              </div>
              <ChevronDown 
                className={`text-gray-400 transition-transform duration-300 ease-out-expo w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] ${
                  isClaimExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Collapsible Claim Content */}
            <div 
              className={`grid transition-[grid-template-rows] duration-500 ease-out-expo overflow-hidden ${
                isClaimExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="min-h-0">
                <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                  <h3 className="font-semibold text-base sm:text-lg text-gray-900 leading-snug">{result.claim}</h3>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{result.summary}</p>

                  {/* Sources Section */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleSources(index)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors group touch-manipulation"
                    >
                      <ChevronRight 
                        className={`transition-transform duration-300 ease-out-expo w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] ${
                          isSourcesExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      <span className="font-medium text-sm sm:text-base">Sources</span>
                      <span className="text-xs text-gray-400">
                        ({result.url_sources?.length || 0})
                      </span>
                    </button>
                    
                    <div 
                      className={`grid transition-[grid-template-rows] duration-500 ease-out-expo overflow-hidden ${
                        isSourcesExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="min-h-0">
                        <ul className="space-y-2 pl-5 sm:pl-7 pt-2">
                          {result.url_sources && result.url_sources.length > 0 ? (
                            result.url_sources.map((source, idx) => (
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
          </div>
        );
      })}
    </div>
  );
};

export default ClaimsListResults;