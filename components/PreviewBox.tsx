// PreviewBox.tsx
import React, { useState, useEffect } from 'react';
import { PreviewClaimCard } from './PreviewClaimCard';
import { Copy, CheckCheck, ChevronRight, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogClose } from './ui/dialog';

interface Claim {
  claim: string;
  assessment: string;
  summary: string;
  original_text: string;
  fixed_original_text: string;
  confidence_score: number;
  url_sources?: string[];
}

interface PreviewBoxProps {
  content: string;
  claims: Claim[];
}

interface ClaimAnalysisPopupProps {
  claim: Claim;
  onAcceptFix: (claim: Claim) => void;
  sourcesExpanded: boolean;
  setSourcesExpanded: (expanded: boolean) => void;
  onClose: () => void;
}

const ClaimAnalysisPopup: React.FC<ClaimAnalysisPopupProps> = ({
  claim,
  onAcceptFix,
  sourcesExpanded,
  setSourcesExpanded,
  onClose,
}) => {
  const isTrue = claim.assessment.toLowerCase().includes('true');
  const hasFix = claim.fixed_original_text !== claim.original_text;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header with Status */}
      <div className="flex items-center gap-2 sm:gap-3 pb-3 border-b border-gray-100">
        <span
          className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-none text-xs sm:text-sm font-medium ${
            isTrue
              ? 'bg-green-100 text-green-800 border border-green-200'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}
        >
          <span className="mr-1.5 sm:mr-2">{isTrue ? '✅' : '❌'}</span>
          <span>{isTrue ? 'Supported' : 'Refuted'}</span>
        </span>
        <span className="text-gray-600 text-xs sm:text-sm">
          {claim.confidence_score}% Confident
        </span>
      </div>

      {/* Claim Statement */}
      <div>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Claim
        </h3>
        <p className="text-base sm:text-lg font-semibold text-gray-900 leading-snug">
          {claim.claim}
        </p>
      </div>

      {/* Analysis Summary */}
      <div>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Analysis
        </h3>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
          {claim.summary}
        </p>
      </div>

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
                <li className="text-gray-500 italic text-xs sm:text-sm">
                  No sources available
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Suggested Fix Section (for false claims) */}
      {hasFix && (
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Suggested Fix
          </h3>
          <div className="space-y-2 pb-3">
            <div className="flex items-start gap-2">
              <span className="text-red-500 font-medium text-xs mt-1">×</span>
              <p className="text-gray-500 line-through text-sm sm:text-base">
                {claim.original_text}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500 font-medium text-xs mt-1">✓</span>
              <p className="text-green-700 text-sm sm:text-base">
                {claim.fixed_original_text}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onAcceptFix(claim);
              onClose();
            }}
            className="w-full px-4 py-2.5 sm:py-3 bg-brand-default text-white font-semibold rounded-none hover:ring-2 hover:ring-brand-default hover:ring-offset-2 transition-all text-sm sm:text-base touch-manipulation"
          >
            Accept Fix
          </button>
        </div>
      )}
    </div>
  );
};

const PreviewBox: React.FC<PreviewBoxProps> = ({ content, claims }) => {
  const [displayText, setDisplayText] = useState(content);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  // Track which claims have been fixed - store by claim text to identify them
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set());

  // Filter out claims with "Insufficient Information"
  const filteredClaims = claims.filter(
    (claim) => claim.assessment.toLowerCase() !== 'insufficient information'
  );

  // Get claims that still need fixing (false claims that haven't been applied yet)
  const claimsNeedingFix = filteredClaims.filter(
    (claim) => claim.assessment.toLowerCase() === 'false' && !appliedFixes.has(claim.claim)
  );

  useEffect(() => {
    setDisplayText(content);
    setAppliedFixes(new Set());
  }, [content, claims]);

  const highlightClaims = () => {
    let segments = [];
    let lastIndex = 0;

    const sortedClaims = [...filteredClaims].sort((a, b) => {
      const aIsFixed = appliedFixes.has(a.claim);
      const bIsFixed = appliedFixes.has(b.claim);
      const aText = aIsFixed ? a.fixed_original_text : a.original_text;
      const bText = bIsFixed ? b.fixed_original_text : b.original_text;
      return displayText.indexOf(aText) - displayText.indexOf(bText);
    });

    sortedClaims.forEach((claim) => {
      // For applied fixes, highlight the fixed text instead of original
      const isFixed = appliedFixes.has(claim.claim);
      const textToHighlight = isFixed ? claim.fixed_original_text : claim.original_text;
      const index = displayText.indexOf(textToHighlight, lastIndex);
      if (index !== -1) {
        const previousText = displayText.substring(lastIndex, index);
        segments.push(
          previousText.split('\n').map((line, i) => (
            <React.Fragment key={`text-${lastIndex}-${i}`}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))
        );

        const isTrue = claim.assessment.toLowerCase().includes('true');
        // Fixed claims are shown in green even if they were originally false
        const showAsFixed = isFixed;
        segments.push(
          <span
            key={`claim-${index}`}
            className={`cursor-pointer border-b-2 transition-colors ${
              isTrue || showAsFixed ? 'border-green-500 hover:bg-green-100' : 'border-red-500 hover:bg-red-100'
            } ${selectedClaim === claim ? (isTrue || showAsFixed) ? 'bg-green-100' : 'bg-red-100' : ''}`}
            onClick={() => {
              setSelectedClaim(claim);
              setIsPopupOpen(true);
              setSourcesExpanded(false);
            }}
          >
            {textToHighlight}
          </span>
        );
        lastIndex = index + textToHighlight.length;
      }
    });

    const remainingText = displayText.substring(lastIndex);
    segments.push(
      remainingText.split('\n').map((line, i) => (
        <React.Fragment key={`text-end-${i}`}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))
    );

    return segments;
  };

  const acceptFix = (claim: Claim) => {
    // Replace the original text with the fixed version
    const newText = displayText.replace(claim.original_text, claim.fixed_original_text);
    setDisplayText(newText);
    // Mark this claim as fixed
    setAppliedFixes((prev) => new Set(Array.from(prev).concat(claim.claim)));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 w-full">

      {/* Preview Box */}
      <div className="relative">
        <div className="w-full min-h-[150px] sm:min-h-[200px] p-4 sm:p-6 bg-white border rounded-none shadow-sm opacity-0 animate-fade-up [animation-delay:200ms] text-sm sm:text-base">
          {highlightClaims()}
        </div>
        
        {/* Copy Button */}
        <div className="flex justify-end mt-2 sm:mt-3 mb-6 sm:mb-10 mr-4 sm:mr-5 opacity-0 animate-fade-up [animation-delay:400ms]">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 touch-manipulation"
          >
            {copied ? (
              <>
                <CheckCheck className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
                <span>Copy all text</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Popup Modal for Claim Analysis */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsPopupOpen(false)} />
          {selectedClaim && (
            <ClaimAnalysisPopup
              claim={selectedClaim}
              onAcceptFix={acceptFix}
              sourcesExpanded={sourcesExpanded}
              setSourcesExpanded={setSourcesExpanded}
              onClose={() => setIsPopupOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreviewBox;