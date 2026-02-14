import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Heart, Sparkles } from "lucide-react";

interface NameSetupProps {
  onComplete: (displayName: string) => void;
}

export default function NameSetup({ onComplete }: NameSetupProps) {
  const [nameType, setNameType] = useState<"full" | "first" | "avatar">("first");
  const [displayName, setDisplayName] = useState("");
  const { toast } = useToast();

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("PATCH", "/api/users/1", { displayName: name });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Welcome to Playback Stories!",
        description: `Great to meet you, ${displayName}! Ready to share your musical memories?`,
      });
      onComplete(displayName);
    },
    onError: (error: any) => {
      toast({
        title: "Setup failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name to continue.",
        variant: "destructive",
      });
      return;
    }
    updateNameMutation.mutate(displayName.trim());
  };

  const getPlaceholder = () => {
    switch (nameType) {
      case "full": return "e.g. Sarah Johnson";
      case "first": return "e.g. Sarah";
      case "avatar": return "e.g. MusicLover92";
    }
  };

  const getDescription = () => {
    switch (nameType) {
      case "full": return "Your full name will be displayed on your stories";
      case "first": return "Only your first name will be shown";
      case "avatar": return "A creative username that represents you";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to Playback Stories!</CardTitle>
          <CardDescription>
            Let's get you set up to share your musical memories. What would you like to be called?
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Choose your display preference:</Label>
              <RadioGroup value={nameType} onValueChange={(value: "full" | "first" | "avatar") => setNameType(value)}>
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="full" id="full" />
                  <User className="w-4 h-4 text-gray-600" />
                  <div className="flex-1">
                    <Label htmlFor="full" className="font-medium cursor-pointer">Full Name</Label>
                    <p className="text-sm text-gray-600">Professional and personal</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="first" id="first" />
                  <Heart className="w-4 h-4 text-gray-600" />
                  <div className="flex-1">
                    <Label htmlFor="first" className="font-medium cursor-pointer">First Name Only</Label>
                    <p className="text-sm text-gray-600">Friendly and approachable</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value="avatar" id="avatar" />
                  <Sparkles className="w-4 h-4 text-gray-600" />
                  <div className="flex-1">
                    <Label htmlFor="avatar" className="font-medium cursor-pointer">Creative Username</Label>
                    <p className="text-sm text-gray-600">Express your personality</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Your Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={getPlaceholder()}
                className="text-center text-lg"
                maxLength={50}
              />
              <p className="text-sm text-gray-600 text-center">{getDescription()}</p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={updateNameMutation.isPending || !displayName.trim()}
            >
              {updateNameMutation.isPending ? "Setting up..." : "Continue to ThisSongThatTime"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}