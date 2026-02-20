import { Sidebar } from "@/components/Sidebar";
import { useVisit, useWatchmanActions } from "@/hooks/use-visits";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, LogIn, LogOut, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export default function VisitorDetailsPage() {
  const [match, params] = useRoute("/watchman/visitor/:id");
  const id = params ? parseInt(params.id) : 0;
  
  const { data: visit, isLoading } = useVisit(id);
  const { checkIn, checkOut } = useWatchmanActions();

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!visit) return <div className="flex h-screen items-center justify-center">Visitor not found</div>;

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full shadow-xl border-border">
          <CardHeader className="border-b bg-secondary/20 pb-8 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-background shadow-lg overflow-hidden mb-4">
              <img 
                src={visit.visitorPhotoUrl || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=400&h=400&fit=crop"} // Default placeholder if none
                alt={visit.visitorName || "Visitor"} 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold font-display">{visit.visitorName}</h1>
            <p className="text-muted-foreground">{visit.visitorEmail}</p>
            <div className="mt-4">
              <Badge variant="outline" className="text-lg px-4 py-1 capitalize">
                Status: {visit.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Purpose</p>
                <p className="text-lg font-medium">{visit.purpose}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Host Employee ID</p>
                <p className="text-lg font-medium">#{visit.employeeId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Scheduled Date</p>
                <p className="text-lg font-medium">{format(new Date(visit.visitDate), "PPP")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Phone</p>
                <p className="text-lg font-medium">{visit.visitorPhone || "N/A"}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t">
              {visit.status === 'approved' && (
                <Button 
                  className="w-full h-14 text-lg bg-green-600 hover:bg-green-700" 
                  onClick={() => checkIn.mutate(id)}
                  disabled={checkIn.isPending}
                >
                  <LogIn className="mr-2 w-5 h-5" />
                  Check In Visitor
                </Button>
              )}
              
              {visit.status === 'active' && (
                <Button 
                  className="w-full h-14 text-lg bg-orange-600 hover:bg-orange-700"
                  onClick={() => checkOut.mutate(id)}
                  disabled={checkOut.isPending}
                >
                  <LogOut className="mr-2 w-5 h-5" />
                  Check Out Visitor
                </Button>
              )}

              {visit.status !== 'approved' && visit.status !== 'active' && (
                <div className="w-full p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-center justify-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">No actions available for status: {visit.status}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
