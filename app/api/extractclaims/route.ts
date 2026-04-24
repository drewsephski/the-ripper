// app/api/extractclaims/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from 'ai';

// This function can run for a maximum of 60 seconds
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY);
    console.log('OPENROUTER_API_KEY prefix:', process.env.OPENROUTER_API_KEY?.substring(0, 10));

    const openrouter = createOpenRouter({
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    // Run the prompt to extract claims along with original text parts
    console.log('Calling generateText with model: google/gemini-3.1-flash-lite-preview-20260303');
    const { text } = await generateText({
      model: openrouter('google/gemini-3.1-flash-lite-preview'),
      prompt: 
      `You are an expert at extracting claims from text.
      Your task is to identify and list all claims present, true or false, in the given text. Each claim should be a verifiable statement.
      
      If the input content is very lengthy, then pick the major claims.

      Don't repeat the same claim.

      For each claim, also provide the original part of the sentence from which the claim is derived.
      Present the claims as a JSON array of objects. Each object should have two keys:
      - "claim": the extracted claim in a single verifiable statement.
      - "original_text": the portion of the original text that supports or contains the claim.
      
      Do not include any additional text or commentary.

      Here is the content: ${content}

      Return the output strictly as a JSON array of objects following this schema:
      [
        {
          "claim": "extracted claim here",
          "original_text": "original text portion here"
        },
        ...
      ]

        Output the result as valid JSON, strictly adhering to the defined schema. Ensure there are no markdown codes or additional elements included in the output. Do not add anything else. Return only JSON.
      `,
    });

    console.log('Raw text response:', text);
    
    return NextResponse.json({ claims: JSON.parse(text) });
  } catch (error: any) {
    console.error('Extract claims error:', error);
    return NextResponse.json({ 
      error: `Failed to extract claims`,
      details: error.message || String(error)
    }, { status: 500 });
  }
}
