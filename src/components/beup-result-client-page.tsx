
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Search, User, BookOpen, AlertCircle, Info, FileText, Mail, School, Code2 } from 'lucide-react';
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
      } else if (response.url && response.basePath && response.semesterForQuery && response.initialRegNo) {
        toast({
          title: "Redirecting...",
          description: "Opening the official results page in a full-screen view.",
        });
        const queryParams = new URLSearchParams({
          url: response.url, // Keep full initial URL for potential direct use or fallback
          basePath: response.basePath,
          semester: response.semesterForQuery,
          regNo: response.initialRegNo,
        });
        router.push(`/result-viewer?${queryParams.toString()}`);
      } else {
        setError("Could not generate the result URL or missing necessary parameters.");
         toast({
          variant: "destructive",
          title: "Error",
          description: "Could not generate the result URL or missing parameters.",
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
      <Card className="shadow-lg border-border">
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2 text-primary">
            <Info size={28} />
            Enter Your Details
          </CardTitle>
          <CardDescription className="text-muted-foreground/90">
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
                    <FormLabel className="flex items-center gap-2 text-foreground/90"><User size={16} />Registration Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Registration Number" {...field} className="text-base"/>
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
                    <FormLabel className="flex items-center gap-2 text-foreground/90"><BookOpen size={16} />Semester</FormLabel>
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
        <Card className="shadow-lg border-border">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-8 space-y-3">
              <Search size={48} className="text-muted-foreground" />
              <h3 className="font-headline text-xl font-semibold text-foreground/90">View Your Results on a Dedicated Page</h3>
              <p className="text-muted-foreground">
                Enter your details to open the official BEUP results page in a full-screen view within the app.
              </p>
               <p className="text-xs text-muted-foreground/80 mt-2">
                Note: The link generated attempts to dynamically determine the correct result page based on your input. However, due to variations in how official results are published, this link may not always work. If it doesn't, or if the content doesn't load, you may need to navigate manually on the official BEUP website.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full text-base py-3">
            <Code2 className="mr-2 h-5 w-5" />
            About Developer
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary font-headline text-xl">
              <Code2 size={26} />
              About the Developer
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4 text-foreground/90">
            <div className="flex items-center gap-3">
              <User size={20} className="text-primary/80"/>
              <span>Mayur - BMRE</span>
            </div>
            <div className="flex items-center gap-3">
              <School size={20} className="text-primary/80"/>
              <span>College: MIT Muzaffarpur</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-primary/80"/>
              <a href="mailto:mayurrajj222@gmail.com" className="hover:underline text-primary">
                mayurrajj222@gmail.com
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
