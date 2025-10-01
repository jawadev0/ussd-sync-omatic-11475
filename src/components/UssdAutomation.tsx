import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Play, Save, Clock, Zap, Plus, X, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface UssdStep {
  id: string;
  input: string;
  expectedResponse?: string;
  actualResponse?: string;
  status: "pending" | "executing" | "completed" | "failed";
}

interface UssdSession {
  id: string;
  name: string;
  device: string;
  sim: string;
  steps: UssdStep[];
  status: "idle" | "running" | "completed" | "failed";
  currentStep: number;
}

export const UssdAutomation = () => {
  const [command, setCommand] = useState({
    code: "",
    device: "",
    sim: "",
    schedule: "immediate",
  });

  const [multiLevelSteps, setMultiLevelSteps] = useState<string[]>([""]);
  const [sessionName, setSessionName] = useState("");
  const [activeSessions, setActiveSessions] = useState<UssdSession[]>([]);

  const savedAutomations = [
    { id: "1", name: "Balance Check", code: "*123#", device: "Device-01", frequency: "Daily" },
    { id: "2", name: "Data Bundle", code: "*456#", device: "Device-02", frequency: "Weekly" },
    { id: "3", name: "Airtime Top-up", code: "*789#", device: "Device-01", frequency: "On-demand" },
  ];

  const addStep = () => {
    setMultiLevelSteps([...multiLevelSteps, ""]);
  };

  const removeStep = (index: number) => {
    setMultiLevelSteps(multiLevelSteps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...multiLevelSteps];
    updated[index] = value;
    setMultiLevelSteps(updated);
  };

  const executeMultiLevelCommand = async () => {
    if (!command.device || !command.sim || multiLevelSteps.length === 0 || multiLevelSteps[0] === "") {
      toast.error("Please fill in all fields and add at least one step");
      return;
    }

    const sessionId = Date.now().toString();
    const steps: UssdStep[] = multiLevelSteps.map((input, index) => ({
      id: `${sessionId}-${index}`,
      input,
      status: "pending" as const,
    }));

    const newSession: UssdSession = {
      id: sessionId,
      name: sessionName || `Session ${activeSessions.length + 1}`,
      device: command.device,
      sim: command.sim,
      steps,
      status: "running",
      currentStep: 0,
    };

    setActiveSessions([...activeSessions, newSession]);
    toast.success("Multi-level USSD execution started");

    // Simulate step-by-step execution
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setActiveSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          const updatedSteps = [...session.steps];
          updatedSteps[i] = {
            ...updatedSteps[i],
            status: "executing",
          };
          return { ...session, steps: updatedSteps, currentStep: i };
        }
        return session;
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate response
      const mockResponse = `Response for step ${i + 1}: ${steps[i].input}`;
      
      setActiveSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          const updatedSteps = [...session.steps];
          updatedSteps[i] = {
            ...updatedSteps[i],
            status: "completed",
            actualResponse: mockResponse,
          };
          
          const isLastStep = i === steps.length - 1;
          return {
            ...session,
            steps: updatedSteps,
            status: isLastStep ? "completed" : "running",
            currentStep: i + 1,
          };
        }
        return session;
      }));
    }

    toast.success("Multi-level USSD execution completed");
  };

  const executeCommand = () => {
    if (!command.code || !command.device || !command.sim) {
      toast.error("Please fill in all fields");
      return;
    }

    toast.success(`USSD command ${command.code} sent to ${command.device}`);
    setCommand({ code: "", device: "", sim: "", schedule: "immediate" });
  };

  return (
    <div className="space-y-6">
      {/* Multi-Level USSD Automation */}
      <Card className="glass p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-secondary/10 text-secondary p-3 rounded-lg">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Multi-Level USSD Automation</h2>
            <p className="text-sm text-muted-foreground">Execute complex USSD flows automatically</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="session-name">Session Name (Optional)</Label>
            <Input
              id="session-name"
              placeholder="e.g., Balance Check Flow"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="device-select-multi">Target Device</Label>
            <Select value={command.device} onValueChange={(value) => setCommand({ ...command, device: value })}>
              <SelectTrigger id="device-select-multi">
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Device-01">Device-01 (Samsung A54)</SelectItem>
                <SelectItem value="Device-02">Device-02 (iPhone 13)</SelectItem>
                <SelectItem value="Device-03">Device-03 (Pixel 7)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sim-select-multi">SIM Card</Label>
            <Select value={command.sim} onValueChange={(value) => setCommand({ ...command, sim: value })}>
              <SelectTrigger id="sim-select-multi">
                <SelectValue placeholder="Select SIM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim1">+1234567890 (Carrier A)</SelectItem>
                <SelectItem value="sim2">+1234567891 (Carrier B)</SelectItem>
                <SelectItem value="sim3">+1234567892 (Carrier A)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>USSD Steps Sequence</Label>
            <Button variant="outline" size="sm" onClick={addStep} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Step
            </Button>
          </div>
          
          {multiLevelSteps.map((step, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Badge variant="outline" className="shrink-0">{index + 1}</Badge>
              <Input
                placeholder={index === 0 ? "e.g., *123#" : "e.g., 1 (menu option)"}
                value={step}
                onChange={(e) => updateStep(index, e.target.value)}
                className="font-mono"
              />
              {multiLevelSteps.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(index)}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button onClick={executeMultiLevelCommand} className="gap-2 gradient-primary w-full">
          <Play className="w-4 h-4" />
          Execute Multi-Level Flow
        </Button>
      </Card>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card className="glass p-6 space-y-4">
          <h3 className="text-xl font-semibold">Active Sessions</h3>
          <div className="space-y-4">
            {activeSessions.map((session) => (
              <Card key={session.id} className="p-4 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{session.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {session.device} • {session.sim}
                    </p>
                  </div>
                  <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                    {session.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {session.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-background/50"
                    >
                      <div className="shrink-0 mt-1">
                        {step.status === "completed" && (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        )}
                        {step.status === "executing" && (
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        )}
                        {step.status === "pending" && (
                          <Clock className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">
                            Step {index + 1}
                          </Badge>
                          <span className="font-mono text-sm">{step.input}</span>
                        </div>
                        {step.actualResponse && (
                          <p className="text-sm text-muted-foreground pl-2 border-l-2 border-primary/30">
                            {step.actualResponse}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Simple Command Executor */}
      <Card className="glass p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Simple USSD Executor</h2>
            <p className="text-sm text-muted-foreground">Execute single USSD codes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="device-select">Target Device</Label>
            <Select value={command.device} onValueChange={(value) => setCommand({ ...command, device: value })}>
              <SelectTrigger id="device-select">
                <SelectValue placeholder="Select device" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Device-01">Device-01 (Samsung A54)</SelectItem>
                <SelectItem value="Device-02">Device-02 (iPhone 13)</SelectItem>
                <SelectItem value="Device-03">Device-03 (Pixel 7)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sim-select">SIM Card</Label>
            <Select value={command.sim} onValueChange={(value) => setCommand({ ...command, sim: value })}>
              <SelectTrigger id="sim-select">
                <SelectValue placeholder="Select SIM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim1">+1234567890 (Carrier A)</SelectItem>
                <SelectItem value="sim2">+1234567891 (Carrier B)</SelectItem>
                <SelectItem value="sim3">+1234567892 (Carrier A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule-select">Schedule</Label>
            <Select value={command.schedule} onValueChange={(value) => setCommand({ ...command, schedule: value })}>
              <SelectTrigger id="schedule-select">
                <SelectValue placeholder="When to execute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Execute Now</SelectItem>
                <SelectItem value="hourly">Every Hour</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3">
          <Button onClick={executeCommand} className="gap-2 gradient-primary flex-1">
            <Play className="w-4 h-4" />
            Execute Command
          </Button>
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Save as Template
          </Button>
        </div>
      </Card>

      {/* Saved Automations */}
      <Card className="glass p-6 space-y-4">
        <h3 className="text-xl font-semibold">Saved Automations</h3>
        <div className="space-y-3">
          {savedAutomations.map((automation) => (
            <div
              key={automation.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium">{automation.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {automation.code}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{automation.device}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{automation.frequency}</Badge>
                <Button size="sm" variant="outline">
                  <Play className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
