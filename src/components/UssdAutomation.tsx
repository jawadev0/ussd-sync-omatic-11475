import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Play, Save, Clock, Zap } from "lucide-react";
import { toast } from "sonner";

export const UssdAutomation = () => {
  const [command, setCommand] = useState({
    code: "",
    device: "",
    sim: "",
    schedule: "immediate",
  });

  const savedAutomations = [
    { id: "1", name: "Balance Check", code: "*123#", device: "Device-01", frequency: "Daily" },
    { id: "2", name: "Data Bundle", code: "*456#", device: "Device-02", frequency: "Weekly" },
    { id: "3", name: "Airtime Top-up", code: "*789#", device: "Device-01", frequency: "On-demand" },
  ];

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
      {/* Command Executor */}
      <Card className="glass p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">USSD Command Executor</h2>
            <p className="text-sm text-muted-foreground">Execute USSD codes on your devices</p>
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
