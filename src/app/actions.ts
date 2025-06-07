'use server';

import type { StudentResult, ScrapeError } from '@/lib/types';
// It's assumed that an AI flow named 'scrapeBeupResult' exists in src/ai/flows
// and is properly configured to be callable.
// The import path might differ based on actual Genkit setup if the flow is not auto-discovered.
// For now, we'll assume it can be called via ai.flow or similar, or is directly importable.
// Given the prompt about `src/ai/dev.ts`, direct import is plausible.
import { scrapeBeupResult } from '@/ai/flows/scrapeBeupResult'; // This assumes the flow is exported from this path.

export async function fetchStudentResultAction(
  registrationNumber: string,
  semester: string
): Promise<{ data: StudentResult | null; error: string | null }> {
  try {
    // Ensure the AI flow is correctly invoked. The exact mechanism depends on how Genkit flows are exposed.
    // This is a placeholder for the actual invocation.
    // If scrapeBeupResult is a Genkit flow function:
    const result : StudentResult | ScrapeError = await scrapeBeupResult({ registrationNumber, semester });

    if (result && typeof result === 'object' && 'error' in result && typeof result.error === 'string') {
      return { data: null, error: result.error };
    }
    
    if (!result || Object.keys(result).length === 0) {
      return { data: null, error: 'No result found or invalid registration number/semester.' };
    }

    // Add a retrievedAt timestamp
    const resultWithTimestamp = {
      ...(result as StudentResult),
      retrievedAt: new Date().toISOString(),
    };

    return { data: resultWithTimestamp, error: null };

  } catch (e) {
    console.error('Error in fetchStudentResultAction:', e);
    let errorMessage = 'An unexpected error occurred while fetching results.';
    if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === 'string') {
      errorMessage = e;
    }
    // More specific error handling for AI flow errors if possible
    // For example, if the error object from Genkit has a specific structure
    if (typeof e === 'object' && e !== null && 'message' in e) {
        errorMessage = (e as {message: string}).message;
    }
    
    return { data: null, error: errorMessage };
  }
}
