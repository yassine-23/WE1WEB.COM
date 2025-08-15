import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  MessageSquare,
  Plus,
  Search,
  Send,
  Paperclip,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  User,
  BookOpen,
  Phone,
  Mail,
  Headphones,
  Star,
  TrendingUp,
  BarChart3,
  Users,
  Target,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Tag,
  Calendar,
  Zap,
  Shield,
  Award,
  Activity,
  FileText,
  Settings,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface SupportTicket {
  id: string;
  userId: string;
  organizationId: string;
  title: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'feature_request' | 'bug_report' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  tier: 'individual' | 'community' | 'enterprise' | 'custom';
  assignedTo?: string;
  tags: string[];
  attachments: TicketAttachment[];
  sla: {
    responseTime: number;
    resolutionTime: number;
    firstResponseAt?: Date;
    resolvedAt?: Date;
    escalatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

interface TicketMessage {
  id: string;
  ticketId: string;
  userId: string;
  userType: 'customer' | 'agent' | 'system';
  content: string;
  isInternal: boolean;
  attachments: MessageAttachment[];
  createdAt: Date;
  editedAt?: Date;
}

interface TicketAttachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
}

interface MessageAttachment {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
}

interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  subcategory?: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  audience: 'public' | 'enterprise' | 'internal';
  status: 'draft' | 'published' | 'archived';
  author: {
    id: string;
    name: string;
  };
  metadata: {
    views: number;
    likes: number;
    helpful: number;
    notHelpful: number;
    lastUpdated: Date;
    version: number;
  };
  relatedArticles: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface SupportMetrics {
  period: {
    start: Date;
    end: Date;
  };
  tickets: {
    total: number;
    open: number;
    resolved: number;
    closed: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    byTier: Record<string, number>;
  };
  performance: {
    averageResponseTime: number;
    averageResolutionTime: number;
    firstCallResolution: number;
    customerSatisfaction: number;
    slaCompliance: number;
    escalationRate: number;
  };
  agents: {
    total: number;
    available: number;
    busy: number;
    topPerformers: any[];
  };
  trends: {
    dailyTickets: Array<{ date: Date; count: number }>;
    resolutionTimes: Array<{ date: Date; averageTime: number }>;
    satisfactionScores: Array<{ date: Date; score: number }>;
  };
}

export const SupportPortal: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>([]);
  const [metrics, setMetrics] = useState<SupportMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateTicketDialog, setShowCreateTicketDialog] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Create ticket form state
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general' as const,
    priority: 'medium' as const,
  });

  // Message form state
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      setIsLoading(true);

      const [ticketsResponse, metricsResponse, kbResponse] = await Promise.all([
        fetch('/api/enterprise/support/tickets'),
        fetch('/api/enterprise/support/metrics'),
        fetch('/api/enterprise/support/knowledge-base'),
      ]);

      const ticketsData = await ticketsResponse.json();
      const metricsData = await metricsResponse.json();
      const kbData = await kbResponse.json();

      if (ticketsData.success) {
        setTickets(ticketsData.tickets);
        if (ticketsData.tickets.length > 0 && !selectedTicket) {
          setSelectedTicket(ticketsData.tickets[0]);
          loadTicketMessages(ticketsData.tickets[0].id);
        }
      }

      if (metricsData.success) {
        setMetrics(metricsData.metrics);
      }

      if (kbData.success) {
        setKnowledgeBase(kbData.articles);
      }

    } catch (error) {
      console.error('Error loading support data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTicketMessages = async (ticketId: string) => {
    try {
      const response = await fetch(`/api/enterprise/support/tickets/${ticketId}/messages`);
      const data = await response.json();

      if (data.success) {
        setTicketMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading ticket messages:', error);
    }
  };

  const createTicket = async () => {
    try {
      const response = await fetch('/api/enterprise/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTicket.title,
          description: newTicket.description,
          category: newTicket.category,
          priority: newTicket.priority,
          tags: [],
          attachments: [],
          metadata: {},
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateTicketDialog(false);
        setNewTicket({
          title: '',
          description: '',
          category: 'general',
          priority: 'medium',
        });
        await loadSupportData();
      }
    } catch (error) {
      console.error('Error creating ticket:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const response = await fetch(`/api/enterprise/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user',
          userType: 'customer',
          content: newMessage,
          isInternal: false,
          attachments: [],
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        await loadTicketMessages(selectedTicket.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const searchKnowledgeBase = async (query: string) => {
    try {
      const response = await fetch(`/api/enterprise/support/knowledge-base/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setKnowledgeBase(data.articles);
      }
    } catch (error) {
      console.error('Error searching knowledge base:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-50';
      case 'in_progress': return 'text-yellow-600 bg-yellow-50';
      case 'waiting_customer': return 'text-purple-600 bg-purple-50';
      case 'resolved': return 'text-green-600 bg-green-50';
      case 'closed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return <Zap className="h-4 w-4" />;
      case 'billing': return <Target className="h-4 w-4" />;
      case 'account': return <User className="h-4 w-4" />;
      case 'feature_request': return <Plus className="h-4 w-4" />;
      case 'bug_report': return <AlertTriangle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'waiting_customer': return <User className="h-4 w-4 text-purple-600" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'closed': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatNumber = (num: number, decimals: number = 1): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Support Portal</h2>
          <p className="text-muted-foreground">
            Get help and support for your WE1WEB services
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Headphones className="h-4 w-4 mr-2" />
                Live Chat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Live Chat Support</DialogTitle>
                <DialogDescription>
                  Connect with our support team instantly
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Live chat widget will be implemented here
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateTicketDialog} onOpenChange={setShowCreateTicketDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
                <DialogDescription>
                  Describe your issue and we'll help you resolve it
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newTicket.category} onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="account">Account</SelectItem>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="bug_report">Bug Report</SelectItem>
                        <SelectItem value="general">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Subject</Label>
                  <Input
                    id="title"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide detailed information about your issue..."
                    rows={5}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateTicketDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createTicket} disabled={!newTicket.title || !newTicket.description}>
                    Create Ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Total Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.tickets.total}</div>
              <div className="text-xs text-muted-foreground">
                {metrics.tickets.open} open, {metrics.tickets.resolved} resolved
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Avg Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.performance.averageResponseTime)}h</div>
              <div className="text-xs text-muted-foreground">
                Within SLA targets
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Satisfaction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.performance.customerSatisfaction, 1)}/5</div>
              <div className="text-xs text-muted-foreground">
                Customer rating
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2" />
                SLA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatNumber(metrics.performance.slaCompliance)}%</div>
              <Progress value={metrics.performance.slaCompliance} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="tickets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Support Tickets</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any support tickets yet
                </p>
                <Button onClick={() => setShowCreateTicketDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Ticket List */}
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <Card 
                    key={ticket.id}
                    className={`cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedTicket(ticket);
                      loadTicketMessages(ticket.id);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(ticket.category)}
                          <span className="font-medium text-sm">{ticket.title}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(ticket.status)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground truncate mb-2">
                        {ticket.description}
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>#{ticket.id.slice(-8)}</span>
                        <span>{formatTimeAgo(ticket.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Ticket Details */}
              {selectedTicket && (
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            {getCategoryIcon(selectedTicket.category)}
                            <span>{selectedTicket.title}</span>
                          </CardTitle>
                          <CardDescription>
                            Ticket #{selectedTicket.id.slice(-8)} • Created {formatTimeAgo(selectedTicket.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(selectedTicket.status)}>
                            {selectedTicket.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(selectedTicket.priority)}>
                            {selectedTicket.priority}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* SLA Information */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="font-medium mb-2">SLA Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Response Time:</span>
                            <span className="ml-2 font-medium">{selectedTicket.sla.responseTime}h</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Resolution Time:</span>
                            <span className="ml-2 font-medium">{selectedTicket.sla.resolutionTime}h</span>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                        {ticketMessages.map((message) => (
                          <div key={message.id} className={`flex ${message.userType === 'customer' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                              message.userType === 'customer' 
                                ? 'bg-primary text-primary-foreground' 
                                : message.userType === 'system'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-gray-200 text-gray-800'
                            }`}>
                              <div className="text-sm mb-1">
                                <strong>
                                  {message.userType === 'customer' ? 'You' : 
                                   message.userType === 'system' ? 'System' : 'Support Agent'}
                                </strong>
                                <span className="ml-2 text-xs opacity-75">
                                  {formatTimeAgo(message.createdAt)}
                                </span>
                              </div>
                              <div className="text-sm">{message.content}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Message Input */}
                      {selectedTicket.status !== 'closed' && (
                        <div className="flex space-x-2">
                          <div className="flex-1">
                            <Textarea
                              placeholder="Type your message..."
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              rows={3}
                            />
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button size="sm" variant="outline">
                              <Paperclip className="h-4 w-4" />
                            </Button>
                            <Button size="sm" onClick={sendMessage} disabled={!newMessage.trim()}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          {/* Knowledge Base Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) {
                      searchKnowledgeBase(e.target.value);
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Knowledge Base Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledgeBase.map((article) => (
              <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <BookOpen className="h-5 w-5 text-blue-600 mt-1" />
                    <Badge className={getDifficultyColor(article.difficulty)}>
                      {article.difficulty}
                    </Badge>
                  </div>

                  <h3 className="font-medium mb-2">{article.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {article.content.substring(0, 100)}...
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {article.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{article.metadata.views}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{article.metadata.helpful}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {knowledgeBase.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Articles Found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse categories
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {metrics && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Response Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Avg Response Time:</span>
                        <span className="font-medium">{formatNumber(metrics.performance.averageResponseTime)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Resolution Time:</span>
                        <span className="font-medium">{formatNumber(metrics.performance.averageResolutionTime)}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>First Call Resolution:</span>
                        <span className="font-medium">{formatNumber(metrics.performance.firstCallResolution)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ticket Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(metrics.tickets.byCategory).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(category)}
                            <span className="capitalize">{category.replace('_', ' ')}</span>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quality Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Customer Satisfaction:</span>
                        <span className="font-medium">{formatNumber(metrics.performance.customerSatisfaction, 1)}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SLA Compliance:</span>
                        <span className="font-medium text-green-600">{formatNumber(metrics.performance.slaCompliance)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Escalation Rate:</span>
                        <span className="font-medium">{formatNumber(metrics.performance.escalationRate)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Team Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Team Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{metrics.agents.available}</div>
                      <div className="text-sm text-muted-foreground">Available</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{metrics.agents.busy}</div>
                      <div className="text-sm text-muted-foreground">Busy</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{metrics.agents.total}</div>
                      <div className="text-sm text-muted-foreground">Total Agents</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trends Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle>Support Trends</CardTitle>
                  <CardDescription>
                    Daily ticket volume and resolution times
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>Interactive charts will be implemented with a charting library</p>
                      <p className="text-sm">Trends data is available: {metrics.trends.dailyTickets.length} data points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};