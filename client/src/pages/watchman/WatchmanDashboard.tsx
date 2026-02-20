import { Sidebar } from "@/components/Sidebar";
import { useWatchmanStats, useVisits } from "@/hooks/use-visits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserMinus, Activity } from "lucide-react";
import { format } from "date-fns";

export default function WatchmanDashboard() {
  const { data: stats } = useWatchmanStats();
  const { data: visits } = useVisits();

  // Filter only active or completed visits for watchman view
  const activeVisits = visits?.filter(v => v.status === 'active' || v.status === 'completed' || v.status === 'approved').slice(0, 10);

  return (
    <div className="flex bg-background min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-display font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Real-time building occupancy stats.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Total</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayVisits || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Currently Inside</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.currentlyInside || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Checked Out</CardTitle>
              <UserMinus className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.leftOffice || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeVisits?.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {visit.visitorPhotoUrl && (
                          <img src={visit.visitorPhotoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <div>
                          <div>{visit.visitorName}</div>
                          <div className="text-xs text-muted-foreground">Visits {visit.employeeId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {visit.checkInTime ? format(new Date(visit.checkInTime), "p") : "-"}
                    </TableCell>
                    <TableCell>
                      {visit.checkOutTime ? format(new Date(visit.checkOutTime), "p") : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={visit.status === 'active' ? 'default' : 'secondary'}>
                        {visit.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!activeVisits?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No recent activity
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
