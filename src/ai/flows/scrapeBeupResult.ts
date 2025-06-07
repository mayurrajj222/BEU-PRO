'use server';
/**
 * @fileOverview This file previously contained a Genkit flow to scrape student academic results.
 * It is no longer used as the application now opens results directly on the official website.
 */

// import { ai } from '@/ai/genkit';
// import { z } from 'genkit';
// import type { StudentResult, ScrapeError } from '@/lib/types';
// import { StudentResultSchema, ScrapeErrorSchema } from '@/lib/types';
// import { fetchBeupPageTool } from '@/ai/tools/fetchBeupPageTool';

// const ScrapeInputSchema = z.object({
//   registrationNumber: z.string().describe("The student's registration number."),
//   semester: z.string().describe("The semester for which results are requested."),
// });
// export type ScrapeInput = z.infer<typeof ScrapeInputSchema>;

// const ScrapeOutputSchema = z.union([
//   StudentResultSchema,
//   ScrapeErrorSchema,
// ]);
// export type ScrapeOutput = z.infer<typeof ScrapeOutputSchema>;

// export async function scrapeBeupResult(input: ScrapeInput): Promise<ScrapeOutput> {
//   // This function is no longer called by the application.
//   // console.warn("scrapeBeupResult CALLED - THIS FLOW IS DEPRECATED");
//   // return scrapeBeupResultFlow(input);
//    return { error: "This functionality is deprecated." };
// }

// const scrapeBeupResultFlow = ai.defineFlow(
//   {
//     name: 'scrapeBeupResultFlow',
//     inputSchema: ScrapeInputSchema,
//     outputSchema: ScrapeOutputSchema,
//   },
//   async (input: ScrapeInput): Promise<ScrapeOutput> => {
//     console.log(`[Flow] Attempting to scrape results for RegNo: ${input.registrationNumber}, Sem: ${input.semester}`);
    
//     try {
//       const toolResult = await fetchBeupPageTool(input);

//       if ('error' in toolResult) {
//         console.error(`[Flow] Error from tool: ${toolResult.error}`);
//         return toolResult as ScrapeError;
//       }
      
//       console.log(`[Flow] Successfully retrieved data for ${input.registrationNumber}`);
//       return toolResult as StudentResult;

//     } catch (e: any) {
//       console.error('[Flow] Unexpected error calling fetchBeupPageTool:', e);
//       return ScrapeErrorSchema.parse({
//         error: 'A critical error occurred in the result scraping flow.',
//         details: e.message || 'Unknown error',
//       });
//     }
//   }
// );

// To keep Genkit happy if this file is still imported by dev.ts, export placeholder types.
// Or better, remove the import from dev.ts
export type ScrapeInput = {};
export type ScrapeOutput = {};
export async function scrapeBeupResult(input: ScrapeInput): Promise<ScrapeOutput> {
  console.warn("DEPRECATED: scrapeBeupResult called. Results are now opened in a new tab.");
  return { error: "This functionality (in-app result display) has been removed. Results are opened in a new tab." };
}
