import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Visit } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

type CreateInviteInput = z.infer<typeof api.visits.invite.input>;
type GateRegisterInput = z.infer<typeof api.visits.gateRegister.input>;
type AcceptInviteInput = z.infer<typeof api.visits.acceptInvite.input>;

export function useVisits() {
  return useQuery({
    queryKey: [api.visits.list.path],
    queryFn: async () => {
      const res = await fetch(api.visits.list.path);
      if (!res.ok) throw new Error("Failed to fetch visits");
      return api.visits.list.responses[200].parse(await res.json());
    },
  });
}

export function useVisit(id: number) {
  return useQuery({
    queryKey: [api.visits.getVisit.path, id],
    queryFn: async () => {
      const url = buildUrl(api.visits.getVisit.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch visit");
      return api.visits.getVisit.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useInviteByToken(token: string) {
  return useQuery({
    queryKey: [api.visits.getInvite.path, token],
    queryFn: async () => {
      const url = buildUrl(api.visits.getInvite.path, { token });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Invite not found or expired");
      return api.visits.getInvite.responses[200].parse(await res.json());
    },
    enabled: !!token,
    retry: false,
  });
}

export function useCreateInvite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateInviteInput) => {
      const res = await fetch(api.visits.invite.path, {
        method: api.visits.invite.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create invite");
      return api.visits.invite.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
      toast({ title: "Invitation Sent", description: "The visitor has been notified." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });
}

export function useGateRegister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: GateRegisterInput) => {
      const res = await fetch(api.visits.gateRegister.path, {
        method: api.visits.gateRegister.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to register");
      return api.visits.gateRegister.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Registration Successful", description: "Please wait for approval." });
    },
  });
}

export function useAcceptInvite(token: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: AcceptInviteInput) => {
      const url = buildUrl(api.visits.acceptInvite.path, { token });
      const res = await fetch(url, {
        method: api.visits.acceptInvite.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to accept invite");
      return api.visits.acceptInvite.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      toast({ title: "Invite Accepted", description: "You are now registered for your visit." });
    },
  });
}

export function useUpdateVisitStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: 'approved' | 'rejected' }) => {
      const url = buildUrl(api.visits.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.visits.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.visits.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
      toast({ 
        title: `Visit ${variables.status === 'approved' ? 'Approved' : 'Rejected'}`,
        description: "The visitor status has been updated." 
      });
    },
  });
}

export function useWatchmanStats() {
  return useQuery({
    queryKey: [api.watchman.stats.path],
    queryFn: async () => {
      const res = await fetch(api.watchman.stats.path);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.watchman.stats.responses[200].parse(await res.json());
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

export function useWatchmanActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkIn = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.watchman.checkIn.path, { id });
      const res = await fetch(url, { method: api.watchman.checkIn.method });
      if (!res.ok) throw new Error("Check-in failed");
      return api.watchman.checkIn.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.watchman.stats.path] });
      toast({ title: "Checked In", description: "Visitor successfully checked in." });
    },
  });

  const checkOut = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.watchman.checkOut.path, { id });
      const res = await fetch(url, { method: api.watchman.checkOut.method });
      if (!res.ok) throw new Error("Check-out failed");
      return api.watchman.checkOut.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.visits.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.watchman.stats.path] });
      toast({ title: "Checked Out", description: "Visitor successfully checked out." });
    },
  });

  return { checkIn, checkOut };
}

export function useEmployees() {
  return useQuery({
    queryKey: [api.employees.list.path],
    queryFn: async () => {
      const res = await fetch(api.employees.list.path);
      if (!res.ok) throw new Error("Failed to fetch employees");
      return api.employees.list.responses[200].parse(await res.json());
    },
  });
}
