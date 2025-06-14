
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
    default: return romanSemester; // Fallback
  }
}

function romanToInteger(roman: string): number {
  const map: { [key: string]: number } = {
    I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
  };
  let result = 0;
  const upperRoman = roman.toUpperCase();
  for (let i = 0; i < upperRoman.length; i++) {
    const current = map[upperRoman[i]];
    const next = map[upperRoman[i + 1]];
    if (current === undefined) return NaN; // Invalid Roman numeral character

    if (next && current < next) {
      result -= current;
    } else {
      result += current;
    }
  }
  return result;
}

export async function fetchStudentResultAction(
  registrationNumber: string,
  semester: string // Roman numeral, e.g., "IV", "VII"
): Promise<{ 
  url: string | null; 
  error: string | null; 
  basePath?: string; 
  semesterForQuery?: string; 
  initialRegNo?: string; 
}> {
  if (!registrationNumber || !semester) {
    return { url: null, error: 'Registration number and semester are required.' };
  }

  if (registrationNumber.length < 2) {
    return { url: null, error: 'Registration number is too short to determine batch year.'};
  }

  try {
    const batchYearPrefix = registrationNumber.substring(0, 2);
    const batchStartYearNumber = parseInt(`20${batchYearPrefix}`); 

    if (isNaN(batchStartYearNumber)) {
        return { url: null, error: 'Invalid registration number format for batch year.' };
    }

    const semesterNumber = romanToInteger(semester);
    if (isNaN(semesterNumber) || semesterNumber < 1 || semesterNumber > 8) {
      return { url: null, error: 'Invalid semester provided. Please use I, II, ..., VIII.' };
    }

    const academicYearIndex = Math.floor((semesterNumber - 1) / 2);
    let calculatedExamYear: number;

    if (semesterNumber % 2 !== 0) { 
      calculatedExamYear = batchStartYearNumber + academicYearIndex;
    } else { 
      calculatedExamYear = batchStartYearNumber + academicYearIndex + 1;
    }
    
    const semesterOrdinal = getSemesterOrdinal(semester);
    const examYearString = calculatedExamYear.toString();
    const batchYearForFile = batchStartYearNumber.toString();

    const resultPageName = `ResultsBTech${semesterOrdinal}Sem${examYearString}_B${batchYearForFile}Pub.aspx`;
    const fullResultPagePath = `${BEUP_BASE_URL}/${resultPageName}`;
    const resultUrl = `${fullResultPagePath}?Sem=${semester.toUpperCase()}&RegNo=${registrationNumber}`;

    return { 
      url: resultUrl, 
      error: null,
      basePath: fullResultPagePath,
      semesterForQuery: semester.toUpperCase(),
      initialRegNo: registrationNumber
    };

  } catch (e) {
    console.error('Error in fetchStudentResultAction (URL generation):', e);
    let errorMessage = 'An unexpected error occurred while preparing the result link.';
    if (e instanceof Error) {
      errorMessage = e.message;
    }
    return { url: null, error: errorMessage };
  }
}

