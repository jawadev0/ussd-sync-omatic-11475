import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "@/components/DashboardOverview";
import { DeviceManagement } from "@/components/DeviceManagement";
import { SimManagement } from "@/components/SimManagement";
import { UssdAutomation } from "@/components/UssdAutomation";
import { CommandHistory } from "@/components/CommandHistory";
import { Smartphone, Radio, Zap, History } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            USSD Automator
          </h1>
          <p className="text-muted-foreground">
            Multi-device and multi-SIM automation platform
          </p>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass p-1 h-auto">
            <TabsTrigger value="dashboard" className="gap-2">
              <Zap className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="devices" className="gap-2">
              <Smartphone className="w-4 h-4" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="sims" className="gap-2">
              <Radio className="w-4 h-4" />
              SIM Cards
            </TabsTrigger>
            <TabsTrigger value="automation" className="gap-2">
              <Zap className="w-4 h-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <DeviceManagement />
          </TabsContent>

          <TabsContent value="sims" className="space-y-6">
            <SimManagement />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <UssdAutomation />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <CommandHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
