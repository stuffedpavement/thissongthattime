import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { Wand2, Save, Send, RefreshCw } from "lucide-react";

import type { Song, InsertStory, StoryWithDetails } from "@shared/schema";

const enhancedStoryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  authorName: z.string().min(1, "Name is required"),
  age: z.string().optional(),
  lifeContext: z.string().optional(),
  discoveryMoment: z.string().optional(),
  coreMemory: z.string().optional(),
  emotionalConnection: z.string().optional(),
  worldContext: z.string().optional(),
  sharedStory: z.string().optional(),
  emotionalRole: z.string().optional(),
  turningPoint: z.string().optional(),
  musicalHook: z.string().optional(),
  surprisingConnection: z.string().optional(),
  messageToPastSelf: z.string().optional(),
});

type EnhancedStoryFormData = z.infer<typeof enhancedStoryFormSchema>;

interface EnhancedStoryFormProps {
  song: Song | null;
  onComplete: () => void;
  existingStory?: StoryWithDetails;
}

export default function EnhancedStoryForm({ song, onComplete, existingStory }: EnhancedStoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<EnhancedStoryFormData>({
    resolver: zodResolver(enhancedStoryFormSchema),
    defaultValues: {
      title: existingStory?.title || "",
      content: existingStory?.content || "",
      authorName: existingStory?.authorName || "",
      age: "",
      lifeContext: "",
      discoveryMoment: "",
      coreMemory: "",
      emotionalConnection: "",
      worldContext: "",
      sharedStory: "",
      emotionalRole: "",
      turningPoint: "",
      musicalHook: "",
      surprisingConnection: "",
      messageToPastSelf: "",
    },
  });

  const storyMutation = useMutation({
    mutationFn: async (data: { story: InsertStory; publish: boolean }) => {
      const url = existingStory ? `/api/stories/${existingStory.id}` : "/api/stories";
      const method = existingStory ? "PUT" : "POST";
      
      const response = await apiRequest(method, url, data.story);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stories"] });
      toast({
        title: existingStory ? "Story updated!" : "Story published!",
        description: existingStory ? "Your story has been updated successfully." : "Your musical memory is now live!",
      });
      onComplete();
    },
    onError: (error) => {
      console.error("Story submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save story",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EnhancedStoryFormData, publish: boolean = false) => {
    if (!song) return;

    const storyData: InsertStory = {
      title: data.title,
      content: data.content,
      songId: song.id,
      authorName: data.authorName,
      userId: 1,
      isPublished: publish,
    };

    storyMutation.mutate({ story: storyData, publish });
  };

  const handleGenerateStory = async () => {
    if (!song) return;

    setIsGenerating(true);
    try {
      const formData = form.getValues();
      
      const prompts: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.trim()) {
          prompts[key] = value;
        }
      });

      // Get selected tone from radio buttons
      const selectedTone = document.querySelector('input[name="tone"]:checked') as HTMLInputElement;
      const tone = selectedTone?.value || "nostalgic";

      const response = await apiRequest("POST", "/api/stories/generate", {
        prompts,
        songTitle: song.title,
        artist: song.artist,
        tone,
      });

      const result = await response.json();
      form.setValue("content", result.content);

      toast({
        title: "Story Generated",
        description: "Your AI-generated story is ready! Feel free to edit it before publishing.",
      });
    } catch (error) {
      console.error("AI generation error:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate story",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQAContent = (data: EnhancedStoryFormData): string => {
    let content = "";
    
    if (data.age) content += `**How old were you?**\n${data.age}\n\n`;
    if (data.lifeContext) content += `**What was happening in your life then?**\n${data.lifeContext}\n\n`;
    if (data.discoveryMoment) content += `**How did you discover this song?**\n${data.discoveryMoment}\n\n`;
    if (data.coreMemory) content += `**What's your main memory with this song?**\n${data.coreMemory}\n\n`;
    if (data.emotionalConnection) content += `**How does it make you feel now?**\n${data.emotionalConnection}\n\n`;
    
    if (data.worldContext) content += `**What did the world feel like then?**\n${data.worldContext}\n\n`;
    if (data.sharedStory) content += `**Who else was part of this story?**\n${data.sharedStory}\n\n`;
    if (data.emotionalRole) content += `**Did this song help you through something, or elevate a great moment?**\n${data.emotionalRole}\n\n`;
    if (data.turningPoint) content += `**Did it mark a turning point?**\n${data.turningPoint}\n\n`;
    if (data.musicalHook) content += `**What grabs you about the song itself?**\n${data.musicalHook}\n\n`;
    if (data.surprisingConnection) content += `**Looking back, is there anything surprising about your connection?**\n${data.surprisingConnection}\n\n`;
    if (data.messageToPastSelf) content += `**What would you tell your past self?**\n${data.messageToPastSelf}\n\n`;
    
    return content.trim();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-orange-50">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))} className="space-y-12">
            
            {/* Header */}
            <div className="text-center space-y-6">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Describe Your Memory
              </h1>
              <p className="text-xl text-gray-600">
                Transform your musical memory into something beautiful
              </p>
            </div>

            {/* A Side: The Essentials */}
            <Card className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-purple-500/20 relative overflow-hidden rounded-2xl hover:shadow-3xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-white/30">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-r-full"></div>
              <CardHeader>
                <CardTitle className="text-lg text-purple-800">🎵 A Side: The Essentials</CardTitle>
                <p className="text-sm text-purple-700 font-medium">Start with the basics - these help shape your story</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-800">You've named that tune! Now give us a headline for the memory</FormLabel>
                      <FormControl>
                        <Input placeholder="Give your story a memorable title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Author Name */}
                <FormField
                  control={form.control}
                  name="authorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-800">What should we call you: real name, stage name, or secret identity?</FormLabel>
                      <FormControl>
                        <Input placeholder="Sarah, DJ Moonbeam, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Age */}
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-800">How old were you?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose age range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="0-9">0-9 years old</SelectItem>
                          <SelectItem value="10-14">10-14 years old</SelectItem>
                          <SelectItem value="15-19">15-19 years old</SelectItem>
                          <SelectItem value="20s">In my 20s</SelectItem>
                          <SelectItem value="30s">In my 30s</SelectItem>
                          <SelectItem value="40s">In my 40s</SelectItem>
                          <SelectItem value="50+">50+ years old</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Life Context */}
                <FormField
                  control={form.control}
                  name="lifeContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-800">What was happening in your life then?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="The backdrop to your memory e.g., starting university, moving cities, falling in love, dealing with loss..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Discovery Moment */}
                <FormField
                  control={form.control}
                  name="discoveryMoment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-800">How did you discover this song?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., on a mixtape, at a party, through a friend, at a gig, or randomly on the radio..."
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Core Memory */}
                <FormField
                  control={form.control}
                  name="coreMemory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-purple-800">What's your main memory with this song?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="The specific moment or experience that connects you to this song"
                          className="resize-none"
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>

            {/* B Side: Deep Cuts */}
            <Card className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-orange-500/20 relative overflow-hidden rounded-2xl hover:shadow-3xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1 hover:bg-white/30">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 to-amber-600 rounded-r-full"></div>
              <CardHeader>
                <CardTitle className="text-lg text-orange-800">B Side: Deep Cuts</CardTitle>
                <p className="text-sm text-orange-700 font-medium">Pick a few of these optional prompts to help you dig deeper</p>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="worldContext"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-800">What did the world feel like then?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="The cultural moment, historical backdrop, or generational context"
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
                  name="sharedStory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-800">Who else was part of this story?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Friends, family, strangers, or people who shared this musical moment"
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
                  name="emotionalRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-800">Did this song help you through something, or elevate a great moment?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How the song served you emotionally - comfort, celebration, motivation, healing"
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
                  name="turningPoint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-800">Did it mark a turning point?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A moment of realization, decision, or change that this song witnessed"
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
                  name="musicalHook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-800">What grabs you about the song itself?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="The lyrics, melody, production, or musical elements that hook you"
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
                  name="surprisingConnection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-800">Looking back, is there anything surprising about your connection?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Unexpected insights, irony, or patterns you notice now"
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
                  name="messageToPastSelf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-orange-800">What would you tell your past self?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Wisdom, encouragement, or perspective you'd share with who you were then"
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

            {/* Publishing Section */}
            <Card className="bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl shadow-slate-600/20 relative overflow-hidden rounded-2xl hover:shadow-3xl hover:shadow-slate-600/30 transition-all duration-300 hover:-translate-y-1 hover:bg-white/30">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-slate-700 to-gray-800 rounded-r-full"></div>
              <CardHeader>
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <span className="text-slate-600">♦</span>
                  Liner Notes: Bring Your Story to Life
                </CardTitle>
                <p className="text-slate-700">Now that you've gathered your memories, choose how to craft your story</p>
              </CardHeader>
              <CardContent className="space-y-8">
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-6">Choose Your Publishing Format:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Q&A Format */}
                    <Card className="p-6 bg-white/30 backdrop-blur-lg border border-white/40 shadow-xl shadow-orange-500/15 rounded-xl hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:-translate-y-2 hover:bg-white/40">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-2xl text-orange-600">?</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">Q&A Format</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Publish your completed answers as a structured Q&A
                        </p>
                        <div className="space-y-2 text-xs text-left">
                          <div className="flex items-center gap-2 text-blue-600">
                            <span>•</span> Questions appear in bold
                          </div>
                          <div className="flex items-center gap-2 text-blue-600">
                            <span>•</span> Easy to read format
                          </div>
                          <div className="flex items-center gap-2 text-blue-600">
                            <span>•</span> Perfect for detailed memories
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                          onClick={() => {
                            const qaContent = generateQAContent(form.getValues());
                            if (qaContent.trim()) {
                              form.setValue("content", qaContent);
                              toast({
                                title: "Q&A Story Created",
                                description: "Your answers have been formatted into a story structure.",
                              });
                            } else {
                              toast({
                                title: "No Content to Format",
                                description: "Please fill out some questions in the sections above first.",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Generate Q&A
                        </Button>
                      </div>
                    </Card>

                    {/* Free Writing */}
                    <Card className="p-6 bg-white/30 backdrop-blur-lg border border-white/40 shadow-xl shadow-yellow-500/15 rounded-xl hover:shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 hover:-translate-y-2 hover:bg-white/40">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-2xl">✏️</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">Free Writing</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Write your story yourself - the prompts above may have sparked inspiration
                        </p>
                        <div className="space-y-2 text-xs text-left">
                          <div className="flex items-center gap-2 text-green-600">
                            <span>•</span> Complete creative control
                          </div>
                          <div className="flex items-center gap-2 text-green-600">
                            <span>•</span> Your authentic voice
                          </div>
                          <div className="flex items-center gap-2 text-green-600">
                            <span>•</span> Tell it your way
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-green-200 text-green-700 hover:bg-green-50"
                          onClick={() => {
                            // Focus on the story textarea
                            const textarea = document.querySelector('textarea[placeholder*="Your story will appear here"]') as HTMLTextAreaElement;
                            if (textarea) {
                              textarea.focus();
                            }
                          }}
                        >
                          Start Writing
                        </Button>
                      </div>
                    </Card>

                    {/* AI-Assisted Writing */}
                    <Card className="p-6 bg-white/30 backdrop-blur-lg border border-white/40 shadow-xl shadow-blue-500/15 rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-2 hover:bg-white/40">
                      <div className="text-center space-y-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                          <span className="text-2xl">🧠</span>
                        </div>
                        <h4 className="font-semibold text-gray-900">AI-Assisted Writing</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Let AI weave your memories into a polished narrative using only the details you've provided
                        </p>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-3">Choose the narrative tone:</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <label className="flex items-center gap-1">
                              <input type="radio" name="tone" value="nostalgic" defaultChecked className="text-purple-600" />
                              Nostalgic
                            </label>
                            <label className="flex items-center gap-1">
                              <input type="radio" name="tone" value="emotional" className="text-purple-600" />
                              Emotional
                            </label>
                            <label className="flex items-center gap-1">
                              <input type="radio" name="tone" value="joyful" className="text-purple-600" />
                              Joyful
                            </label>
                            <label className="flex items-center gap-1">
                              <input type="radio" name="tone" value="reflective" className="text-purple-600" />
                              Reflective
                            </label>
                          </div>
                        </div>
                        
                        <Button
                          type="button"
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={handleGenerateStory}
                          disabled={isGenerating}
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-4 h-4 mr-2" />
                              Generate My Story
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>

                  </div>
                </div>

                {/* Story Content Area */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Your Story</h3>
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            placeholder="Your story will appear here once you choose a format above, or you can start typing..."
                            className="min-h-[200px] resize-none text-base leading-relaxed border-2 border-purple-200 focus:border-purple-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Publish Buttons */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onSubmit(form.getValues(), false)}
                    disabled={storyMutation.isPending || !form.watch("content")}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Draft
                  </Button>
                  
                  <Button
                    type="submit"
                    disabled={storyMutation.isPending || !form.watch("content")}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Publish Story
                  </Button>
                </div>

              </CardContent>
            </Card>

          </form>
        </Form>
      </div>
    </div>
  );
}