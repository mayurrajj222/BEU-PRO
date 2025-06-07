'use server';

// StudentResult and ScrapeError types are no longer needed here as we are not processing the result.
// import type { StudentResult, ScrapeError } from '@/lib/types';
// The Genkit flow is no longer used.
// import { scrapeBeupResult } from '@/ai/flows/scrapeBeupResult';

// This constant remains, as it's the best guess for the result page.
// A more robust solution would require a way to determine the correct aspx page for any given exam.
const BEUP_RESULT_PAGE_NAME = 'ResultsBTech4thSem2024_B2022Pub.aspx';
const BEUP_BASE_URL = 'https://results.beup.ac.in';

export async function fetchStudentResultAction(
  registrationNumber: string,
  semester: string
): Promise<{ url: string | null; error: string | null }> {
  if (!registrationNumber || !semester) {
    return { url: null, error: 'Registration number and semester are required.' };
  }

  try {
    // Construct the URL directly.
    // The semester from input might be Roman numerals (I, II, IV) or numeric.
    // The BEUP URL seems to expect Roman numerals for the Sem parameter.
    // We'll assume the input 'semester' is already in the correct format (e.g., "IV").
    const resultUrl = `${BEUP_BASE_URL}/${BEUP_RESULT_PAGE_NAME}?Sem=${semester}&RegNo=${registrationNumber}`;

    return { url: resultUrl, error: null };

  } catch (e) {
    console.error('Error in fetchStudentResultAction (URL generation):', e);
    let errorMessage = 'An unexpected error occurred while preparing the result link.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return { url: null, error: errorMessage };
  }
}
