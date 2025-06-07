'use server';
/**
 * @fileOverview This file previously contained a Genkit tool to fetch and parse student results.
 * It is no longer used as the application now opens results directly on the official website.
 */

// import { ai } from '@/ai/genkit';
// import { z } from 'genkit';
// import type { StudentResult, ScrapeError, SubjectDetail } from '@/lib/types';
// import { StudentResultSchema, ScrapeErrorSchema, SubjectDetailSchema } from '@/lib/types';

// const FetchBeupPageInputSchema = z.object({
//   registrationNumber: z.string().describe("The student's registration number."),
//   semester: z.string().describe("The semester for which results are requested (e.g., IV)."),
// });
// type FetchBeupPageInput = z.infer<typeof FetchBeupPageInputSchema>;


// function extractSpanTextById(html: string, idSuffix: string, controlPrefix: string = 'ctl00_ContentPlaceHolder1_'): string | undefined {
//   const regex = new RegExp(`<span id="${controlPrefix}${idSuffix}">([^<]+)</span>`, 'i');
//   const match = html.match(regex);
//   return match?.[1]?.trim();
// }

// function parseSubjectsTable(html: string): SubjectDetail[] {
//   const subjects: SubjectDetail[] = [];
//   // ... (parsing logic removed for brevity as it's unused)
//   return subjects;
// }


// export const fetchBeupPageTool = ai.defineTool(
//   {
//     name: 'fetchBeupPageTool',
//     description: 'DEPRECATED: Fetches and parses student academic results from the official BEUP website.',
//     inputSchema: FetchBeupPageInputSchema,
//     outputSchema: z.union([StudentResultSchema, ScrapeErrorSchema]),
//   },
//   async (input: FetchBeupPageInput): Promise<StudentResult | ScrapeError> => {
//     console.warn("DEPRECATED: fetchBeupPageTool called.");
//     return { 
//       error: "This tool is deprecated. Results are now opened directly on the official website." 
//     };
//     // ... (actual fetching and parsing logic removed for brevity)
//   }
// );

// Placeholder export if still imported elsewhere, or remove imports.
export const fetchBeupPageTool = async (input: any): Promise<any> => {
  console.warn("DEPRECATED: fetchBeupPageTool called.");
  return { error: "This tool (fetchBeupPageTool) is deprecated." };
};
