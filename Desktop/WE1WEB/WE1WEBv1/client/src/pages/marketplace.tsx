import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, Database, Zap, Clock, DollarSign, Users, Star, 
  Filter, Plus, Eye, TrendingUp, Cpu, Server, Brain,
  BarChart, FileText, Code, Layers
} from "lucide-react";
import JobCreationForm from "@/components/marketplace/job-creation-form";
import JobDetailView from "@/components/marketplace/job-detail-view";
import { MarketplaceJob } from "@shared/schema";

export default function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFramework, setSelectedFramework] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch marketplace jobs
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["/api/marketplace/jobs", selectedCategory, selectedFramework, searchQuery, priceRange],
    queryFn: () =>
      apiRequest<MarketplaceJob[]>("GET", `/api/marketplace/jobs`, {
        params: {
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          framework: selectedFramework !== "all" ? selectedFramework : undefined,
          search: searchQuery || undefined,
          minBudget: priceRange[0],
          maxBudget: priceRange[1],
        },
      }),
  });

  // Fetch user's posted jobs
  const { data: myJobs = [] } = useQuery({
    queryKey: ["/api/marketplace/jobs/my"],
    queryFn: () => apiRequest<MarketplaceJob[]>("GET", "/api/marketplace/jobs/my"),
  });

  const categories = [
    { id: "all", name: "All Categories", icon: Layers, count: jobs.length },
    { id: "training", name: "Model Training", icon: Brain, count: jobs.filter(j => j.category === "training").length },
    { id: "inference", name: "Inference", icon: Cpu, count: jobs.filter(j => j.category === "inference").length },
    { id: "preprocessing", name: "Data Processing", icon: BarChart, count: jobs.filter(j => j.category === "preprocessing").length },
    { id: "data-labeling", name: "Data Labeling", icon: FileText, count: jobs.filter(j => j.category === "data-labeling").length },
  ];

  const frameworks = [
    { id: "all", name: "All Frameworks" },
    { id: "pytorch", name: "PyTorch" },
    { id: "tensorflow", name: "TensorFlow" },
    { id: "jax", name: "JAX" },
    { id: "custom", name: "Custom" },
  ];

  const renderJobCard = (job: MarketplaceJob) => (
    <Card
      key={job.id}
      className="futuristic-card hover:border-primary/50 transition-all cursor-pointer p-6"
      onClick={() => setSelectedJob(job.id)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{job.title}</h3>
          <p className="text-gray-400 text-sm line-clamp-2">{job.description}</p>
        </div>
        <Badge className="ml-4 bg-primary/20 text-primary">
          {job.category}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm">
          <DollarSign className="w-4 h-4 mr-2 text-green-400" />
          <span className="text-white font-medium">${job.budget}</span>
          <span className="text-gray-400 ml-1">budget</span>
        </div>
        <div className="flex items-center text-sm">
          <Clock className="w-4 h-4 mr-2 text-blue-400" />
          <span className="text-white">{job.estimatedDuration || "TBD"}</span>
          <span className="text-gray-400 ml-1">hours</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Server className="w-4 h-4 mr-1 text-purple-400" />
            <span className="text-gray-300">{job.minimumNodes}-{job.maximumNodes} nodes</span>
          </div>
          <div className="flex items-center">
            <Eye className="w-4 h-4 mr-1 text-gray-400" />
            <span className="text-gray-300">{job.views} views</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1 text-orange-400" />
            <span className="text-gray-300">{job.applicants} bids</span>
          </div>
        </div>
        {job.rating && (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-white ml-1">{job.rating}</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.framework && (
          <Badge variant="outline" className="text-xs">
            {job.framework}
          </Badge>
        )}
        {job.modelType && (
          <Badge variant="outline" className="text-xs">
            {job.modelType}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
          ${job.pricePerHour}/hr
        </Badge>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 cyberpunk-grid opacity-20"></div>
      <div className="absolute inset-0 gradient-hero opacity-30"></div>
      
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold neon-text text-primary mb-2">
              AI Job Marketplace
            </h1>
            <p className="text-xl text-gray-300">
              Connect developers with distributed compute power
            </p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/80 neon-border">
                <Plus className="mr-2 w-4 h-4" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create AI Job Listing</DialogTitle>
              </DialogHeader>
              <JobCreationForm onSuccess={() => setShowCreateDialog(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="futuristic-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Jobs</p>
                <p className="text-2xl font-bold text-white">{jobs.length}</p>
              </div>
              <Zap className="w-8 h-8 text-primary opacity-50" />
            </div>
          </Card>
          <Card className="futuristic-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Budget</p>
                <p className="text-2xl font-bold text-white">
                  ${jobs.reduce((sum, job) => sum + parseFloat(job.budget), 0).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </Card>
          <Card className="futuristic-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Price/Hr</p>
                <p className="text-2xl font-bold text-white">
                  ${jobs.length ? (jobs.reduce((sum, job) => sum + parseFloat(job.pricePerHour), 0) / jobs.length).toFixed(2) : "0"}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400 opacity-50" />
            </div>
          </Card>
          <Card className="futuristic-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">My Posted Jobs</p>
                <p className="text-2xl font-bold text-white">{myJobs.length}</p>
              </div>
              <Code className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="futuristic-card p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
                <Input
                  placeholder="Search jobs by title or description..."
                  className="pl-10 bg-background/50 border-primary/30 text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 bg-background/50 border-primary/20">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center">
                      <cat.icon className="w-4 h-4 mr-2" />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger className="w-48 bg-background/50 border-secondary/20">
                <SelectValue placeholder="Framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map((fw) => (
                  <SelectItem key={fw.id} value={fw.id}>
                    {fw.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="border-primary/30">
              <Filter className="mr-2 w-4 h-4" />
              More Filters
            </Button>
          </div>
        </Card>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className="whitespace-nowrap"
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Job Listings */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-background/50">
            <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
            <TabsTrigger value="my-jobs">My Posted Jobs</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48" />
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <Card className="futuristic-card p-12 text-center">
                <Database className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
                <p className="text-gray-400">Try adjusting your filters or search query</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {jobs.map(renderJobCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-jobs" className="space-y-4">
            {myJobs.length === 0 ? (
              <Card className="futuristic-card p-12 text-center">
                <Code className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-white mb-2">No jobs posted yet</h3>
                <p className="text-gray-400 mb-4">Start by posting your first AI job</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 w-4 h-4" />
                  Post New Job
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myJobs.map(renderJobCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card className="futuristic-card p-12 text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-white mb-2">Coming Soon</h3>
              <p className="text-gray-400">Application management will be available soon</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Detail Dialog */}
      {selectedJob && (
        <JobDetailView 
          jobId={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
}