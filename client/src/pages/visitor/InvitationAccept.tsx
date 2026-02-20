import { useRoute, Link } from "wouter";
import { useInviteByToken, useAcceptInvite } from "@/hooks/use-visits";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Camera, Calendar, CheckCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect } from "react";
import { format } from "date-fns";
import QRCode from "qrcode.react";

const acceptSchema = z.object({
  visitorName: z.string().min(2),
  visitorPhone: z.string().min(10),
  visitorPhotoUrl: z.string().min(1, "Photo required"),
});

export default function InvitationAccept() {
  const [match, params] = useRoute("/visitor/invitation/:token");
  const token = params?.token || "";
  
  const { data: invite, isLoading, error } = useInviteByToken(token);
  const { mutate: accept, isPending, isSuccess, data: updatedVisit } = useAcceptInvite(token);

  const form = useForm<z.infer<typeof acceptSchema>>({
    resolver: zodResolver(acceptSchema),
    defaultValues: {
      visitorName: "",
      visitorPhone: "",
      visitorPhotoUrl: "",
    },
  });

  // Prefill name if available from invite
  useEffect(() => {
    if (invite) {
      form.setValue("visitorName", invite.visitorName || "");
    }
  }, [invite, form]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      form.setValue("visitorPhotoUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [form]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const photoUrl = form.watch("visitorPhotoUrl");

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (error || !invite) return <div className="min-h-screen flex items-center justify-center text-destructive">Invalid or expired invitation.</div>;

  if (isSuccess && updatedVisit) {
    return (
      <div className="min-h-screen bg-secondary/30 py-12 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full text-center shadow-xl border-t-4 border-t-green-500">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <CardTitle>You're All Set!</CardTitle>
            <CardDescription>Save this QR code for your visit.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white p-6 rounded-xl border inline-block mb-6 shadow-sm">
              <QRCode value={updatedVisit.id.toString()} size={180} />
            </div>
            <div className="bg-secondary/50 p-4 rounded-lg text-left text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Visitor</span>
                <span className="font-medium">{updatedVisit.visitorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(new Date(updatedVisit.visitDate), "PPP p")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize text-green-600">Pre-Approved</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Please present this code at the security desk upon arrival.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30 py-12 px-4">
      <Card className="max-w-lg mx-auto shadow-xl">
        <CardHeader className="text-center border-b pb-8">
          <CardTitle className="text-2xl font-display font-bold">Accept Invitation</CardTitle>
          <CardDescription className="flex items-center justify-center gap-2 mt-2">
            <Calendar className="w-4 h-4" />
            {format(new Date(invite.visitDate), "PPP p")}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => accept(data))} className="space-y-6">
              
              <div className="flex flex-col items-center justify-center mb-6">
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
                      <span className="text-[10px] text-muted-foreground">Add Photo</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Required for security pass</p>
              </div>

              <FormField
                control={form.control}
                name="visitorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input placeholder="+1..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12 text-lg" disabled={isPending}>
                {isPending ? "Confirming..." : "Confirm Attendance"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
