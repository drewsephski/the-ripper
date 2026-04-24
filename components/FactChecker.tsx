"use client";

import Link from "next/link";
import { useState, FormEvent, useRef, useEffect } from "react";
import ClaimsListResults from "./ClaimsListResult";
import LoadingMessages from "./ui/LoadingMessages";
import PreviewBox from "./PreviewBox";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import AnimatedGradientText from "./ui/animated-gradient-text";
import Footer from "./ui/ShareButtons";
import { getAssetPath } from "@/lib/utils";

interface Claim {
    claim: string;
    original_text: string;
}

type FactCheckResponse = {
  claim: string;
  assessment: "True" | "False" | "Insufficient Information";
  summary: string;
  fixed_original_text: string;
  confidence_score: number;
};

export default function FactChecker() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [factCheckResults, setFactCheckResults] = useState<any[]>([]);
  const [articleContent, setArticleContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showAllClaims, setShowAllClaims] = useState(true);
  const [urlInput, setUrlInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);

  // Create a ref for the loading or bottom section
  const loadingRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the loading section
  const scrollToLoading = () => {
    loadingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Watch for changes to `isGenerating` and scroll when it becomes `true`
  useEffect(() => {
    if (isGenerating) {
      scrollToLoading();
    }
  }, [isGenerating]);

  // Function to adjust textarea height
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '150px';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 300)}px`;
    }
  };

  // Adjust height when content changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [articleContent]);

  // Extract claims function
  const extractClaims = async (content: string) => {
    const response = await fetch(getAssetPath('/api/extractclaims'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });
  
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to extract claims.');
      } else {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text.slice(0, 100)}`);
      }
    }
  
    const data = await response.json();
    return Array.isArray(data.claims) ? data.claims : JSON.parse(data.claims);
  };
  
  // ExaSearch function
  const exaSearch = async (claim: string) => {
    console.log(`Claim recieved in exa search: ${claim}`);

    const response = await fetch(getAssetPath('/api/exasearch'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim }),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch verification for claim.');
      } else {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text.slice(0, 100)}`);
      }
    }

    const data = await response.json();
    return data;
  };

  // Verify claims function
  const verifyClaim = async (claim: string, original_text: string, exasources: any) => {
    const response = await fetch(getAssetPath('/api/verifyclaims'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ claim, original_text, exasources }),
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify claim.');
      } else {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text.slice(0, 100)}`);
      }
    }

    const data = await response.json();
    console.log("VerifyClaim response:", data.claims);

    return data.claims as FactCheckResponse;
  };
   
  // Fact check function
  const factCheck = async (e: FormEvent) => {
    e.preventDefault();
  
    if (!articleContent) {
      setError("Please enter some content or try with sample blog.");
      return;
    }
  
    setIsGenerating(true);
    setError(null);
    setFactCheckResults([]);
  
    try {
      const claims = await extractClaims(articleContent);
      const finalResults = await Promise.all(
        claims.map(async ({ claim, original_text }: Claim) => {
          try {
            const exaSources = await exaSearch(claim);
            
            if (!exaSources?.results?.length) {
              return null;
            }
    
            const sourceUrls = exaSources.results.map((result: { url: any; }) => result.url);
            
            const verifiedClaim = await verifyClaim(claim, original_text, exaSources.results);
    
            return { ...verifiedClaim, original_text, url_sources: sourceUrls };
          } catch (error) {
            console.error(`Failed to verify claim: ${claim}`, error);
            return null;
          }
        })
      );
  
      setFactCheckResults(finalResults.filter(result => result !== null));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred.');
      setFactCheckResults([]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Sample blog content
  const sampleBlog = `The Eiffel Tower, a remarkable iron lattice structure standing proudly in Paris, was originally built as a giant sundial in 1822, intended to cast shadows across the city to mark the hours. Designed by the renowned architect Gustave Eiffel, the tower stands 330 meters tall and once housed the city's first observatory.\n\nWhile it's famously known for hosting over 7 million visitors annually, it was initially disliked by Parisians. Interestingly, the Eiffel Tower was used as to guide ships along the Seine during cloudy nights.`;

  // Sample URL for scraping
  const sampleUrl = 'https://www.independent.co.uk/news/world/americas/us-politics/kash-patel-hockey-winter-olympics-b2963486.html';

  // Load sample content function
  const loadSampleContent = () => {
    setArticleContent(sampleBlog);
    setError(null);
  };

  // Load sample URL function
  const loadSampleUrl = async () => {
    setUrlInput(sampleUrl);
    setError(null);
    
    // Automatically trigger scraping
    setIsScraping(true);
    
    try {
      const response = await fetch(getAssetPath('/api/scrapeurl'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: sampleUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape URL.');
      }

      const data = await response.json();
      setArticleContent(data.content);
      setUrlInput('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to scrape URL.');
    } finally {
      setIsScraping(false);
    }
  };

  // Scrape URL function
  const scrapeUrl = async () => {
    if (!urlInput) {
      setError("Please enter a URL to scrape.");
      return;
    }

    setIsScraping(true);
    setError(null);

    try {
      const response = await fetch(getAssetPath('/api/scrapeurl'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape URL.');
      }

      const data = await response.json();
      setArticleContent(data.content);
      setUrlInput('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to scrape URL.');
    } finally {
      setIsScraping(false);
    }
  };

  return (
    <div className="flex flex-col z-0 min-h-screen">

        {/* Badge positioned at the top */}
      <div className="w-full flex justify-center pt-12 sm:pt-16 md:pt-24 opacity-0 animate-fade-up [animation-delay:200ms]">
        <Link href="https://github.com/drewsephski/the-ripper" target="_blank">
          <AnimatedGradientText>
          <img
            src={getAssetPath('/exaicon.png')}
            alt="exa logo"
            className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-2"
          />
            <span className="inline animate-gradient bg-gradient-to-r from-[#254bf1] via-purple-600 to-[#254bf1] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent text-xs sm:text-sm">
              Open Source Project
            </span>
            <ChevronRight className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </AnimatedGradientText>
        </Link>
      </div>

      <main className={`flex flex-col items-center justify-start flex-grow w-full max-w-7xl lg:max-w-6xl md:max-w-4xl sm:max-w-full px-4 sm:px-6 pt-8 sm:pt-12 ${factCheckResults.length > 0 ? 'overflow-auto' : ''}`}>
        <div className="text-left w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl pb-3 sm:pb-4 font-medium opacity-0 animate-fade-up [animation-delay:400ms] leading-tight">
            Detect LLM 
            <span className="text-brand-default"> Hallucinations </span>
          </h1>

          <p className="text-gray-800 text-sm sm:text-base mb-6 sm:mb-10 opacity-0 animate-fade-up [animation-delay:600ms]">
            Verify your content with real web data.
          </p>
        </div>
    
        <form onSubmit={factCheck} className="space-y-3 sm:space-y-4 w-full mb-8 sm:mb-12">
          <textarea
            ref={textareaRef}
            value={articleContent}
            onChange={(e) => setArticleContent(e.target.value)}
            placeholder="Enter Your Content"
            className="w-full bg-white p-3 sm:p-4 border box-border outline-none rounded-none ring-2 ring-brand-default resize-none min-h-[120px] sm:min-h-[150px] max-h-[200px] sm:max-h-[250px] overflow-auto opacity-0 animate-fade-up [animation-delay:800ms] transition-[height] duration-200 ease-in-out text-sm sm:text-base"
          />

          <div className="pb-4 sm:pb-5 space-y-3">
            <button
              onClick={loadSampleContent}
              disabled={isGenerating}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-brand-default text-brand-default font-semibold rounded-none hover:bg-brand-default hover:text-white transition-all opacity-0 animate-fade-up [animation-delay:1000ms] text-sm sm:text-base touch-manipulation ${
                isGenerating ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              Try with a sample blog post
            </button>
            
            <div className="flex gap-2 opacity-0 animate-fade-up [animation-delay:1100ms]">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Enter URL to scrape (e.g., https://example.com)"
                className="flex-1 bg-white p-3 sm:p-4 border box-border outline-none rounded-none ring-2 ring-brand-default text-sm sm:text-base"
                disabled={isScraping || isGenerating}
              />
              <button
                onClick={scrapeUrl}
                disabled={isScraping || isGenerating || !urlInput}
                className={`px-4 py-3 sm:py-4 bg-brand-default text-white font-semibold rounded-none transition-all text-sm sm:text-base touch-manipulation ${
                  isScraping || isGenerating || !urlInput ? 'opacity-50 cursor-not-allowed' : 'hover:ring-offset-2 hover:ring-2'
                }`}
              >
                {isScraping ? 'Scraping...' : 'Scrape URL'}
              </button>
            </div>

            <button
              onClick={loadSampleUrl}
              disabled={isScraping || isGenerating}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-brand-default text-brand-default font-semibold rounded-none hover:bg-brand-default hover:text-white transition-all opacity-0 animate-fade-up [animation-delay:1150ms] text-sm sm:text-base touch-manipulation ${
                isScraping || isGenerating ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              Try with a sample news article
            </button>
          </div>

          <button
            type="submit"
            className={`w-full text-white mb-6 sm:mb-10 font-semibold px-4 py-3 sm:py-4 rounded-none transition-opacity opacity-0 animate-fade-up [animation-delay:1200ms] min-h-[48px] sm:min-h-[50px] text-sm sm:text-base touch-manipulation ${
              isGenerating ? 'bg-gray-400' : 'bg-brand-default ring-2 ring-brand-default hover:ring-offset-2'
            } transition-colors`}
            disabled={isGenerating}
          >
            {isGenerating ? 'Detecting Hallucinations...' : 'Detect Hallucinations'}
          </button>
        </form>

        {isGenerating && (
            <div ref={loadingRef} className="w-full">
            <LoadingMessages isGenerating={isGenerating} />
            </div>
        )}

        {error && (
          <div className="mt-1 mb-8 sm:mb-14 p-3 sm:p-4 bg-red-100 border border-red-400 animate-fade-up text-red-700 rounded-none text-sm sm:text-base">
            {error}
          </div>
        )}


       

        {factCheckResults.length > 0 && (
        <div className="space-y-8 sm:space-y-14 mt-4 sm:mt-5 mb-20 sm:mb-32 w-full">
            <PreviewBox
            content={articleContent}
            claims={factCheckResults}
            />
            <div className="mt-4 pt-8 sm:pt-12 opacity-0 animate-fade-up [animation-delay:800ms]">
                <button
                onClick={() => setShowAllClaims(!showAllClaims)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 font-medium text-sm sm:text-base touch-manipulation"
                >
                {showAllClaims ? (
                    <>
                    <span>Hide Claims</span>
                    <ChevronUp className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
                    </>
                ) : (
                    <>
                    <span>Show All Claims</span>
                    <ChevronDown className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />
                    </>
                )}
                </button>

                {/* Claims List */}
                {showAllClaims && (
                <div className="mt-4">
                    <ClaimsListResults results={factCheckResults} />
                </div>
                )}
            </div>
        </div>
        )}


      </main>

      {/* Main Footer - Always Visible */}
      <footer className="w-full py-4 sm:py-6 px-4 sm:px-8 mt-auto border-t-4 border-brand-default">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <svg
                width="28"
                height="28"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0 sm:w-8 sm:h-8"
              >
                <rect x="4" y="4" width="24" height="24" fill="#254bf1"/>
                <rect x="8" y="8" width="8" height="8" fill="white"/>
                <rect x="16" y="16" width="8" height="8" fill="white"/>
                <rect x="8" y="20" width="4" height="4" fill="white"/>
                <rect x="20" y="8" width="4" height="4" fill="white"/>
              </svg>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold tracking-tight uppercase text-brand-dark">Made by</span>
                <span className="text-xl sm:text-2xl font-black tracking-tighter leading-none text-brand-default">DREW</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] sm:text-xs font-mono text-brand-muted tracking-widest uppercase">
                2026
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}