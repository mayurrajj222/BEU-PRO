import { z } from "zod";

export const BeupResultFormSchema = z.object({
  registrationNumber: z.string().min(5, "Registration number must be at least 5 characters long.").max(20, "Registration number too long."),
  semester: z.string().min(1, "Please select a semester."),
});

export type BeupResultFormValues = z.infer<typeof BeupResultFormSchema>;

export interface SubjectDetail {
  subjectCode: string;
  subjectName: string;
  internalMarks?: string;
  externalMarks: string;
  totalMarks: string;
  grade: string;
  result?: string; // e.g., P for Pass
}

export interface StudentResult {
  studentName: string;
  rollNumber: string; 
  enrollmentNumber?: string;
  fatherName?: string;
  course?: string;
  branch?: string;
  semester: string;
  instituteName?: string;
  subjects: SubjectDetail[];
  sgpa?: string;
  cgpa?: string;
  overallResult?: string;
  carryOverSubjects?: string[];
  notice?: string;
  retrievedAt: string; 
}

// This type might be returned by the AI flow on error
export interface ScrapeError {
  error: string;
  details?: any;
}
