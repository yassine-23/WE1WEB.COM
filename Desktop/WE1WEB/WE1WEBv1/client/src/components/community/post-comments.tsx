import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Heart, 
  Reply, 
  Send,
  Clock
} from "lucide-react";

interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  content: string;
  likes: number;
  replies: Comment[];
  createdAt: string;
}

interface PostCommentsProps {
  postId: string;
  isOpen: boolean;
  onToggle: () => void;
}

export default function PostComments({ postId, isOpen, onToggle }: PostCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["/api/community/posts", postId, "comments"],
    enabled: isOpen,
  });

  const createCommentMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest("POST", `/api/community/posts/${postId}/comments`, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/community/posts", postId, "comments"] 
      });
      setNewComment("");
      toast({
        title: "Comment posted!",
        description: "Your comment has been added to the discussion.",
      });
    },
    onError: () => {
      toast({
        title: "Error posting comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  });

  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before posting.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate(newComment);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onToggle}
        className="text-muted-foreground"
      >
        <MessageSquare className="w-4 h-4 mr-1" />
        View Comments
      </Button>
    );
  }

  return (
    <div className="mt-6 pt-4 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-foreground">Comments</h4>
        <Button variant="ghost" size="sm" onClick={onToggle}>
          Hide Comments
        </Button>
      </div>

      {/* New Comment Form */}
      <div className="mb-6 space-y-3">
        <Textarea
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmitComment}
            disabled={createCommentMutation.isPending || !newComment.trim()}
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-2">Loading comments...</p>
          </div>
        ) : comments?.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No comments yet</p>
            <p className="text-sm text-muted-foreground">Be the first to share your thoughts!</p>
          </div>
        ) : (
          comments?.map((comment: Comment) => (
            <div 
              key={comment.id} 
              className="p-4 rounded-lg bg-background/50 border border-border/50"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {comment.author.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{comment.author.name}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground hover:text-red-400">
                      <Heart className="w-3 h-3 mr-1" />
                      {comment.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground">
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}