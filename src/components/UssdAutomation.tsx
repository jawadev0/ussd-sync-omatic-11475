import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Zap, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type UssdType = "ACTIVATION" | "CHECK" | "TOPUP";
type Operator = "INWI" | "ORANGE" | "IAM";

interface Sim {
  id: string;
  number: string;
  carrier: Operator;
  device: string;
  usedToday: number;
  dailyQuota: number;
}

interface UssdCommand {
  id: string;
  code: string;
  type: UssdType;
  operator: Operator;
  device: string;
  sim: string;
  status: "pending" | "executing" | "success" | "failed" | "quota_exceeded";
  timestamp: string;
  autoExecuted: boolean;
}

export const UssdAutomation = () => {
  const [command, setCommand] = useState({
    code: "",
    type: "ACTIVATION" as UssdType,
    operator: "INWI" as Operator,
    device: "",
    sim: "",
  });

  const [sims, setSims] = useState<Sim[]>([
    { id: "sim1", number: "+212600000001", carrier: "INWI", device: "Device-01", usedToday: 5, dailyQuota: 20 },
    { id: "sim2", number: "+212600000002", carrier: "ORANGE", device: "Device-01", usedToday: 18, dailyQuota: 20 },
    { id: "sim3", number: "+212600000003", carrier: "IAM", device: "Device-02", usedToday: 20, dailyQuota: 20 },
    { id: "sim4", number: "+212600000004", carrier: "INWI", device: "Device-02", usedToday: 2, dailyQuota: 20 },
  ]);

  const [commands, setCommands] = useState<UssdCommand[]>([]);
  const [autoExecutionEnabled, setAutoExecutionEnabled] = useState(true);

  // Auto-execute when SIM operator matches USSD operator and hasn't exhausted quota
  useEffect(() => {
    if (!autoExecutionEnabled) return;

    const autoExecute = () => {
      sims.forEach((sim) => {
        // Check if SIM can execute (hasn't exhausted quota)
        if (sim.usedToday >= sim.dailyQuota) return;

        // Find pending commands matching this SIM's operator
        const matchingCommands = commands.filter(
          (cmd) =>
            cmd.status === "pending" &&
            cmd.operator === sim.carrier &&
            cmd.sim === sim.id
        );

        matchingCommands.forEach((cmd) => {
          executeCommand(cmd.id, true);
        });
      });
    };

    const interval = setInterval(autoExecute, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [sims, commands, autoExecutionEnabled]);

  const executeCommand = async (commandId: string, isAuto: boolean = false) => {
    const cmd = commands.find((c) => c.id === commandId);
    if (!cmd) return;

    const sim = sims.find((s) => s.id === cmd.sim);
    if (!sim) {
      toast.error("SIM card not found");
      return;
    }

    // Check quota
    if (sim.usedToday >= sim.dailyQuota) {
      setCommands((prev) =>
        prev.map((c) =>
          c.id === commandId
            ? { ...c, status: "quota_exceeded" as const }
            : c
        )
      );
      toast.error(`${sim.number} has exhausted daily quota (${sim.dailyQuota})`);
      return;
    }

    // Check operator match
    if (sim.carrier !== cmd.operator) {
      toast.error(`SIM operator (${sim.carrier}) doesn't match USSD operator (${cmd.operator})`);
      return;
    }

    // Update command to executing
    setCommands((prev) =>
      prev.map((c) =>
        c.id === commandId
          ? { ...c, status: "executing" as const, autoExecuted: isAuto }
          : c
      )
    );

    if (isAuto) {
      toast.info(`Auto-executing ${cmd.code} on ${sim.number} (${sim.carrier})`);
    }

    // Simulate execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update command to success and increment SIM usage
    setCommands((prev) =>
      prev.map((c) =>
        c.id === commandId ? { ...c, status: "success" as const } : c
      )
    );

    setSims((prev) =>
      prev.map((s) =>
        s.id === sim.id ? { ...s, usedToday: s.usedToday + 1 } : s
      )
    );

    toast.success(
      `${cmd.type} ${cmd.code} executed on ${sim.number} (${sim.usedToday + 1}/${sim.dailyQuota})`
    );
  };

  const addCommand = () => {
    if (!command.code || !command.device || !command.sim) {
      toast.error("Please fill in all fields");
      return;
    }

    const newCommand: UssdCommand = {
      id: Date.now().toString(),
      code: command.code,
      type: command.type,
      operator: command.operator,
      device: command.device,
      sim: command.sim,
      status: "pending",
      timestamp: new Date().toISOString(),
      autoExecuted: false,
    };

    setCommands([...commands, newCommand]);

    const sim = sims.find((s) => s.id === command.sim);
    if (sim?.carrier === command.operator && sim.usedToday < sim.dailyQuota) {
      toast.success("Command added and will auto-execute");
    } else {
      toast.info("Command added to queue");
    }

    setCommand({
      code: "",
      type: "ACTIVATION",
      operator: "INWI",
      device: "",
      sim: "",
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
            {sims.reduce((acc, sim) => acc + sim.usedToday, 0)}/
            {sims.reduce((acc, sim) => acc + sim.dailyQuota, 0)}
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
              value={command.device}
              onValueChange={(value) => setCommand({ ...command, device: value })}
            >
              <SelectTrigger id="device-select">
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Device-01">Device-01</SelectItem>
                <SelectItem value="Device-02">Device-02</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sim-select">SIM Card</Label>
            <Select
              value={command.sim}
              onValueChange={(value) => setCommand({ ...command, sim: value })}
            >
              <SelectTrigger id="sim-select">
                <SelectValue placeholder="Select SIM" />
              </SelectTrigger>
              <SelectContent>
                {sims
                  .filter((sim) => sim.device === command.device)
                  .map((sim) => (
                    <SelectItem key={sim.id} value={sim.id}>
                      {sim.number} ({sim.carrier}) - {sim.usedToday}/{sim.dailyQuota}
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
                <div className="font-medium">{sim.number}</div>
                <div className="text-sm text-muted-foreground">
                  {sim.device} • {sim.carrier}
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={sim.usedToday >= sim.dailyQuota ? "destructive" : "default"}
                >
                  {sim.usedToday}/{sim.dailyQuota}
                </Badge>
                {sim.usedToday >= sim.dailyQuota && (
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
              const sim = sims.find((s) => s.id === cmd.sim);
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
                        {sim?.number} • {cmd.device}
                        {cmd.autoExecuted && " • Auto-executed"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    {cmd.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => executeCommand(cmd.id, false)}
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
