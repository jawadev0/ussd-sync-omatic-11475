import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Sim {
  id: string;
  device_id: string;
  phone_number: string;
  carrier: string;
  daily_quota: number;
  used_today: number;
  device_name?: string;
}

export const SimManagement = () => {
  const { data: sims = [] } = useQuery({
    queryKey: ['sims'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sims')
        .select(`
          *,
          devices!inner(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(sim => ({
        ...sim,
        device_name: sim.devices.name
      })) as Sim[];
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">SIM Card Management</h2>
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
                  <h3 className="font-semibold font-mono text-sm">{sim.phone_number}</h3>
                  <p className="text-sm text-muted-foreground">{sim.carrier}</p>
                </div>
              </div>
              <Badge variant="default" className="bg-success">
                active
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Device</span>
                <span className="font-medium">{sim.device_name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Daily Quota</span>
                <Badge variant={sim.used_today >= sim.daily_quota ? "destructive" : "default"}>
                  {sim.used_today}/{sim.daily_quota}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
