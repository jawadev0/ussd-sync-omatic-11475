import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Clock, Search } from "lucide-react";
import { useState } from "react";

interface CommandLog {
  id: string;
  timestamp: string;
  device: string;
  sim: string;
  code: string;
  status: "success" | "failed" | "pending";
  response: string;
}

export const CommandHistory = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const commandLogs: CommandLog[] = [
    {
      id: "1",
      timestamp: "2024-01-15 14:32:15",
      device: "Device-01",
      sim: "+1234567890",
      code: "*123#",
      status: "success",
      response: "Balance: $25.50",
    },
    {
      id: "2",
      timestamp: "2024-01-15 14:28:42",
      device: "Device-02",
      sim: "+1234567891",
      code: "*456#",
      status: "success",
      response: "Data: 2.5GB remaining",
    },
    {
      id: "3",
      timestamp: "2024-01-15 14:25:18",
      device: "Device-01",
      sim: "+1234567892",
      code: "*789#",
      status: "failed",
      response: "Network error",
    },
    {
      id: "4",
      timestamp: "2024-01-15 14:20:05",
      device: "Device-03",
      sim: "+1234567893",
      code: "*555#",
      status: "pending",
      response: "Waiting for response...",
    },
  ];

  const getStatusIcon = (status: CommandLog["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "pending":
        return <Clock className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: CommandLog["status"]) => {
    const variants = {
      success: "bg-success text-success-foreground",
      failed: "bg-destructive text-destructive-foreground",
      pending: "bg-warning text-warning-foreground",
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="glass p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by device, SIM, or USSD code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Command Logs */}
      <Card className="glass p-6 space-y-4">
        <h2 className="text-2xl font-bold">Command History</h2>
        <div className="space-y-3">
          {commandLogs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(log.status)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.device}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="font-mono text-sm text-muted-foreground">{log.sim}</span>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {log.code}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(log.status)}
                  <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                </div>
              </div>
              <div className="pl-8 pt-2 border-t border-border/50">
                <p className="text-sm">
                  <span className="text-muted-foreground">Response: </span>
                  <span className="font-medium">{log.response}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full">
          Load More
        </Button>
      </Card>
    </div>
  );
};
