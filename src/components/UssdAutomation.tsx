import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Zap, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type UssdType = "ACTIVATION" | "CHECK" | "TOPUP";
type Operator = "INWI" | "ORANGE" | "IAM";

interface Sim {
  id: string;
  device_id: string;
  phone_number: string;
  carrier: Operator;
  used_today: number;
  daily_quota: number;
  device_name?: string;
}

interface Device {
  id: string;
  name: string;
}

interface UssdCommand {
  id: number;
  code: string;
  type: UssdType;
  operator: Operator;
  device_id: string;
  sim_id: string;
  status: "pending" | "executing" | "success" | "failed" | "quota_exceeded";
  auto_executed: boolean;
  result: string | null;
  executed_at: string | null;
  created_at: string;
}

export const UssdAutomation = () => {
  const queryClient = useQueryClient();
  const [command, setCommand] = useState({
    code: "",
    type: "ACTIVATION" as UssdType,
    operator: "INWI" as Operator,
    device_id: "",
    sim_id: "",
  });
  const [autoExecutionEnabled, setAutoExecutionEnabled] = useState(true);

  // Fetch devices
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('id, name');
      if (error) throw error;
      return data as Device[];
    }
  });

  // Fetch SIMs with device info
  const { data: sims = [] } = useQuery({
    queryKey: ['sims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sims')
        .select(`
          *,
          devices!inner(name)
        `);
      if (error) throw error;
      return data.map(sim => ({
        ...sim,
        carrier: sim.carrier as Operator,
        device_name: sim.devices.name
      })) as Sim[];
    },
    refetchInterval: 3000 // Refetch every 3 seconds
  });

  // Fetch commands ordered by ID ASC
  const { data: commands = [] } = useQuery({
    queryKey: ['ussd_commands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ussd_commands')
        .select('*')
        .order('id', { ascending: true });
      if (error) throw error;
      return data.map(cmd => ({
        ...cmd,
        type: cmd.type as UssdType,
        operator: cmd.operator as Operator,
        status: cmd.status as UssdCommand['status']
      })) as UssdCommand[];
    },
    refetchInterval: 2000 // Refetch every 2 seconds
  });

  // Add command mutation
  const addCommandMutation = useMutation({
    mutationFn: async (commandData: any) => {
      const { data, error } = await supabase
        .from('ussd_commands')
        .insert([commandData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ussd_commands'] });
      toast.success("Command added to queue");
    },
    onError: (error: any) => {
      toast.error(`Failed to add command: ${error.message}`);
    }
  });

  // Execute command mutation
  const executeCommandMutation = useMutation({
    mutationFn: async ({ commandId, isAuto }: { commandId: number; isAuto: boolean }) => {
      // Update to executing
      await supabase
        .from('ussd_commands')
        .update({ 
          status: 'executing',
          auto_executed: isAuto
        })
        .eq('id', commandId);

      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get command and sim details
      const { data: cmd } = await supabase
        .from('ussd_commands')
        .select('*, sims(*)')
        .eq('id', commandId)
        .single();

      if (!cmd) throw new Error('Command not found');

      // Update command to success
      await supabase
        .from('ussd_commands')
        .update({ 
          status: 'success',
          executed_at: new Date().toISOString(),
          result: `Successfully executed ${cmd.code}`
        })
        .eq('id', commandId);

      // Increment SIM usage
      await supabase
        .from('sims')
        .update({ used_today: (cmd.sims.used_today || 0) + 1 })
        .eq('id', cmd.sim_id);

      return cmd;
    },
    onSuccess: (cmd) => {
      queryClient.invalidateQueries({ queryKey: ['ussd_commands'] });
      queryClient.invalidateQueries({ queryKey: ['sims'] });
      toast.success(`${cmd.type} ${cmd.code} executed successfully`);
    },
    onError: (error: any) => {
      toast.error(`Execution failed: ${error.message}`);
    }
  });

  // Auto-execute pending commands
  useEffect(() => {
    if (!autoExecutionEnabled || !sims.length || !commands.length) return;

    const autoExecute = async () => {
      // Get first pending command (ordered by ID ASC)
      const pendingCmd = commands.find(cmd => cmd.status === 'pending');
      if (!pendingCmd) return;

      // Find matching SIM
      const matchingSim = sims.find(
        sim => 
          sim.id === pendingCmd.sim_id &&
          sim.carrier === pendingCmd.operator &&
          sim.used_today < sim.daily_quota
      );

      if (matchingSim) {
        executeCommandMutation.mutate({ 
          commandId: pendingCmd.id, 
          isAuto: true 
        });
      }
    };

    const interval = setInterval(autoExecute, 3000);
    return () => clearInterval(interval);
  }, [sims, commands, autoExecutionEnabled]);

  const executeCommand = (commandId: number) => {
    executeCommandMutation.mutate({ commandId, isAuto: false });
  };

  const addCommand = () => {
    if (!command.code || !command.device_id || !command.sim_id) {
      toast.error("Please fill in all fields");
      return;
    }

    addCommandMutation.mutate({
      code: command.code,
      type: command.type,
      operator: command.operator,
      device_id: command.device_id,
      sim_id: command.sim_id,
      status: 'pending'
    });

    setCommand({
      code: "",
      type: "ACTIVATION",
      operator: "INWI",
      device_id: "",
      sim_id: "",
    });
  };

  const getStatusBadge = (status: UssdCommand["status"]) => {
    const variants: Record<UssdCommand["status"], { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      executing: { variant: "default", label: "Executing" },
      success: { variant: "default", label: "Success" },
      failed: { variant: "destructive", label: "Failed" },
      quota_exceeded: { variant: "destructive", label: "Quota Exceeded" },
    };
    return variants[status];
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass p-4">
          <div className="text-sm text-muted-foreground">Total SIMs</div>
          <div className="text-2xl font-bold">{sims.length}</div>
        </Card>
        <Card className="glass p-4">
          <div className="text-sm text-muted-foreground">Active Commands</div>
          <div className="text-2xl font-bold">
            {commands.filter((c) => c.status === "pending" || c.status === "executing").length}
          </div>
        </Card>
        <Card className="glass p-4">
          <div className="text-sm text-muted-foreground">Today's Executions</div>
          <div className="text-2xl font-bold">
            {sims.reduce((acc, sim) => acc + sim.used_today, 0)}/
            {sims.reduce((acc, sim) => acc + sim.daily_quota, 0)}
          </div>
        </Card>
        <Card className="glass p-4">
          <div className="text-sm text-muted-foreground">Success Rate</div>
          <div className="text-2xl font-bold">
            {commands.length > 0
              ? Math.round((commands.filter((c) => c.status === "success").length / commands.length) * 100)
              : 0}
            %
          </div>
        </Card>
      </div>

      {/* USSD Command Creator */}
      <Card className="glass p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary p-3 rounded-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">USSD Automation</h2>
              <p className="text-sm text-muted-foreground">
                Auto-executes when SIM operator matches USSD operator
              </p>
            </div>
          </div>
          <Button
            variant={autoExecutionEnabled ? "default" : "outline"}
            onClick={() => setAutoExecutionEnabled(!autoExecutionEnabled)}
            className="gap-2"
          >
            {autoExecutionEnabled ? "Auto-Execution ON" : "Auto-Execution OFF"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ussd-code">USSD Code</Label>
            <Input
              id="ussd-code"
              placeholder="e.g., *123#"
              value={command.code}
              onChange={(e) => setCommand({ ...command, code: e.target.value })}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ussd-type">Type</Label>
            <Select
              value={command.type}
              onValueChange={(value: UssdType) => setCommand({ ...command, type: value })}
            >
              <SelectTrigger id="ussd-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVATION">ACTIVATION</SelectItem>
                <SelectItem value="CHECK">CHECK</SelectItem>
                <SelectItem value="TOPUP">TOPUP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ussd-operator">Operator</Label>
            <Select
              value={command.operator}
              onValueChange={(value: Operator) => setCommand({ ...command, operator: value })}
            >
              <SelectTrigger id="ussd-operator">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INWI">INWI</SelectItem>
                <SelectItem value="ORANGE">ORANGE</SelectItem>
                <SelectItem value="IAM">IAM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="device-select">Target Device</Label>
            <Select
              value={command.device_id}
              onValueChange={(value) => setCommand({ ...command, device_id: value, sim_id: "" })}
            >
              <SelectTrigger id="device-select">
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sim-select">SIM Card</Label>
            <Select
              value={command.sim_id}
              onValueChange={(value) => setCommand({ ...command, sim_id: value })}
              disabled={!command.device_id}
            >
              <SelectTrigger id="sim-select">
                <SelectValue placeholder="Select SIM" />
              </SelectTrigger>
              <SelectContent>
                {sims
                  .filter((sim) => sim.device_id === command.device_id)
                  .map((sim) => (
                    <SelectItem key={sim.id} value={sim.id}>
                      {sim.phone_number} ({sim.carrier}) - {sim.used_today}/{sim.daily_quota}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={addCommand} className="w-full gap-2 gradient-primary">
          <Play className="w-4 h-4" />
          Add USSD Command
        </Button>
      </Card>

      {/* SIM Cards Status */}
      <Card className="glass p-6 space-y-4">
        <h3 className="text-xl font-semibold">SIM Cards Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sims.map((sim) => (
            <div
              key={sim.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
            >
              <div>
                <div className="font-medium">{sim.phone_number}</div>
                <div className="text-sm text-muted-foreground">
                  {sim.device_name} • {sim.carrier}
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={sim.used_today >= sim.daily_quota ? "destructive" : "default"}
                >
                  {sim.used_today}/{sim.daily_quota}
                </Badge>
                {sim.used_today >= sim.daily_quota && (
                  <div className="text-xs text-destructive mt-1">Quota Full</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Commands Queue */}
      {commands.length > 0 && (
        <Card className="glass p-6 space-y-4">
          <h3 className="text-xl font-semibold">Commands Queue</h3>
          <div className="space-y-3">
            {commands.map((cmd) => {
              const sim = sims.find((s) => s.id === cmd.sim_id);
              const device = devices.find((d) => d.id === cmd.device_id);
              const statusInfo = getStatusBadge(cmd.status);
              
              return (
                <div
                  key={cmd.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      {cmd.status === "success" && (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      )}
                      {cmd.status === "executing" && (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      )}
                      {cmd.status === "pending" && (
                        <Clock className="w-5 h-5 text-muted-foreground" />
                      )}
                      {(cmd.status === "failed" || cmd.status === "quota_exceeded") && (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {cmd.code}
                        </Badge>
                        <Badge variant="secondary">{cmd.type}</Badge>
                        <Badge>{cmd.operator}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {sim?.phone_number} • {device?.name}
                        {cmd.auto_executed && " • Auto-executed"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    {cmd.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => executeCommand(cmd.id)}
                      >
                        Execute Now
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
