import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import EnhancedNavigation from "@/components/enhanced-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import RealTimeFeed from "@/components/community/real-time-feed";
import AchievementNotifications from "@/components/community/achievement-notifications";
import PostComments from "@/components/community/post-comments";
import CommunityMilestones from "@/components/community/community-milestones";
import UserProfiles from "@/components/community/user-profiles";
import AdvancedNotifications from "@/components/community/advanced-notifications";
import CommunityLeaderboard from "@/components/community/community-leaderboard";
import CommunityEvents from "@/components/community/community-events";
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  PlusCircle, 
  Filter,
  Users,
  TrendingUp,
  Clock,
  Pin,
  Search,
  Send,
  Globe,
  Zap,
  Brain
} from "lucide-react";

interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isPinned?: boolean;
  createdAt: string;
}

const categories = [
  { id: "all", label: "All Posts", icon: Globe },
  { id: "announcements", label: "Announcements", icon: TrendingUp },
  { id: "research", label: "Research", icon: Brain },
  { id: "discussion", label: "Discussion", icon: MessageSquare },
  { id: "support", label: "Support", icon: Users },
];

export default function Community() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "discussion",
    tags: ""
  });
  const { toast } = useToast();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/community/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: (postData: any) => apiRequest("POST", "/api/community/posts", postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setShowCreatePost(false);
      setNewPost({ title: "", content: "", category: "discussion", tags: "" });
      toast({
        title: "Post created successfully!",
        description: "Your post has been shared with the community.",
      });
    },
    onError: () => {
      toast({
        title: "Error creating post",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const likePostMutation = useMutation({
    mutationFn: (postId: string) => apiRequest("POST", `/api/community/posts/${postId}/like`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
    }
  });

  const filteredPosts = posts?.filter((post: CommunityPost) => {
    const categoryMatch = activeCategory === "all" || post.category === activeCategory;
    const searchMatch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return categoryMatch && searchMatch;
  }) || [];

  const handleCreatePost = () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and content.",
        variant: "destructive",
      });
      return;
    }

    const postData = {
      ...newPost,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    createPostMutation.mutate(postData);
  };

  const handleLikePost = (postId: string) => {
    likePostMutation.mutate(postId);
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <EnhancedNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            WE1WEB Community
          </h1>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Connect with AI researchers, developers, and compute providers building the future of distributed computing
          </p>
        </div>

        {/* Mission Banner */}
        <Card className="modern-card mb-8 border-green-500/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-green-400 mb-1">Our Mission</h3>
                <p className="text-muted-foreground">
                  Building the world's largest decentralized data processing network to combat climate change through AI-powered solutions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Posts</span>
                  <span className="font-semibold">{posts?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Members</span>
                  <span className="font-semibold">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Daily Discussions</span>
                  <span className="font-semibold">89</span>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Notifications */}
            <AdvancedNotifications />

            {/* Real-time Activity Feed */}
            <RealTimeFeed />

            {/* Community Milestones */}
            <CommunityMilestones />

            {/* Community Leaderboard */}
            <CommunityLeaderboard />

            {/* Community Events */}
            <CommunityEvents />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Create */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setShowCreatePost(!showCreatePost)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>

            {/* Create Post Form */}
            {showCreatePost && (
              <Card className="modern-card">
                <CardHeader>
                  <CardTitle>Create New Post</CardTitle>
                  <CardDescription>Share your thoughts with the WE1WEB community</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Post title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={4}
                  />
                  <div className="flex gap-4">
                    <select
                      value={newPost.category}
                      onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                      className="px-3 py-2 bg-background border border-border rounded-md"
                    >
                      <option value="discussion">Discussion</option>
                      <option value="research">Research</option>
                      <option value="support">Support</option>
                      <option value="announcements">Announcements</option>
                    </select>
                    <Input
                      placeholder="Tags (comma separated)"
                      value={newPost.tags}
                      onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreatePost} disabled={createPostMutation.isPending}>
                      <Send className="w-4 h-4 mr-2" />
                      {createPostMutation.isPending ? "Posting..." : "Post"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts */}
            <div className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading posts...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card className="modern-card">
                  <CardContent className="p-8 text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-muted-foreground mb-2">No posts found</h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? "Try adjusting your search terms" : "Be the first to start a discussion!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPosts.map((post: CommunityPost) => (
                  <Card key={post.id} className="modern-card">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {post.author.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{post.author.name}</span>
                              <UserProfiles userId={post.author.id} />
                              {post.author.role && (
                                <Badge variant="secondary" className="text-xs">
                                  {post.author.role}
                                </Badge>
                              )}
                              {post.isPinned && (
                                <Pin className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatDate(post.createdAt)}
                              <Badge variant="outline" className="text-xs">
                                {post.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{post.content}</p>
                      </div>

                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLikePost(post.id)}
                            className="text-muted-foreground hover:text-red-400"
                          >
                            <Heart className="w-4 h-4 mr-1" />
                            {post.likes}
                          </Button>
                          <PostComments 
                            postId={post.id}
                            isOpen={expandedComments.includes(post.id)}
                            onToggle={() => toggleComments(post.id)}
                          />
                          <Button variant="ghost" size="sm" className="text-muted-foreground">
                            <Share2 className="w-4 h-4 mr-1" />
                            {post.shares}
                          </Button>
                        </div>
                      </div>

                      {/* Comments Section */}
                      {expandedComments.includes(post.id) && (
                        <PostComments 
                          postId={post.id}
                          isOpen={true}
                          onToggle={() => toggleComments(post.id)}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}