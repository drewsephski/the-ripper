// app/api/scrapeurl/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Exa from "exa-js";

const exa = new Exa(process.env.EXA_API_KEY as string);

// This function can run for a maximum of 60 seconds
export const maxDuration = 60;

async function tryGetContents(url: string) {
  console.log(`Attempting getContents for: ${url}`);
  const result = await exa.getContents(
    [url],
    {
      text: true,
      livecrawl: 'always',
    }
  );
  
  if (!result.results || result.results.length === 0) {
    throw new Error('No results from getContents');
  }
  
  const firstResult = result.results[0];
  if (!firstResult.text) {
    throw new Error('No text content in getContents result');
  }
  
  return {
    content: firstResult.text,
    url: firstResult.url || url,
    title: firstResult.title || 'Untitled'
  };
}

async function trySearchAndContents(url: string) {
  console.log(`Falling back to searchAndContents for: ${url}`);
  const result = await exa.searchAndContents(
    url,
    {
      type: "keyword",
      numResults: 1,
      livecrawl: 'always',
      text: true,
    }
  );
  
  if (!result.results || result.results.length === 0) {
    throw new Error('No results from searchAndContents');
  }
  
  const firstResult = result.results[0];
  if (!firstResult.text) {
    throw new Error('No text content in searchAndContents result');
  }
  
  return {
    content: firstResult.text,
    url: firstResult.url || url,
    title: firstResult.title || 'Untitled'
  };
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`Attempting to scrape URL: ${url}`);

    let scrapedData;
    
    // Try getContents first (most direct method)
    try {
      scrapedData = await tryGetContents(url);
    } catch (getError) {
      console.log('getContents failed, trying fallback:', getError);
      
      // Fallback to searchAndContents
      try {
        scrapedData = await trySearchAndContents(url);
      } catch (searchError) {
        console.error('Both methods failed:', searchError);
        return NextResponse.json({ 
          error: 'Failed to scrape URL using both methods',
          details: `getContents: ${getError instanceof Error ? getError.message : String(getError)} | searchAndContents: ${searchError instanceof Error ? searchError.message : String(searchError)}`
        }, { status: 500 });
      }
    }

    return NextResponse.json(scrapedData);
  } catch (error) {
    console.error('Scrape URL error:', error);
    return NextResponse.json({ 
      error: `Failed to scrape URL`,
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
