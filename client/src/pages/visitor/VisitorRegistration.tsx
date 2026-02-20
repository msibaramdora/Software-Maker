import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEmployees, useGateRegister } from "@/hooks/use-visits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { useCallback, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { Link } from "wouter";

const registerSchema = z.object({
  employeeId: z.coerce.number().min(1, "Please select an employee"),
  visitorName: z.string().min(2, "Name required"),
  visitorEmail: z.string().email("Valid email required"),
  visitorPhone: z.string().min(10, "Valid phone number required"),
  visitDate: z.string().min(1, "Date required"),
  purpose: z.string().min(3, "Purpose required"),
  visitorPhotoUrl: z.string().min(1, "Photo required"),
});

export default function VisitorRegistration() {
  const { data: employees } = useEmployees();
  const { mutate: register, isPending } = useGateRegister();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      visitorName: "",
      visitorEmail: "",
      visitorPhone: "",
      visitDate: "",
      purpose: "",
      visitorPhotoUrl: "",
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      form.setValue("visitorPhotoUrl", base64);
    };
    reader.readAsDataURL(file);
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const photoUrl = form.watch("visitorPhotoUrl");

  function onSubmit(data: z.infer<typeof registerSchema>) {
    register(data, {
      onSuccess: () => setSubmitted(true)
    });
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold font-display mb-2">Registration Complete!</h2>
          <p className="text-muted-foreground mb-6">
            Your host has been notified. Please wait for the security team to issue your pass.
          </p>
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 py-12 px-4">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center border-b bg-primary/5 pb-8">
          <CardTitle className="text-3xl font-display font-bold text-primary">Self Registration</CardTitle>
          <CardDescription>Welcome! Please fill in your details to check in.</CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Photo Upload */}
              <div className="flex flex-col items-center justify-center mb-8">
                <div 
                  {...getRootProps()} 
                  className={`
                    w-32 h-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden relative
                    ${isDragActive ? 'border-primary bg-primary/10' : 'border-border bg-secondary'}
                  `}
                >
                  <input {...getInputProps()} />
                  {photoUrl ? (
                    <img src={photoUrl} alt="Visitor" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2">
                      <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground">Tap to take photo</span>
                    </div>
                  )}
                </div>
                {form.formState.errors.visitorPhotoUrl && (
                  <p className="text-sm text-destructive mt-2">Photo is required</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visitorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visitorPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl><Input placeholder="+1 234 567 890" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="visitorEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input placeholder="jane@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="visitDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visit Date & Time</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Who are you visiting?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees?.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id.toString()}>
                            {emp.name} ({emp.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Visit</FormLabel>
                    <FormControl>
                      <Textarea className="resize-none" placeholder="Briefly describe the purpose..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
                {isPending ? "Submitting..." : "Check In"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
