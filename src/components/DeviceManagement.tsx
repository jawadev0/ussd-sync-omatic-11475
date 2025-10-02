import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Smartphone, Plus, Signal, Battery, Wifi, Radio } from "lucide-react";
import { toast } from "sonner";
import { Device as CapacitorDevice } from '@capacitor/device';

interface Device {
  id: string;
  name: string;
  model: string;
  status: "online" | "offline";
  simCount: number;
  battery: number;
  signal: number;
}

export const DeviceManagement = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [newDevice, setNewDevice] = useState({ name: "", model: "" });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const detectCurrentDevice = async () => {
      try {
        const info = await CapacitorDevice.getInfo();
        const batteryInfo = await CapacitorDevice.getBatteryInfo();
        const id = await CapacitorDevice.getId();

        const currentDevice: Device = {
          id: id.identifier,
          name: info.name || `${info.manufacturer} Device`,
          model: `${info.manufacturer} ${info.model}`,
          status: "online",
          simCount: 2, // Every device has 2 SIM cards
          battery: Math.round((batteryInfo.batteryLevel || 0) * 100),
          signal: 4,
        };

        setDevices([currentDevice]);
        toast.success("Current device detected!");
      } catch (error) {
        console.error("Error detecting device:", error);
        toast.error("Could not detect device info");
      }
    };

    detectCurrentDevice();
  }, []);

  const addDevice = () => {
    if (!newDevice.name || !newDevice.model) {
      toast.error("Please fill in all fields");
      return;
    }

    const device: Device = {
      id: Date.now().toString(),
      name: newDevice.name,
      model: newDevice.model,
      status: "offline",
      simCount: 2, // Every device has 2 SIM cards
      battery: 100,
      signal: 0,
    };

    setDevices([...devices, device]);
    setNewDevice({ name: "", model: "" });
    setOpen(false);
    toast.success("Device added successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Device Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary">
              <Plus className="w-4 h-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent className="glass">
            <DialogHeader>
              <DialogTitle>Add New Device</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  placeholder="e.g., Device-04"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-model">Model</Label>
                <Input
                  id="device-model"
                  placeholder="e.g., Samsung Galaxy S23"
                  value={newDevice.model}
                  onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                />
              </div>
              <Button onClick={addDevice} className="w-full gradient-primary">
                Add Device
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <Card key={device.id} className="glass p-6 space-y-4 hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{device.name}</h3>
                  <p className="text-sm text-muted-foreground">{device.model}</p>
                </div>
              </div>
              <Badge variant={device.status === "online" ? "default" : "secondary"} className={device.status === "online" ? "bg-success" : ""}>
                {device.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  SIM Cards
                </span>
                <span className="font-medium">{device.simCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Battery
                </span>
                <span className="font-medium">{device.battery}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Signal className="w-4 h-4" />
                  Signal
                </span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-1 h-3 rounded-full ${
                        i < device.signal ? "bg-success" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Manage Device
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
