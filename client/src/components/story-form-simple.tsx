import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Music, Send, Save, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Song, InsertStory } from "@shared/schema";

const storyFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  authorName: z.string().min(1, "Name is required"),
  age: z.string().optional(),
  lifeContext: z.string().optional(),
  discoveryMoment: z.string().optional(),
  coreMemory: z.string().optional(),
  emotionalConnection: z.string().optional(),
  tone: z.string().optional(),
  theScene: z.string().optional(),
  soundtrackMoment: z.string().optional(),
  seasonalConnection: z.string().optional(),
  sharedExperience: z.string().optional(),
  musicalIntroduction: z.string().optional(),
  generationalBridge: z.string().optional(),
  beforeAfter: z.string().optional(),
  lifeTransition: z.string().optional(),
  comfortHealing: z.string().optional(),
  identityMarker: z.string().optional(),
  theHook: z.string().optional(),
  lyricalResonance: z.string().optional(),
  musicalDiscovery: z.string().optional(),
  culturalMoment: z.string().optional(),
  unexpectedConnection: z.string().optional(),
  legacyImpact: z.string().optional(),
  sharingPassingOn: z.string().optional(),
  messageToPastSelf: z.string().optional(),
  songAsCompass: z.string().optional(),
  futureConnection: z.string().optional(),
});

type StoryFormData = z.infer<typeof storyFormSchema>;

interface StoryFormProps {
  song: Song | null;
  onComplete: () => void;
}

export default function StoryForm({ song, onComplete }: StoryFormProps) {
  const [isDraft, setIsDraft] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StoryFormData>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      title: "",
      content: "",
      authorName: "",
      age: "",
      lifeContext: "",
      discoveryMoment: "",
      coreMemory: "",
      emotionalConnection: "",
      tone: "",
      theScene: "",
      soundtrackMoment: "",
      seasonalConnection: "",
      sharedExperience: "",
      musicalIntroduction: "",
      generationalBridge: "",
      beforeAfter: "",
      lifeTransition: "",
      comfortHealing: "",
      identityMarker: "",
      theHook: "",
      lyricalResonance: "",
      musicalDiscovery: "",
      culturalMoment: "",
      unexpectedConnection: "",
      legacyImpact: "",
      sharingPassingOn: "",
      messageToPastSelf: "",
      songAsCompass: "",
      futureConnection: "",
    },
  });

  const createStoryMutation = useMutation({
    mutationFn: async (data: { story: InsertStory; publish: boolean }) => {
      const response = await apiRequest("POST", "/api/stories", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: isDraft ? "Draft saved!" : "Story published!",
        description: isDraft ? "Your story has been saved as a draft." : "Your musical memory is now live!",
      });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save story",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: StoryFormData, publish: boolean = false) => {
    if (!song) {
      toast({
        title: "No song selected",
        description: "Please select a song first",
        variant: "destructive",
      });
      return;
    }

    setIsDraft(!publish);
    
    const storyData: InsertStory = {
      userId: 1,
      songId: song.id!,
      title: data.title,
      content: data.content,
      authorName: data.authorName,
      age: data.age || null,
      lifeContext: data.lifeContext || null,
      discoveryMoment: data.discoveryMoment || null,
      coreMemory: data.coreMemory || null,
      emotionalConnection: data.emotionalConnection || null,
      tone: data.tone || null,
      theScene: data.theScene || null,
      soundtrackMoment: data.soundtrackMoment || null,
      seasonalConnection: data.seasonalConnection || null,
      sharedExperience: data.sharedExperience || null,
      musicalIntroduction: data.musicalIntroduction || null,
      generationalBridge: data.generationalBridge || null,
      beforeAfter: data.beforeAfter || null,
      lifeTransition: data.lifeTransition || null,
      comfortHealing: data.comfortHealing || null,
      identityMarker: data.identityMarker || null,
      theHook: data.theHook || null,
      lyricalResonance: data.lyricalResonance || null,
      musicalDiscovery: data.musicalDiscovery || null,
      culturalMoment: data.culturalMoment || null,
      unexpectedConnection: data.unexpectedConnection || null,
      legacyImpact: data.legacyImpact || null,
      sharingPassingOn: data.sharingPassingOn || null,
      messageToPastSelf: data.messageToPastSelf || null,
      songAsCompass: data.songAsCompass || null,
      futureConnection: data.futureConnection || null,
      isPublished: publish,
    };

    createStoryMutation.mutate({ story: storyData, publish });
  };

  if (!song) {
    return (
      <div className="text-center py-8">
        <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Song First</h3>
        <p className="text-gray-600">Choose a song to share your musical memory about.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Selected Song Display */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            {song.albumArt ? (
              <img
                src={song.albumArt}
                alt={`${song.title} album cover`}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{song.title}</h3>
              <p className="text-gray-600">{song.artist}</p>
              {song.year && <p className="text-sm text-gray-500">{song.year}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form className="space-y-6">
          {/* Basic Story Information */}
          <Card>
            <CardHeader>
              <CardTitle>Your Musical Memory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Give your story a memorable title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="authorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl>
                      <Input placeholder="How would you like to be credited?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Story</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your musical memory... What happened when you heard this song? How did it make you feel? What was going on in your life?"
                        className="resize-none min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Enhanced Details */}
          <Card>
            <CardHeader>
              <CardTitle>Add More Detail (Optional)</CardTitle>
              <p className="text-sm text-gray-600">These prompts can help you create a richer story</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your age when this happened</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 16, early twenties, mid-30s..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="discoveryMoment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How did you discover this song?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Friend played it for me, heard it on the radio, found it randomly..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="theScene"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paint the scene</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe where you were, what was happening around you, the atmosphere..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emotionalConnection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What did this song mean to you?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="The emotional impact, what it represented in your life..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onSubmit(form.getValues(), false)}
              disabled={createStoryMutation.isPending}
              className="order-2 sm:order-1"
            >
              {createStoryMutation.isPending && !isDraft ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => onSubmit(form.getValues(), true)}
              disabled={createStoryMutation.isPending}
              className="order-1 sm:order-2 spotify-green hover:bg-green-600"
            >
              {createStoryMutation.isPending && isDraft ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Publish Story
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}