import { Sidebar } from "@/components/Sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInvite } from "@/hooks/use-visits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const inviteSchema = z.object({
  visitorName: z.string().min(2, "Name is required"),
  visitorEmail: z.string().email("Valid email required"),
  visitDate: z.string().min(1, "Date is required"),
  purpose: z.string().min(3, "Purpose is required"),
});

export default function SendInvitation() {
  const { mutate: createInvite, isPending } = useCreateInvite();

  const form = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      visitorName: "",
      visitorEmail: "",
      visitDate: "",
      purpose: "",
    },
  });

  function onSubmit(data: z.infer<typeof inviteSchema>) {
    createInvite(data, {
      onSuccess: () => form.reset()
    });
  }

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Send Invitation</h1>
            <p className="text-muted-foreground">Pre-register a guest for a seamless entry experience.</p>
          </header>

          <Card className="shadow-lg border-border">
            <CardHeader>
              <CardTitle>Guest Details</CardTitle>
              <CardDescription>We'll send them an email with a QR code pass.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="visitorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Visitor Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="visitorEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="visitDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
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
                          <Textarea placeholder="Meeting regarding Q4 Marketing Plan" className="resize-none h-24" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "Sending Invitation..." : "Send Invitation"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
