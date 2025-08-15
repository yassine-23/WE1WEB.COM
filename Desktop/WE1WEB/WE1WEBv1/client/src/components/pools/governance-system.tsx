import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { CheckCircle, XCircle, Clock, Users, Vote, Gavel, TrendingUp } from "lucide-react";

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  type: "task" | "governance" | "financial" | "technical";
  status: "pending" | "approved" | "rejected" | "executed" | "vetoed";
  createdAt: Date;
  endsAt: Date;
  yesVotes: number;
  noVotes: number;
  totalVotingPower: number;
  quorumPercentage: number;
  approvalThreshold: number;
  hasVoted?: boolean;
  userVote?: "yes" | "no" | "abstain";
}

interface GovernanceMetrics {
  totalProposals: number;
  activeProposals: number;
  passedProposals: number;
  rejectedProposals: number;
  averageParticipation: number;
  proposalSuccessRate: number;
  governanceHealth: number;
}

interface PoolGovernanceProps {
  poolId: string;
  userRole: "owner" | "admin" | "member";
  votingPower: number;
}

export const PoolGovernanceSystem: React.FC<PoolGovernanceProps> = ({
  poolId,
  userRole,
  votingPower,
}) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showCreateProposal, setShowCreateProposal] = useState(false);

  // New proposal form state
  const [newProposal, setNewProposal] = useState({
    title: "",
    description: "",
    type: "task" as const,
    votingPeriodHours: 72,
    quorumPercentage: 20,
    approvalThreshold: 60,
    executionDelay: 24,
  });

  useEffect(() => {
    loadGovernanceData();
  }, [poolId]);

  const loadGovernanceData = async () => {
    try {
      setIsLoading(true);

      // Load proposals
      const proposalsResponse = await fetch(`/api/pools/${poolId}/proposals`);
      const proposalsData = await proposalsResponse.json();
      setProposals(proposalsData.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        endsAt: new Date(p.endsAt),
      })));

      // Load governance metrics
      const metricsResponse = await fetch(`/api/pools/${poolId}/governance/metrics`);
      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);
    } catch (error) {
      console.error("Error loading governance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createProposal = async () => {
    try {
      const response = await fetch(`/api/pools/${poolId}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProposal),
      });

      if (response.ok) {
        setShowCreateProposal(false);
        setNewProposal({
          title: "",
          description: "",
          type: "task",
          votingPeriodHours: 72,
          quorumPercentage: 20,
          approvalThreshold: 60,
          executionDelay: 24,
        });
        await loadGovernanceData();
      }
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  const castVote = async (proposalId: string, support: "yes" | "no" | "abstain", reason?: string) => {
    try {
      const response = await fetch(`/api/pools/${poolId}/proposals/${proposalId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ support, reason }),
      });

      if (response.ok) {
        await loadGovernanceData();
      }
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "approved": return "bg-green-500";
      case "rejected": return "bg-red-500";
      case "executed": return "bg-blue-500";
      case "vetoed": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task": return <TrendingUp className="h-4 w-4" />;
      case "governance": return <Gavel className="h-4 w-4" />;
      case "financial": return <Users className="h-4 w-4" />;
      case "technical": return <Vote className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const calculateProgress = (proposal: Proposal) => {
    const totalVotes = proposal.yesVotes + proposal.noVotes;
    const participation = (totalVotes / proposal.totalVotingPower) * 100;
    return Math.min(participation, 100);
  };

  const isQuorumMet = (proposal: Proposal) => {
    const totalVotes = proposal.yesVotes + proposal.noVotes;
    const participation = (totalVotes / proposal.totalVotingPower) * 100;
    return participation >= proposal.quorumPercentage;
  };

  const isApproved = (proposal: Proposal) => {
    const totalVotes = proposal.yesVotes + proposal.noVotes;
    if (totalVotes === 0) return false;
    const approvalRate = (proposal.yesVotes / totalVotes) * 100;
    return approvalRate >= proposal.approvalThreshold && isQuorumMet(proposal);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Governance Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
              <Vote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalProposals}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.activeProposals} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.proposalSuccessRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.passedProposals} passed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participation</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageParticipation.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Average turnout
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.governanceHealth}/100</div>
              <Progress value={metrics.governanceHealth} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="active" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="active">Active Proposals</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="delegate">Delegation</TabsTrigger>
          </TabsList>

          {(userRole === "owner" || userRole === "admin") && (
            <Dialog open={showCreateProposal} onOpenChange={setShowCreateProposal}>
              <DialogTrigger asChild>
                <Button>Create Proposal</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Proposal</DialogTitle>
                  <DialogDescription>
                    Submit a proposal for pool members to vote on
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newProposal.title}
                      onChange={(e) => setNewProposal(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Proposal title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProposal.description}
                      onChange={(e) => setNewProposal(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the proposal..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={newProposal.type}
                        onValueChange={(value: any) => setNewProposal(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="task">Task Proposal</SelectItem>
                          <SelectItem value="governance">Governance Change</SelectItem>
                          <SelectItem value="financial">Financial Decision</SelectItem>
                          <SelectItem value="technical">Technical Upgrade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="votingPeriod">Voting Period (hours)</Label>
                      <Input
                        id="votingPeriod"
                        type="number"
                        value={newProposal.votingPeriodHours}
                        onChange={(e) => setNewProposal(prev => ({ ...prev, votingPeriodHours: parseInt(e.target.value) }))}
                        min={24}
                        max={168}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quorum">Quorum Required (%)</Label>
                      <Input
                        id="quorum"
                        type="number"
                        value={newProposal.quorumPercentage}
                        onChange={(e) => setNewProposal(prev => ({ ...prev, quorumPercentage: parseInt(e.target.value) }))}
                        min={10}
                        max={100}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="approval">Approval Threshold (%)</Label>
                      <Input
                        id="approval"
                        type="number"
                        value={newProposal.approvalThreshold}
                        onChange={(e) => setNewProposal(prev => ({ ...prev, approvalThreshold: parseInt(e.target.value) }))}
                        min={50}
                        max={100}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateProposal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={createProposal} disabled={!newProposal.title || !newProposal.description}>
                      Create Proposal
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <TabsContent value="active" className="space-y-4">
          {proposals.filter(p => p.status === "pending").map((proposal) => (
            <Card key={proposal.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(proposal.type)}
                    <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Ends: {proposal.endsAt.toLocaleDateString()}
                  </div>
                </div>
                <CardDescription>{proposal.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Voting Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Participation: {calculateProgress(proposal).toFixed(1)}%</span>
                    <span>Quorum: {proposal.quorumPercentage}%</span>
                  </div>
                  <Progress value={calculateProgress(proposal)} />
                </div>

                {/* Vote Breakdown */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Yes: {proposal.yesVotes.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">No: {proposal.noVotes.toFixed(2)}</span>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex items-center space-x-4 text-sm">
                  <div className={`flex items-center space-x-1 ${isQuorumMet(proposal) ? 'text-green-600' : 'text-red-600'}`}>
                    {isQuorumMet(proposal) ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    <span>Quorum {isQuorumMet(proposal) ? 'Met' : 'Not Met'}</span>
                  </div>
                  <div className={`flex items-center space-x-1 ${isApproved(proposal) ? 'text-green-600' : 'text-gray-600'}`}>
                    {isApproved(proposal) ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    <span>{isApproved(proposal) ? 'Approved' : 'Pending'}</span>
                  </div>
                </div>

                {/* Voting Buttons */}
                {!proposal.hasVoted && proposal.status === "pending" && new Date() < proposal.endsAt && (
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => castVote(proposal.id, "yes")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Vote Yes
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => castVote(proposal.id, "no")}
                    >
                      Vote No
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => castVote(proposal.id, "abstain")}
                    >
                      Abstain
                    </Button>
                  </div>
                )}

                {proposal.hasVoted && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Badge variant="secondary">
                      You voted: {proposal.userVote}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Voting power: {votingPower.toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {proposals.filter(p => p.status === "pending").length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Proposals</h3>
                <p className="text-muted-foreground">
                  There are currently no proposals requiring your vote.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {proposals.filter(p => p.status !== "pending").map((proposal) => (
            <Card key={proposal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(proposal.type)}
                    <CardTitle className="text-lg">{proposal.title}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {proposal.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Yes: {proposal.yesVotes.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>No: {proposal.noVotes.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="delegate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Voting Delegation</CardTitle>
              <CardDescription>
                Delegate your voting power to another pool member you trust
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Your Voting Power</Label>
                <div className="text-2xl font-bold">{votingPower.toFixed(2)}</div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Delegate Voting Power</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delegate">Delegate To</Label>
                    <Input
                      id="delegate"
                      placeholder="Enter user address or username..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (hours)</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="168">1 Week</SelectItem>
                        <SelectItem value="720">1 Month</SelectItem>
                        <SelectItem value="8760">1 Year</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button>Delegate Voting Power</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};