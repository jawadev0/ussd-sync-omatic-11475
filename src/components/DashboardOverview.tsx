import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Radio, Activity, CheckCircle2 } from "lucide-react";

export const DashboardOverview = () => {
  const stats = [
    {
      label: "Active Devices",
      value: "8",
      icon: Smartphone,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Connected SIMs",
      value: "24",
      icon: Radio,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      label: "Running Tasks",
      value: "12",
      icon: Activity,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Completed Today",
      value: "156",
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const recentActivity = [
    { device: "Device-01", sim: "SIM-001", code: "*123#", status: "success", time: "2 min ago" },
    { device: "Device-02", sim: "SIM-005", code: "*456#", status: "success", time: "5 min ago" },
    { device: "Device-01", sim: "SIM-002", code: "*789#", status: "pending", time: "8 min ago" },
    { device: "Device-03", sim: "SIM-012", code: "*555#", status: "success", time: "12 min ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="glass p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="font-medium">{activity.device}</span>
                  <span className="text-sm text-muted-foreground">{activity.sim}</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {activity.code}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  variant={activity.status === "success" ? "default" : "secondary"}
                  className={
                    activity.status === "success"
                      ? "bg-success text-success-foreground"
                      : "bg-warning text-warning-foreground"
                  }
                >
                  {activity.status}
                </Badge>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
