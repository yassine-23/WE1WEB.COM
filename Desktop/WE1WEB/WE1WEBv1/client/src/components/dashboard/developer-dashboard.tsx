import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";

export default function DeveloperDashboard() {
  const { data: tasks } = useQuery({
    queryKey: ["/api/tasks"],
  });

  const { data: tokenBalance } = useQuery({
    queryKey: ["/api/tokens/balance"],
  });

  // Mock active projects data - replace with real data from tasks API
  const activeProjects = [
    {
      id: "proj-1",
      name: "ChatBot Training - GPT-4 Fine-tune",
      description: "Customer service chatbot with 50k conversations",
      status: "running",
      progress: 67,
      nodes: 24,
      cost: "$247/hr",
      statusColor: "bg-accent/10 text-accent",
    },
    {
      id: "proj-2", 
      name: "Image Recognition Model",
      description: "ResNet-50 training on custom dataset",
      status: "queued",
      progress: 0,
      nodes: 12,
      estimatedTime: "6h",
      estimatedCost: "$89",
      statusColor: "bg-yellow-100 text-yellow-600",
    },
  ];

  // Mock usage statistics
  const monthlyUsage = {
    gpuHours: 1247,
    totalSpent: 8429,
    avgCostPerHour: 6.76,
  };

  // Mock job history - replace with real data from tasks
  const jobHistory = [
    {
      id: "job-1",
      project: "E-commerce Recommender",
      type: "Collaborative Filtering",
      status: "completed",
      duration: "3h 24m",
      cost: "$189.47",
      statusColor: "bg-accent/10 text-accent",
    },
    {
      id: "job-2",
      project: "Sentiment Analysis", 
      type: "BERT Fine-tune",
      status: "failed",
      duration: "0h 47m",
      cost: "$23.45",
      statusColor: "bg-red-100 text-red-600",
    },
    {
      id: "job-3",
      project: "Code Completion Model",
      type: "GPT-3 Fine-tune", 
      status: "completed",
      duration: "8h 12m",
      cost: "$1,247.89",
      statusColor: "bg-accent/10 text-accent",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Project Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Active Projects</h3>
            <div className="space-y-4">
              {activeProjects.map((project) => (
                <div key={project.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                    <Badge className={project.statusColor}>
                      {project.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-600">Nodes:</span>
                      <span className="font-medium ml-1">{project.nodes}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {project.status === "running" ? "Progress:" : "Est. Time:"}
                      </span>
                      <span className="font-medium ml-1">
                        {project.status === "running" ? `${project.progress}%` : project.estimatedTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">
                        {project.status === "running" ? "Cost:" : "Est. Cost:"}
                      </span>
                      <span className="font-medium ml-1">
                        {project.status === "running" ? project.cost : project.estimatedCost}
                      </span>
                    </div>
                  </div>
                  {project.status === "running" && (
                    <Progress value={project.progress} className="w-full" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Compute Credits */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Compute Credits</h3>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  ${typeof tokenBalance?.balance === 'string' 
                    ? parseFloat(tokenBalance.balance).toFixed(2) 
                    : (tokenBalance?.balance || 0).toFixed(2)}
                </div>
                <div className="text-gray-600">Available Balance</div>
              </div>
              <Button className="w-full">Add Credits</Button>
            </div>
          </Card>

          {/* Usage This Month */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Usage This Month</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">GPU Hours</span>
                <span className="font-medium">{monthlyUsage.gpuHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-medium">${monthlyUsage.totalSpent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Cost/Hour</span>
                <span className="font-medium text-accent">${monthlyUsage.avgCostPerHour}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Job History */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Jobs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Project</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Duration</th>
                <th className="text-left py-2">Cost</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {jobHistory.map((job) => (
                <tr key={job.id}>
                  <td className="py-3">{job.project}</td>
                  <td className="py-3">{job.type}</td>
                  <td className="py-3">
                    <Badge className={job.statusColor}>
                      {job.status}
                    </Badge>
                  </td>
                  <td className="py-3">{job.duration}</td>
                  <td className="py-3">{job.cost}</td>
                  <td className="py-3">
                    <Button variant="link" size="sm" className="text-primary">
                      {job.status === "completed" ? "Download" : job.status === "failed" ? "Retry" : "View"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
