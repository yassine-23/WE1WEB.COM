import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, DollarSign, Server, Cpu, HardDrive, Star, User, 
  Calendar, Eye, Users, CheckCircle, XCircle, AlertCircle,
  Zap, Brain, BarChart, FileText, Send, Shield, Award
} from "lucide-react";
import { MarketplaceJob, JobApplication } from "@shared/schema";
import { format } from "date-fns";

interface JobDetailViewProps {
  jobId: string;
  onClose: () => void;
}

export default function JobDetailView({ jobId, onClose }: JobDetailViewProps) {
  const [applicationTab, setApplicationTab] = useState("apply");
  const [proposedPrice, setProposedPrice] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch job details
  const { data: job, isLoading } = useQuery({
    queryKey: ["/api/marketplace/jobs", jobId],
    queryFn: () => apiRequest<MarketplaceJob>("GET", `/api/marketplace/jobs/${jobId}`),
  });

  // Fetch applications if user owns the job
  const { data: applications = [] } = useQuery({
    queryKey: ["/api/marketplace/jobs", jobId, "applications"],
    queryFn: () => apiRequest<JobApplication[]>("GET", `/api/marketplace/jobs/${jobId}/applications`),
    enabled: !!job && job.userId === "current-user", // Replace with actual user check
  });

  // Apply for job mutation
  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", `/api/marketplace/jobs/${jobId}/apply`, data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted",
        description: "Your bid has been sent to the job poster",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/marketplace/jobs", jobId] });
      setProposedPrice("");
      setEstimatedHours("");
      setCoverLetter("");
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApply = () => {
    if (!proposedPrice || !estimatedHours || !coverLetter) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    applyMutation.mutate({
      proposedPrice: parseFloat(proposedPrice),
      estimatedCompletionHours: parseInt(estimatedHours),
      coverLetter,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "training": return Brain;
      case "inference": return Cpu;
      case "preprocessing": return BarChart;
      case "data-labeling": return FileText;
      default: return Zap;
    }
  };

  const CategoryIcon = job ? getCategoryIcon(job.category) : Zap;

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <Skeleton className="h-8 w-3/4" />
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-24" />
            <Skeleton className="h-48" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!job) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{job.title}</DialogTitle>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(job.createdAt), "MMM d, yyyy")}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {job.views} views
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {job.applicants} applicants
                </div>
                {job.rating && (
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                    {job.rating}
                  </div>
                )}
              </div>
            </div>
            <Badge className="bg-primary/20 text-primary">
              <CategoryIcon className="w-4 h-4 mr-1" />
              {job.category}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Job Description */}
          <Card className="p-6 bg-background/50 border-primary/20">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{job.description}</p>
            
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Budget</p>
                  <p className="text-2xl font-bold text-white">${job.budget}</p>
                  <p className="text-xs text-green-400">${job.pricePerHour}/hr</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Duration</p>
                  <p className="text-2xl font-bold text-white">{job.estimatedDuration || "TBD"}</p>
                  <p className="text-xs text-blue-400">hours</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400 opacity-50" />
              </div>
            </Card>
            
            <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Nodes</p>
                  <p className="text-2xl font-bold text-white">{job.minimumNodes}-{job.maximumNodes}</p>
                  <p className="text-xs text-purple-400">required</p>
                </div>
                <Server className="w-8 h-8 text-purple-400 opacity-50" />
              </div>
            </Card>
          </div>

          {/* Technical Requirements */}
          <Card className="p-6 bg-background/50 border-secondary/20">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Cpu className="mr-2 w-5 h-5 text-secondary" />
              Technical Requirements
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">GPU Type</Label>
                <p className="text-white">{job.requirements.gpuType || "Any"}</p>
              </div>
              <div>
                <Label className="text-gray-400">Min GPU Memory</Label>
                <p className="text-white">{job.requirements.minGpuMemory} GB</p>
              </div>
              <div>
                <Label className="text-gray-400">Min CPU Cores</Label>
                <p className="text-white">{job.requirements.minCpuCores}</p>
              </div>
              <div>
                <Label className="text-gray-400">Min RAM</Label>
                <p className="text-white">{job.requirements.minRamGb} GB</p>
              </div>
              {job.framework && (
                <div>
                  <Label className="text-gray-400">Framework</Label>
                  <p className="text-white">{job.framework}</p>
                </div>
              )}
              {job.modelType && (
                <div>
                  <Label className="text-gray-400">Model Type</Label>
                  <p className="text-white">{job.modelType}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Application Section */}
          <Card className="p-6 bg-background/50 border-accent/20">
            <Tabs value={applicationTab} onValueChange={setApplicationTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="apply">Apply for Job</TabsTrigger>
                <TabsTrigger value="applications" disabled={applications.length === 0}>
                  Applications ({applications.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="apply" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Your Bid Price ($)</Label>
                    <Input
                      type="number"
                      placeholder="Enter your total price"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div>
                    <Label>Estimated Hours</Label>
                    <Input
                      type="number"
                      placeholder="Hours to complete"
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Cover Letter</Label>
                  <Textarea
                    rows={4}
                    placeholder="Explain why you're the best fit for this job..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Your Hourly Rate</span>
                    <span className="text-lg font-semibold text-primary">
                      ${proposedPrice && estimatedHours ? (parseFloat(proposedPrice) / parseFloat(estimatedHours)).toFixed(2) : "0.00"}/hr
                    </span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    Competitive with market rates
                  </p>
                </div>
                
                <Button 
                  onClick={handleApply}
                  disabled={applyMutation.isPending || job.status !== "active"}
                  className="w-full bg-primary hover:bg-primary/80"
                >
                  {applyMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="mr-2 w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </Button>
              </TabsContent>
              
              <TabsContent value="applications" className="space-y-4 mt-4">
                {applications.map((app) => (
                  <Card key={app.id} className="p-4 bg-background/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Provider #{app.providerId.slice(0, 8)}</p>
                        <p className="text-sm text-gray-400">
                          ${app.proposedPrice} for {app.estimatedCompletionHours} hours
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={app.status === "pending" ? "secondary" : app.status === "accepted" ? "default" : "destructive"}>
                          {app.status}
                        </Badge>
                        {app.providerRating && (
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm">{app.providerRating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {app.coverLetter && (
                      <p className="text-sm text-gray-300 mt-2">{app.coverLetter}</p>
                    )}
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </Card>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1 text-green-400" />
              Secure Payment
            </div>
            <div className="flex items-center">
              <Award className="w-4 h-4 mr-1 text-blue-400" />
              Quality Guaranteed
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1 text-purple-400" />
              Milestone Tracking
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}