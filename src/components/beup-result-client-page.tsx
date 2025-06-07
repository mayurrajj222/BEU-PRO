
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BeupResultFormSchema, type BeupResultFormValues } from '@/lib/types';
import { fetchStudentResultAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, User, BookOpen, AlertCircle, Info, FileText } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

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

    try {
      const response = await fetchStudentResultAction(data.registrationNumber, data.semester);
      if (response.error) {
        setError(response.error);
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
      } else if (response.url) {
        toast({
          title: "Redirecting...",
          description: "Opening the official results page in a full-screen view.",
        });
        router.push(`/result-viewer?url=${encodeURIComponent(response.url)}`);
      } else {
        setError("Could not generate the result URL.");
         toast({
          variant: "destructive",
          title: "Error",
          description: "Could not generate the result URL.",
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
            Provide your registration number and select the semester to view the official results page in a full-screen mode within this app.
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
                    Loading...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    View Fullscreen Result
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
          <AlertTitle className="font-headline">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {!isLoading && !error && (
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
              <Search size={48} className="text-muted-foreground" />
              <h3 className="font-headline text-xl font-semibold">View Your Results on a Dedicated Page</h3>
              <p className="text-muted-foreground">
                Enter your details to open the official BEUP results page in a full-screen view within the app.
              </p>
               <p className="text-xs text-muted-foreground/80 mt-2">
                Note: The link generated attempts to use the most common result page format. If it doesn't work for your specific course/batch, or if the content doesn't load, you may need to navigate manually on the official BEUP website.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
