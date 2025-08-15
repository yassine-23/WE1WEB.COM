import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Globe, Users, Cpu } from 'lucide-react';

export default function MissionStatement() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-cyan-600/10 opacity-50" />
      
      <Card className="relative border-0 bg-transparent">
        <CardContent className="p-8 md:p-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1">
                Our Mission
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Europe's Digital Sovereignty Starts Here
              </h2>
            </div>

            {/* Main Quote */}
            <div className="relative">
              <div className="absolute -top-4 -left-2 text-6xl text-primary/20">"</div>
              <p className="text-lg md:text-xl leading-relaxed text-center px-8 italic">
                What if the 83 million smartphones in Germany could become humanity's insurance policy 
                against AI monopolization, while creating the world's first truly democratic supercomputer? 
                This is WE1WEB. And Europe is about to lead the world's most important technological revolution.
              </p>
              <div className="absolute -bottom-4 -right-2 text-6xl text-primary/20">"</div>
            </div>

            {/* Core Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Digital Democracy</h3>
                  <p className="text-sm text-muted-foreground">
                    Breaking Silicon Valley's monopoly. Every citizen becomes an AI stakeholder, 
                    not a product. No single entity controls the network.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Zero Carbon Impact</h3>
                  <p className="text-sm text-muted-foreground">
                    Using existing devices means zero new hardware, zero additional energy. 
                    Making Germany carbon-negative in AI by 2027.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Economic Inclusion</h3>
                  <p className="text-sm text-muted-foreground">
                    Every phone owner earns €50-100/month. Rich or poor, everyone participates 
                    in the AI economy. True wealth distribution.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-cyan-500" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">European Sovereignty</h3>
                  <p className="text-sm text-muted-foreground">
                    Aligned with EU Digital Markets Act. Direct deployment to 450 million EU phones. 
                    No permission needed from Big Tech.
                  </p>
                </div>
              </div>
            </div>

            {/* Vision Statement */}
            <div className="bg-gradient-to-r from-primary/5 to-cyan-500/5 rounded-lg p-6 mt-8">
              <h3 className="font-semibold text-lg mb-3 text-center">Our Vision for 2030</h3>
              <p className="text-center text-muted-foreground">
                Transform Europe's 750 million personal devices into a living neural network that learns 
                without centralized control, adapts to local needs in milliseconds, and grows stronger with 
                every participant. Not just an alternative to Big Tech's AI monopoly—but humanity's 
                democratic answer to the future of artificial intelligence.
              </p>
            </div>

            {/* Institutional Support */}
            <div className="text-center space-y-3 pt-6 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground">Aligned with:</p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
                <span>European Innovation Council</span>
                <span>•</span>
                <span>Fraunhofer Institute</span>
                <span>•</span>
                <span>SPRIND</span>
                <span>•</span>
                <span>EU AI Ethics Committee</span>
                <span>•</span>
                <span>German AI Strategy</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}