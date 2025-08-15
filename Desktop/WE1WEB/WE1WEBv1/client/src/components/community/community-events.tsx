import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  Video,
  Mic,
  BookOpen,
  Brain,
  Zap,
  Globe,
  Award,
  ExternalLink
} from "lucide-react";

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'webinar' | 'hackathon' | 'discussion' | 'presentation';
  date: string;
  time: string;
  duration: string;
  location: 'online' | 'hybrid' | string;
  attendees: number;
  maxAttendees?: number;
  host: {
    name: string;
    role: string;
  };
  tags: string[];
  status: 'upcoming' | 'live' | 'ended';
  registrationRequired: boolean;
}

export default function CommunityEvents() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'live'>('all');

  const events: CommunityEvent[] = [
    {
      id: "1",
      title: "Distributed AI Training Workshop",
      description: "Learn how to optimize neural network training across heterogeneous compute nodes in the WE1WEB network.",
      type: "workshop",
      date: "2025-01-15",
      time: "14:00",
      duration: "2 hours",
      location: "online",
      attendees: 47,
      maxAttendees: 100,
      host: {
        name: "Dr. Michael Kim",
        role: "Platform Admin"
      },
      tags: ["AI", "Training", "Optimization"],
      status: "upcoming",
      registrationRequired: true
    },
    {
      id: "2",
      title: "Carbon Reduction Panel Discussion",
      description: "Industry experts discuss the latest strategies for reducing AI carbon emissions through distributed computing.",
      type: "discussion",
      date: "2025-01-12",
      time: "16:30",
      duration: "1.5 hours",
      location: "online",
      attendees: 89,
      maxAttendees: 200,
      host: {
        name: "Green AI Consortium",
        role: "Partner Organization"
      },
      tags: ["Sustainability", "Carbon", "Environment"],
      status: "live",
      registrationRequired: false
    },
    {
      id: "3",
      title: "Community Hackathon: Climate AI Solutions",
      description: "48-hour hackathon to build AI solutions for climate change using the WE1WEB distributed computing platform.",
      type: "hackathon",
      date: "2025-01-20",
      time: "09:00",
      duration: "48 hours",
      location: "hybrid",
      attendees: 156,
      maxAttendees: 300,
      host: {
        name: "WE1WEB Team",
        role: "Platform Team"
      },
      tags: ["Hackathon", "Climate", "Innovation"],
      status: "upcoming",
      registrationRequired: true
    },
    {
      id: "4",
      title: "Neural Pool Architecture Deep Dive",
      description: "Technical presentation on the architecture and implementation of neural pools for efficient resource allocation.",
      type: "presentation",
      date: "2025-01-18",
      time: "13:00",
      duration: "1 hour",
      location: "online",
      attendees: 34,
      maxAttendees: 150,
      host: {
        name: "Alex Chen",
        role: "AI Developer"
      },
      tags: ["Architecture", "Neural Pools", "Technical"],
      status: "upcoming",
      registrationRequired: true
    }
  ];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'workshop': return BookOpen;
      case 'webinar': return Video;
      case 'hackathon': return Zap;
      case 'discussion': return Mic;
      case 'presentation': return Brain;
      default: return Calendar;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'workshop': return 'bg-blue-500';
      case 'webinar': return 'bg-green-500';
      case 'hackathon': return 'bg-purple-500';
      case 'discussion': return 'bg-orange-500';
      case 'presentation': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-red-500 animate-pulse';
      case 'upcoming': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  return (
    <Card className="modern-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Community Events
          </CardTitle>
          <div className="flex gap-2">
            {['all', 'upcoming', 'live'].map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter(filterOption as any)}
                className="capitalize"
              >
                {filterOption}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No events found</p>
            <p className="text-sm text-muted-foreground">
              Check back later for upcoming community events
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => {
            const EventIcon = getEventIcon(event.type);
            const eventColor = getEventColor(event.type);
            const statusColor = getStatusColor(event.status);
            
            return (
              <div
                key={event.id}
                className="p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${eventColor}/20 rounded-lg flex items-center justify-center`}>
                    <EventIcon className={`w-6 h-6 ${eventColor.replace('bg-', 'text-')}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <div className={`w-2 h-2 rounded-full ${statusColor}`} />
                      <Badge variant="outline" className="text-xs capitalize">
                        {event.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {event.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time} ({event.duration})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="capitalize">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {event.attendees}
                          {event.maxAttendees && ` / ${event.maxAttendees}`} attending
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Hosted by {event.host.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {event.host.role}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {event.status === 'live' && (
                          <Button size="sm" className="bg-red-500 hover:bg-red-600">
                            <Video className="w-4 h-4 mr-1" />
                            Join Live
                          </Button>
                        )}
                        {event.status === 'upcoming' && (
                          <Button 
                            size="sm" 
                            variant={event.registrationRequired ? "default" : "outline"}
                          >
                            {event.registrationRequired ? "Register" : "Add to Calendar"}
                          </Button>
                        )}
                        {event.status === 'ended' && (
                          <Button size="sm" variant="outline">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View Recording
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {event.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {/* Create Event CTA */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium">Host a Community Event</h4>
              <p className="text-sm text-muted-foreground">
                Share your expertise and help grow the WE1WEB community
              </p>
            </div>
            <Button size="sm">
              Propose Event
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}