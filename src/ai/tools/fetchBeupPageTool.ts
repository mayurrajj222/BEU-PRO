'use server';
/**
 * @fileOverview A Genkit tool to fetch and parse student results from the BEUP website.
 *
 * - fetchBeupPageTool - The tool that performs the scraping.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { StudentResult, ScrapeError, SubjectDetail } from '@/lib/types';
import { StudentResultSchema, ScrapeErrorSchema, SubjectDetailSchema } from '@/lib/types';

const FetchBeupPageInputSchema = z.object({
  registrationNumber: z.string().describe("The student's registration number."),
  semester: z.string().describe("The semester for which results are requested (e.g., IV)."),
});
type FetchBeupPageInput = z.infer<typeof FetchBeupPageInputSchema>;

// Helper to extract text from a span with a specific ID
// Example: <span id="ctl00_ContentPlaceHolder1_lblname">STUDENT NAME</span>
function extractSpanTextById(html: string, idSuffix: string, controlPrefix: string = 'ctl00_ContentPlaceHolder1_'): string | undefined {
  const regex = new RegExp(`<span id="${controlPrefix}${idSuffix}">([^<]+)</span>`, 'i');
  const match = html.match(regex);
  return match?.[1]?.trim();
}

// Simplified parser for the subjects table
function parseSubjectsTable(html: string): SubjectDetail[] {
  const subjects: SubjectDetail[] = [];
  const tableRegex = /<table[^>]+id="ctl00_ContentPlaceHolder1_grdView"[^>]*>([\s\S]*?)<\/table>/i;
  const tableMatch = html.match(tableRegex);

  if (!tableMatch || !tableMatch[1]) {
    return subjects;
  }

  const tableHtml = tableMatch[1];
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  // Skip header row by starting loop after first match if present
  // A more robust parser would look for <th> vs <td>
  let isFirstRow = true; 

  while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
    if (isFirstRow) { // Basic skip for header, assumes first <tr> is header
        // A more robust check would be to see if cells are <th>
        if (rowMatch[1].toLowerCase().includes("<th")) {
             isFirstRow = false;
             continue;
        }
        isFirstRow = false; // If not <th>, assume it's data or header without <th>
    }


    const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let cellMatch;
    while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
      // Strip HTML tags from cell content and trim
      cells.push(cellMatch[1].replace(/<[^>]*>/g, '').trim());
    }

    // Expected columns: Sno, Subject Code, Subject Name, Internal, External, Total, Grade, Result
    // The number of columns can vary (e.g. if Internal Marks are not present)
    // This is a very simplified mapping
    if (cells.length >= 7) { // Minimum expected columns
      try {
        subjects.push(SubjectDetailSchema.parse({
          subjectCode: cells[1] || '', // Sno is at 0
          subjectName: cells[2] || '',
          // internalMarks might not always be there or be in a different position.
          // This heuristic tries to guess based on column count. A real scraper needs to be more robust.
          internalMarks: cells.length === 8 ? (cells[3] || '-') : (cells.length > 7 && !isNaN(parseFloat(cells[3])) ? cells[3] : '-'), // Heuristic
          externalMarks: cells.length === 8 ? (cells[4] || '') : (cells[3] || ''),
          totalMarks: cells.length === 8 ? (cells[5] || '') : (cells[4] || ''),
          grade: cells.length === 8 ? (cells[6] || '') : (cells[5] || ''),
          result: cells.length === 8 ? (cells[7] || 'P') : (cells[6] || 'P'), // Default to 'P' if empty
        }));
      } catch (parseError) {
        console.warn("Skipping subject row due to parsing error:", parseError, cells);
      }
    }
  }
  return subjects;
}


export const fetchBeupPageTool = ai.defineTool(
  {
    name: 'fetchBeupPageTool',
    description: 'Fetches and parses student academic results from the official BEUP website for a specific type of result page.',
    inputSchema: FetchBeupPageInputSchema,
    outputSchema: z.union([StudentResultSchema, ScrapeErrorSchema]),
  },
  async (input: FetchBeupPageInput): Promise<StudentResult | ScrapeError> => {
    // IMPORTANT: This URL is specific to B.Tech 4th Sem results for a particular publication batch.
    // A more generic solution would require discovering the correct .aspx page.
    const resultPageName = 'ResultsBTech4thSem2024_B2022Pub.aspx'; // This is the main point of fragility
    const url = `https://results.beup.ac.in/${resultPageName}?Sem=${input.semester}&RegNo=${input.registrationNumber}`;

    try {
      const response = await fetch(url, {
         headers: {
          // Mimic browser headers to reduce chance of being blocked
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });

      if (!response.ok) {
        return ScrapeErrorSchema.parse({
          error: `Failed to fetch results page. Status: ${response.status}`,
          details: `URL: ${url}`,
        });
      }

      const html = await response.text();

      // Check for common error messages on the page
      if (html.includes("Either Registration Number is incorrect or Result is not declared yet") || html.includes("Result Not Declared Yet")) {
        return ScrapeErrorSchema.parse({ error: "Result not found. Either the registration number is incorrect, or the result has not been declared yet." });
      }
       if (html.includes("RESULT WILL BE DECLARED SOON OR RESULT IS WITHHELD")) {
        return ScrapeErrorSchema.parse({ error: "Results for this registration number are currently withheld or will be declared soon." });
      }


      const studentName = extractSpanTextById(html, 'lblname');
      const rollNumber = extractSpanTextById(html, 'lblrollno');
      
      if (!studentName || !rollNumber) {
         // A basic check to see if essential fields are missing, indicating an unexpected page structure or error
        if (html.includes("<title>Object moved</title>") || html.includes("The resource cannot be found")) {
             return ScrapeErrorSchema.parse({ error: "The specific result page was not found. The URL might be incorrect or outdated for the selected semester/exam." });
        }
        return ScrapeErrorSchema.parse({ error: "Failed to parse essential student details from the page. The website structure might have changed or the result is not available in the expected format." });
      }
      
      const subjects = parseSubjectsTable(html);
      if (subjects.length === 0 && !html.includes("No Record Found")) { // If no subjects parsed and no explicit "no record" message
         // This could mean the table parsing failed or the table is empty for other reasons
         console.warn(`No subjects parsed for ${input.registrationNumber}, Sem ${input.semester}. HTML might be unexpected.`);
      }


      const resultData: StudentResult = {
        studentName: studentName || 'N/A',
        rollNumber: rollNumber || input.registrationNumber,
        enrollmentNumber: extractSpanTextById(html, 'lblenroll'),
        fatherName: extractSpanTextById(html, 'lblfname'),
        course: extractSpanTextById(html, 'lblcourse'), // Might be "B.Tech"
        branch: extractSpanTextById(html, 'lblbranch'), // e.g. "COMPUTER SCIENCE AND ENGINEERING"
        semester: extractSpanTextById(html, 'lblsem') || input.semester,
        instituteName: extractSpanTextById(html, 'lblinstitue'),
        subjects: subjects,
        sgpa: extractSpanTextById(html, 'lblsgpa'),
        cgpa: extractSpanTextById(html, 'lblcgpa'),
        overallResult: extractSpanTextById(html, 'lblresult'),
        // carryOverSubjects and notice would require more specific parsing logic
        retrievedAt: new Date().toISOString(),
      };
      
      return StudentResultSchema.parse(resultData);

    } catch (e: any) {
      console.error('Error in fetchBeupPageTool:', e);
      return ScrapeErrorSchema.parse({
        error: 'An unexpected error occurred while trying to fetch or parse results.',
        details: e.message,
      });
    }
  }
);
