import { z } from "zod";

export const BeupResultFormSchema = z.object({
  registrationNumber: z.string().min(5, "Registration number must be at least 5 characters long.").max(20, "Registration number too long."),
  semester: z.string().min(1, "Please select a semester."),
});

export type BeupResultFormValues = z.infer<typeof BeupResultFormSchema>;

// The following schemas are no longer actively used by the application
// as results are opened directly on the official website, not parsed and displayed in-app.
// They are kept here for potential future reference or if functionality is reinstated.

export const SubjectDetailSchema = z.object({
  subjectCode: z.string(),
  subjectName: z.string(),
  internalMarks: z.string().optional(),
  externalMarks: z.string(),
  totalMarks: z.string(),
  grade: z.string(),
  result: z.string().optional(), // e.g., P for Pass
});
export type SubjectDetail = z.infer<typeof SubjectDetailSchema>;

export const StudentResultSchema = z.object({
  studentName: z.string(),
  rollNumber: z.string(),
  enrollmentNumber: z.string().optional(),
  fatherName: z.string().optional(),
  course: z.string().optional(),
  branch: z.string().optional(),
  semester: z.string(),
  instituteName: z.string().optional(),
  subjects: z.array(SubjectDetailSchema),
  sgpa: z.string().optional(),
  cgpa: z.string().optional(),
  overallResult: z.string().optional(),
  carryOverSubjects: z.array(z.string()).optional(),
  notice: z.string().optional(),
  retrievedAt: z.string(), // ISO date string
});
export type StudentResult = z.infer<typeof StudentResultSchema>;

export const ScrapeErrorSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});
export type ScrapeError = z.infer<typeof ScrapeErrorSchema>;
