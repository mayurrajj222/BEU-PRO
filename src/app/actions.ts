
'use server';

const BEUP_BASE_URL = 'https://results.beup.ac.in';

function getSemesterOrdinal(romanSemester: string): string {
  switch (romanSemester.toUpperCase()) {
    case 'I': return '1st';
    case 'II': return '2nd';
    case 'III': return '3rd';
    case 'IV': return '4th';
    case 'V': return '5th';
    case 'VI': return '6th';
    case 'VII': return '7th';
    case 'VIII': return '8th';
    default: return romanSemester; // Fallback, should ideally not happen with form validation
  }
}

export async function fetchStudentResultAction(
  registrationNumber: string,
  semester: string // Roman numeral, e.g., "IV", "VII"
): Promise<{ url: string | null; error: string | null }> {
  if (!registrationNumber || !semester) {
    return { url: null, error: 'Registration number and semester are required.' };
  }

  if (registrationNumber.length < 2) {
    return { url: null, error: 'Registration number is too short to determine batch year.'}
  }

  try {
    const batchYearPrefix = registrationNumber.substring(0, 2);
    const batchYear = `20${batchYearPrefix}`; // Assuming 21st century, e.g., "21" -> "2021"
    
    const semesterOrdinal = getSemesterOrdinal(semester);
    const currentYear = new Date().getFullYear().toString();

    // Heuristic for page name: ResultsBTech<SemesterOrdinal>Sem<CurrentYear>_B<BatchYear>Pub.aspx
    // Example: ResultsBTech4thSem2024_B2022Pub.aspx
    // Example: ResultsBTech7thSem2024_B2021Pub.aspx
    // This is a best-effort guess and might not cover all URL patterns used by BEUP.
    const resultPageName = `ResultsBTech${semesterOrdinal}Sem${currentYear}_B${batchYear}Pub.aspx`;

    const resultUrl = `${BEUP_BASE_URL}/${resultPageName}?Sem=${semester.toUpperCase()}&RegNo=${registrationNumber}`;

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
