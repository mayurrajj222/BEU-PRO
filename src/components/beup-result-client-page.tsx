'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BeupResultFormSchema, type BeupResultFormValues, type StudentResult } from '@/lib/types';
import { fetchStudentResultAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, User, BookOpen, AlertCircle, CheckCircle, Info, BarChart3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const semesters = [
  { value: "I", label: "Semester I" },
  { value: "II", label: "Semester II" },
  { value: "III", label: "Semester III" },
  { value: "IV", label: "Semester IV" },
  { value: "V", label: "Semester V" },
  { value: "VI", label: "Semester VI" },
  { value: "VII", label: "Semester VII" },
  { value: "VIII", label: "Semester VIII" },
];

export function BeupResultClientPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<StudentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<BeupResultFormValues>({
    resolver: zodResolver(BeupResultFormSchema),
    defaultValues: {
      registrationNumber: '',
      semester: '',
    },
  });

  const onSubmit: SubmitHandler<BeupResultFormValues> = async (data) => {
    setIsLoading(true);
    setError(null);
    setResultData(null);

    try {
      const response = await fetchStudentResultAction(data.registrationNumber, data.semester);
      if (response.error) {
        setError(response.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
      } else if (response.data) {
        setResultData(response.data);
        toast({
          title: "Success",
          description: "Results fetched successfully.",
        });
      } else {
        setError("No data received from the server.");
         toast({
          variant: "destructive",
          title: "Error",
          description: "No data received from the server.",
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Request Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Info size={28} className="text-primary" />
            Enter Your Details
          </CardTitle>
          <CardDescription>
            Provide your registration number and select the semester to fetch results.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><User size={16} />Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 22102107005" {...field} className="text-base"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><BookOpen size={16} />Semester</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {semesters.map((sem) => (
                          <SelectItem key={sem.value} value={sem.value} className="text-base">
                            {sem.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full text-base py-6">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Get Result
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {error && (
         <Alert variant="destructive" className="shadow-md">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="font-headline">Error Fetching Results</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resultData && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2">
              <BarChart3 size={28} className="text-primary" />
              Student Result
            </CardTitle>
            <CardDescription>
              Result for {resultData.studentName} - Semester {resultData.semester}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <p><strong>Student Name:</strong> {resultData.studentName}</p>
              <p><strong>Roll Number:</strong> {resultData.rollNumber}</p>
              {resultData.enrollmentNumber && <p><strong>Enrollment No:</strong> {resultData.enrollmentNumber}</p>}
              {resultData.fatherName && <p><strong>Father's Name:</strong> {resultData.fatherName}</p>}
              {resultData.course && <p><strong>Course:</strong> {resultData.course}</p>}
              {resultData.branch && <p><strong>Branch:</strong> {resultData.branch}</p>}
              {resultData.instituteName && <p><strong>Institute:</strong> {resultData.instituteName}</p>}
              <p><strong>Semester:</strong> {resultData.semester}</p>
            </div>
            
            <h3 className="font-headline text-lg font-semibold mt-6 mb-2">Subject Details:</h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Subject Name</TableHead>
                    {resultData.subjects.some(s => s.internalMarks) && <TableHead className="text-center">Internal</TableHead>}
                    <TableHead className="text-center">External</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                    <TableHead className="text-center">Grade</TableHead>
                    {resultData.subjects.some(s => s.result) && <TableHead className="text-center">Result</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultData.subjects.map((subject, index) => (
                    <TableRow key={index}>
                      <TableCell>{subject.subjectCode}</TableCell>
                      <TableCell className="font-medium">{subject.subjectName}</TableCell>
                      {resultData.subjects.some(s => s.internalMarks) && <TableCell className="text-center">{subject.internalMarks || '-'}</TableCell>}
                      <TableCell className="text-center">{subject.externalMarks}</TableCell>
                      <TableCell className="text-center">{subject.totalMarks}</TableCell>
                      <TableCell className="text-center">{subject.grade}</TableCell>
                      {resultData.subjects.some(s => s.result) && <TableCell className="text-center">{subject.result || '-'}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-base">
              {resultData.sgpa && <p className="font-semibold"><strong>SGPA:</strong> {resultData.sgpa}</p>}
              {resultData.cgpa && <p className="font-semibold"><strong>CGPA:</strong> {resultData.cgpa}</p>}
            </div>

            {resultData.overallResult && (
              <Alert className={`mt-4 ${resultData.overallResult.toLowerCase().includes('pass') ? 'border-green-500' : 'border-red-500'}`}>
                {resultData.overallResult.toLowerCase().includes('pass') ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                <AlertTitle className={`font-headline ${resultData.overallResult.toLowerCase().includes('pass') ? 'text-green-700' : 'text-red-700'}`}>Overall Result</AlertTitle>
                <AlertDescription className="font-semibold text-lg">
                  {resultData.overallResult}
                </AlertDescription>
              </Alert>
            )}

            {resultData.carryOverSubjects && resultData.carryOverSubjects.length > 0 && (
              <div className="mt-4">
                <h4 className="font-headline text-md font-semibold text-destructive">Carry Over Subjects:</h4>
                <ul className="list-disc list-inside text-destructive">
                  {resultData.carryOverSubjects.map((co, idx) => <li key={idx}>{co}</li>)}
                </ul>
              </div>
            )}

            {resultData.notice && (
              <Alert variant="default" className="mt-4">
                <Info className="h-5 w-5" />
                <AlertTitle className="font-headline">Notice</AlertTitle>
                <AlertDescription>{resultData.notice}</AlertDescription>
              </Alert>
            )}
             <p className="text-xs text-muted-foreground mt-4">
              Result retrieved on: {new Date(resultData.retrievedAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}
       {!isLoading && !resultData && !error && (
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
              <Search size={48} className="text-muted-foreground" />
              <h3 className="font-headline text-xl font-semibold">View Your Results</h3>
              <p className="text-muted-foreground">
                Enter your registration number and select a semester to begin.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
