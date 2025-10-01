import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Radio, Plus, Signal } from "lucide-react";
import { toast } from "sonner";

interface Sim {
  id: string;
  number: string;
  carrier: string;
  device: string;
  status: "active" | "inactive";
  balance: string;
}

export const SimManagement = () => {
  const [sims, setSims] = useState<Sim[]>([
    { id: "1", number: "+1234567890", carrier: "Carrier A", device: "Device-01", status: "active", balance: "$25.50" },
    { id: "2", number: "+1234567891", carrier: "Carrier B", device: "Device-01", status: "active", balance: "$18.20" },
    { id: "3", number: "+1234567892", carrier: "Carrier A", device: "Device-02", status: "inactive", balance: "$5.00" },
  ]);

  const [newSim, setNewSim] = useState({ number: "", carrier: "", device: "" });
  const [open, setOpen] = useState(false);

  const addSim = () => {
    if (!newSim.number || !newSim.carrier || !newSim.device) {
      toast.error("Please fill in all fields");
      return;
    }

    const sim: Sim = {
      id: Date.now().toString(),
      number: newSim.number,
      carrier: newSim.carrier,
      device: newSim.device,
      status: "inactive",
      balance: "$0.00",
    };

    setSims([...sims, sim]);
    setNewSim({ number: "", carrier: "", device: "" });
    setOpen(false);
    toast.success("SIM card added successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">SIM Card Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="w-4 h-4" />
              Add SIM
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Add New SIM Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="sim-number">Phone Number</Label>
                <Input
                  id="sim-number"
                  placeholder="+1234567890"
                  value={newSim.number}
                  onChange={(e) => setNewSim({ ...newSim, number: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sim-carrier">Carrier</Label>
                <Input
                  id="sim-carrier"
                  placeholder="e.g., Carrier A"
                  value={newSim.carrier}
                  onChange={(e) => setNewSim({ ...newSim, carrier: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sim-device">Assign to Device</Label>
                <Select value={newSim.device} onValueChange={(value) => setNewSim({ ...newSim, device: value })}>
                  <SelectTrigger id="sim-device">
                    <SelectValue placeholder="Select device" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Device-01">Device-01</SelectItem>
                    <SelectItem value="Device-02">Device-02</SelectItem>
                    <SelectItem value="Device-03">Device-03</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={addSim} className="w-full gradient-primary">
                Add SIM Card
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sims.map((sim) => (
          <Card key={sim.id} className="glass p-6 space-y-4 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/10 text-secondary p-3 rounded-lg">
                  <Radio className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold font-mono text-sm">{sim.number}</h3>
                  <p className="text-sm text-muted-foreground">{sim.carrier}</p>
                </div>
              </div>
              <Badge variant={sim.status === "active" ? "default" : "secondary"} className={sim.status === "active" ? "bg-success" : ""}>
                {sim.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Device</span>
                <span className="font-medium">{sim.device}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-medium text-primary">{sim.balance}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                Details
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Check Balance
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
