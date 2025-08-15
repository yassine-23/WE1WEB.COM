import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import NeuralPoolCreationForm from "@/components/forms/neural-pool-creation-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, Search, Plus, Zap, Database, Cpu, HardDrive, 
  Wifi, Star, TrendingUp, Shield, Eye, Crown, Calendar 
} from "lucide-react";

export default function NeuralPools() {
  const { user } = useAuth();
  const [view, setView] = useState<"browse" | "create" | "my-pools">("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: neuralPools, isLoading } = useQuery({
    queryKey: ["/api/neural-pools"],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== "all") {
        params.append("category", categoryFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      const url = `/api/neural-pools${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch neural pools");
      return response.json();
    },
  });

  const { data: myPools } = useQuery({
    queryKey: ["/api/neural-pools/my"],
  });

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "computer-vision", label: "Computer Vision" },
    { value: "nlp", label: "Natural Language" },
    { value: "multimodal", label: "Multimodal AI" },
    { value: "research", label: "Research" },
    { value: "enterprise", label: "Enterprise" },
  ];

  if (view === "create") {
    return (
      <NeuralPoolCreationForm
        onSuccess={() => setView("browse")}
        onCancel={() => setView("browse")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 cyberpunk-grid opacity-20"></div>
      <div className="absolute inset-0 gradient-hero opacity-30"></div>
      
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center neon-border">
              <Database className="text-white w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold neon-text text-primary">
              Neural Pools Network
            </h1>
          </div>
          <p className="text-xl text-gray-300">
            Join community-driven computing pools for collaborative AI training and transparent earnings
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 space-y-4 sm:space-y-0">
          <div className="flex space-x-2">
            <Button
              onClick={() => setView("browse")}
              className={view === "browse" ? "bg-primary/30 text-primary neon-border" : "bg-background/50 text-gray-300 border-gray-500/30"}
            >
              <Search className="mr-2 w-4 h-4" />
              Browse Pools
            </Button>
            <Button
              onClick={() => setView("my-pools")}
              className={view === "my-pools" ? "bg-secondary/30 text-secondary neon-border" : "bg-background/50 text-gray-300 border-gray-500/30"}
            >
              <Users className="mr-2 w-4 h-4" />
              My Pools
            </Button>
          </div>
          
          <Button
            onClick={() => setView("create")}
            className="bg-primary/20 hover:bg-primary/30 text-primary neon-border"
          >
            <Plus className="mr-2 w-4 h-4" />
            Create Neural Pool
          </Button>
        </div>

        {/* Search and Filters */}
        {view === "browse" && (
          <div className="bg-slate-900/50 p-6 rounded-lg neon-border mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search neural pools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800/50 border-cyan-400/30 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-slate-800/50 border-cyan-400/30 text-white sm:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Browse Pools View */}
        {view === "browse" && (
          <div className="space-y-6">
            {isLoading ? (
              <div className="text-center text-gray-400">Loading neural pools...</div>
            ) : neuralPools && neuralPools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {neuralPools.map((pool: any) => (
                  <div key={pool.id} className="futuristic-card p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-cyan-300">{pool.name}</h3>
                        <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/30">
                          {pool.category}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm">{pool.averageReliability || "N/A"}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm line-clamp-2">{pool.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>{pool.currentMembers || 0}/{pool.maxMembers} members</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Cpu className="w-4 h-4" />
                          <span>{pool.minimumRequirements?.ram || "N/A"}GB RAM</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>{pool.revenueSharing?.participantShare || "N/A"}% share</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Shield className="w-4 h-4" />
                          <span className="capitalize">{pool.poolType}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                      <div className="text-xs text-gray-500">
                        Created {new Date(pool.createdAt).toLocaleDateString()}
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        Join Pool
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Neural Pools Found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || categoryFilter !== "all" 
                    ? "Try adjusting your search or filters" 
                    : "Be the first to create a neural pool in this network"}
                </p>
                <Button
                  onClick={() => setView("create")}
                  className="bg-primary/20 hover:bg-primary/30 text-primary neon-border"
                >
                  <Plus className="mr-2 w-4 h-4" />
                  Create First Pool
                </Button>
              </div>
            )}
          </div>
        )}

        {/* My Pools View */}
        {view === "my-pools" && (
          <div className="space-y-6">
            {myPools && myPools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myPools.map((membership: any) => (
                  <div key={membership.id} className="futuristic-card p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-cyan-300">{membership.pool?.name}</h3>
                        <Badge variant="outline" className="text-xs text-purple-400 border-purple-400/30">
                          {membership.role}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-yellow-400 font-medium">
                          {membership.totalEarnings || "0"} COMP
                        </div>
                        <div className="text-xs text-gray-400">Total Earned</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>Score: {membership.contributionScore || 0}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{membership.totalContributedHours || 0}h contributed</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Star className="w-4 h-4" />
                          <span>{membership.reliabilityScore || 0}/5 rating</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <TrendingUp className="w-4 h-4" />
                          <span>{membership.votingPower || 1}x voting power</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-4">
                      <Badge 
                        variant={membership.status === "active" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {membership.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Pool Memberships</h3>
                <p className="text-gray-500 mb-6">
                  You haven't joined any neural pools yet. Browse available pools to get started.
                </p>
                <Button
                  onClick={() => setView("browse")}
                  className="bg-secondary/20 hover:bg-secondary/30 text-secondary neon-border"
                >
                  <Search className="mr-2 w-4 h-4" />
                  Browse Pools
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
