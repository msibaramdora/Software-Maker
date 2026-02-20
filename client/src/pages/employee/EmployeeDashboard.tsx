import { useVisits, useUpdateVisitStatus } from "@/hooks/use-visits";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  CalendarCheck,
  Building2 
} from "lucide-react";
import { format } from "date-fns";

export default function EmployeeDashboard() {
  const { data: visits, isLoading } = useVisits();
  const { mutate: updateStatus } = useUpdateVisitStatus();

  const stats = {
    total: visits?.length || 0,
    pending: visits?.filter(v => v.status === 'pending' || v.status === 'invited').length || 0,
    approved: visits?.filter(v => v.status === 'approved').length || 0,
    inside: visits?.filter(v => v.status === 'active').length || 0,
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
      invited: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      approved: "bg-green-100 text-green-700 hover:bg-green-200",
      rejected: "bg-red-100 text-red-700 hover:bg-red-200",
      active: "bg-purple-100 text-purple-700 hover:bg-purple-200",
      completed: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    };
    return <Badge className={styles[status] || ""} variant="secondary">{status}</Badge>;
  };

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your visitor activity</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Visits", value: stats.total, icon: Users, color: "text-blue-500" },
            { label: "Pending Actions", value: stats.pending, icon: Clock, color: "text-yellow-500" },
            { label: "Approved", value: stats.approved, icon: CalendarCheck, color: "text-green-500" },
            { label: "Currently Inside", value: stats.inside, icon: Building2, color: "text-purple-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 shadow-sm flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-card border shadow-inner ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Visits Table */}
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">Recent Visitor Requests</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor Name</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading visits...</TableCell>
                  </TableRow>
                ) : visits?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No visits found</TableCell>
                  </TableRow>
                ) : (
                  visits?.map((visit) => (
                    <TableRow key={visit.id}>
                      <TableCell className="font-medium">
                        <div>{visit.visitorName || "Pending Registration"}</div>
                        <div className="text-xs text-muted-foreground">{visit.visitorEmail}</div>
                      </TableCell>
                      <TableCell>{format(new Date(visit.visitDate), "PPP p")}</TableCell>
                      <TableCell>{visit.purpose}</TableCell>
                      <TableCell>{getStatusBadge(visit.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {visit.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                              onClick={() => updateStatus({ id: visit.id, status: 'approved' })}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => updateStatus({ id: visit.id, status: 'rejected' })}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {visit.status === 'invited' && (
                          <span className="text-sm text-muted-foreground italic">Awaiting acceptance</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}
