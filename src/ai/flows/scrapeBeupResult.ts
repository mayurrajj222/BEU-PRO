'use server';
/**
 * @fileOverview A Genkit flow to retrieve student academic results by calling a web scraping tool.
 *
 * - scrapeBeupResult - A function that orchestrates the result fetching process.
 * - ScrapeInput - The input type for the scrapeBeupResult function.
 * - ScrapeOutput - The return type for the scrapeBeupResult function (StudentResult or ScrapeError).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { StudentResult, ScrapeError } from '@/lib/types';
import { StudentResultSchema, ScrapeErrorSchema } from '@/lib/types';
import { fetchBeupPageTool } from '@/ai/tools/fetchBeupPageTool'; // Import the new tool

// Define input schema for the flow
const ScrapeInputSchema = z.object({
  registrationNumber: z.string().describe("The student's registration number."),
  semester: z.string().describe("The semester for which results are requested."),
});
export type ScrapeInput = z.infer<typeof ScrapeInputSchema>;

// Define output schema
const ScrapeOutputSchema = z.union([
  StudentResultSchema,
  ScrapeErrorSchema,
]);
export type ScrapeOutput = z.infer<typeof ScrapeOutputSchema>;

// Exported function to be called by the application (e.g., server action)
export async function scrapeBeupResult(input: ScrapeInput): Promise<ScrapeOutput> {
  return scrapeBeupResultFlow(input);
}

// Define the Genkit flow
const scrapeBeupResultFlow = ai.defineFlow(
  {
    name: 'scrapeBeupResultFlow',
    inputSchema: ScrapeInputSchema,
    outputSchema: ScrapeOutputSchema,
  },
  async (input: ScrapeInput): Promise<ScrapeOutput> => {
    console.log(`[Flow] Attempting to scrape results for RegNo: ${input.registrationNumber}, Sem: ${input.semester}`);
    
    try {
      // Call the web scraping tool
      const toolResult = await fetchBeupPageTool(input);

      // The tool already returns data in the ScrapeOutput format (either StudentResult or ScrapeError)
      // So, we can directly return its result.
      if ('error' in toolResult) {
        console.error(`[Flow] Error from tool: ${toolResult.error}`);
        return toolResult as ScrapeError;
      }
      
      console.log(`[Flow] Successfully retrieved data for ${input.registrationNumber}`);
      return toolResult as StudentResult;

    } catch (e: any) {
      console.error('[Flow] Unexpected error calling fetchBeupPageTool:', e);
      return ScrapeErrorSchema.parse({
        error: 'A critical error occurred in the result scraping flow.',
        details: e.message || 'Unknown error',
      });
    }
  }
);
