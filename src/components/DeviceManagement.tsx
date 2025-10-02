import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Smartphone, Plus, Signal, Battery, Radio } from "lucide-react";
import { toast } from "sonner";
import { Device as CapacitorDevice } from '@capacitor/device';
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Device {
  id: string;
  name: string;
  status: string;
  last_seen: string | null;
  sim_count: number;
  battery?: number;
  signal?: number;
}

export const DeviceManagement = () => {
  const [newDevice, setNewDevice] = useState({ name: "" });
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Device[];
    }
  });

  const addDeviceMutation = useMutation({
    mutationFn: async (deviceData: { name: string; status: string; sim_count: number }) => {
      const { data, error } = await supabase
        .from('devices')
        .insert([deviceData])
        .select()
        .single();
      
      if (error) throw error;
      
      // Auto-generate 2 SIM cards for this device
      const operators: ('INWI' | 'ORANGE' | 'IAM')[] = ['INWI', 'ORANGE', 'IAM'];
      const simsToInsert = Array.from({ length: 2 }, (_, i) => ({
        device_id: data.id,
        phone_number: `+212${Math.floor(600000000 + Math.random() * 99999999)}`,
        carrier: operators[Math.floor(Math.random() * operators.length)]
      }));
      
      const { error: simsError } = await supabase
        .from('sims')
        .insert(simsToInsert);
      
      if (simsError) throw simsError;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['sims'] });
      toast.success("Device and SIM cards added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add device: ${error.message}`);
    }
  });

  useEffect(() => {
    const detectAndAddCurrentDevice = async () => {
      try {
        const info = await CapacitorDevice.getInfo();
        const deviceId = await CapacitorDevice.getId();
        const name = info.name || `${info.manufacturer} Device`;

        // Check if device already exists
        const { data: existingDevice } = await supabase
          .from('devices')
          .select('id')
          .eq('id', deviceId.identifier)
          .maybeSingle();

        if (!existingDevice) {
          // Add device to database
          await addDeviceMutation.mutateAsync({
            name,
            status: 'online',
            sim_count: 2
          });
          toast.success("Current device detected and added!");
        } else {
          // Update last_seen
          await supabase
            .from('devices')
            .update({ last_seen: new Date().toISOString(), status: 'online' })
            .eq('id', deviceId.identifier);
        }
      } catch (error) {
        console.error("Error detecting device:", error);
      }
    };

    detectAndAddCurrentDevice();
  }, []);

  const addDevice = () => {
    if (!newDevice.name) {
      toast.error("Please enter device name");
      return;
    }

    addDeviceMutation.mutate({
      name: newDevice.name,
      status: 'offline',
      sim_count: 2
    });
    
    setNewDevice({ name: "" });
    setOpen(false);
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
              <Button onClick={addDevice} className="w-full gradient-primary">
                Add Device (with 2 SIM cards)
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
                  <p className="text-sm text-muted-foreground">ID: {device.id.slice(0, 8)}</p>
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
                <span className="font-medium">{device.sim_count}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Battery className="w-4 h-4" />
                  Battery
                </span>
                <span className="font-medium">{device.battery || 100}%</span>
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
                        i < (device.signal || 4) ? "bg-success" : "bg-muted"
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
