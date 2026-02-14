import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { Wand2, Save, Send, CheckCircle, Sparkles, ArrowRight, RefreshCw } from "lucide-react";

import type { Song, InsertStory, StoryWithDetails } from "@shared/schema";

const enhancedStoryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  authorName: z.string().min(1, "Name is required"),
  age: z.string().optional(),
  lifeContext: z.string().optional(),
  discoveryMoment: z.string().optional(),
  coreMemory: z.string().optional(),
  sharedExperience: z.string().optional(),
  unexpectedConnection: z.string().optional(),
  messageToPastSelf: z.string().optional(),
});

type EnhancedStoryFormData = z.infer<typeof enhancedStoryFormSchema>;

interface EnhancedStoryFormProps {
  song: Song | null;
  onComplete: () => void;
  existingStory?: StoryWithDetails;
}

const CURRENT_USER_ID = 1;

export default function EnhancedStoryFormModern({ song, onComplete, existingStory }: EnhancedStoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleSections, setVisibleSections] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Dynamic placeholder texts that rotate
  const placeholderTexts = {
    title: [
      "The song that changed everything...",
      "When music saved the day...",
      "A melody that stuck with me...",
      "The soundtrack to my story..."
    ],
    discoveryMoment: [
      "I first heard this on a late-night radio show...",
      "My friend played it at a house party...",
      "It came on shuffle during a difficult time...",
      "The opening notes grabbed me immediately..."
    ],
    coreMemory: [
      "I was driving alone when this song came on...",
      "We danced to this at our wedding...",
      "This played during the credits of my favorite movie...",
      "I heard this while walking through the city..."
    ]
  };

  const [currentPlaceholders, setCurrentPlaceholders] = useState({
    title: placeholderTexts.title[0],
    discoveryMoment: placeholderTexts.discoveryMoment[0],
    coreMemory: placeholderTexts.coreMemory[0]
  });

  // Rotate placeholder texts every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholders({
        title: placeholderTexts.title[Math.floor(Math.random() * placeholderTexts.title.length)],
        discoveryMoment: placeholderTexts.discoveryMoment[Math.floor(Math.random() * placeholderTexts.discoveryMoment.length)],
        coreMemory: placeholderTexts.coreMemory[Math.floor(Math.random() * placeholderTexts.coreMemory.length)]
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const form = useForm<EnhancedStoryFormData>({
    resolver: zodResolver(enhancedStoryFormSchema),
    defaultValues: {
      title: existingStory?.title || "",
      content: existingStory?.content || "",
      authorName: existingStory?.user?.displayName || "",
      age: "",
      lifeContext: "",
      discoveryMoment: "",
      coreMemory: "",
      sharedExperience: "",
      unexpectedConnection: "",
      messageToPastSelf: "",
    },
  });

  // Track field completion and progressive revelation
  useEffect(() => {
    const subscription = form.watch((value) => {
      const newCompletedFields = new Set<string>();
      Object.entries(value).forEach(([key, val]) => {
        if (val && typeof val === 'string' && val.trim().length > 0) {
          newCompletedFields.add(key);
        }
      });
      setCompletedFields(newCompletedFields);

      // Progressive revelation based on completion
      const essentialFields = ['title', 'authorName', 'discoveryMoment'];
      const essentialsCompleted = essentialFields.filter(field => newCompletedFields.has(field)).length;
      
      if (essentialsCompleted >= 2 && visibleSections < 1) {
        setVisibleSections(1);
      }
      if (newCompletedFields.has('coreMemory') && visibleSections < 2) {
        setVisibleSections(2);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, visibleSections]);

  const saveStoryMutation = useMutation({
    mutationFn: async (data: { story: InsertStory; publish: boolean }) => {
      const endpoint = existingStory 
        ? `/api/stories/${existingStory.id}`
        : "/api/stories";
      const method = existingStory ? "PATCH" : "POST";
      
      const response = await apiRequest(method, endpoint, data.story);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      toast({
        title: "Story saved successfully!",
        description: "Your musical memory has been preserved.",
      });
      onComplete();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save story",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateStoryMutation = useMutation({
    mutationFn: async (prompts: any) => {
      const response = await apiRequest("POST", "/api/stories/generate", {
        prompts,
        songTitle: song?.title,
        artist: song?.artist,
        tone: "nostalgic",
      });
      return response.json();
    },
    onSuccess: (result) => {
      form.setValue("content", result.content);
      setIsAiGenerated(true);
      toast({
        title: "Story Generated",
        description: "Your AI-generated story is ready! Feel free to edit it before publishing.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate story",
        variant: "destructive",
      });
    },
  });

  const handleGenerateStory = async () => {
    const formData = form.getValues();
    const prompts: any = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      if (value && typeof value === 'string' && value.trim()) {
        prompts[key] = value;
      }
    });

    const hasPrompts = Object.keys(prompts).length > 0;
    if (!hasPrompts) {
      toast({
        title: "Add some details",
        description: "Please fill in at least one field to generate a story.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateStoryMutation.mutate(prompts);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  const onSubmit = (data: EnhancedStoryFormData, publish: boolean = false) => {
    if (!song) {
      toast({
        title: "No song selected",
        description: "Please select a song first.",
        variant: "destructive",
      });
      return;
    }

    const storyData: InsertStory = {
      userId: CURRENT_USER_ID,
      songId: song.id!,
      title: data.title,
      content: data.content,
      authorName: data.authorName,
      age: data.age || null,
      lifeContext: data.lifeContext || null,
      discoveryMoment: data.discoveryMoment || null,
      coreMemory: data.coreMemory || null,
      worldContext: data.worldContext || null,
      sharedStory: data.sharedStory || null,
      emotionalRole: data.emotionalRole || null,
      turningPoint: data.turningPoint || null,
      musicalHook: data.musicalHook || null,
      surprisingConnection: data.surprisingConnection || null,
      messageToPastSelf: data.messageToPastSelf || null,
      isPublished: publish,
    };

    saveStoryMutation.mutate({ story: storyData, publish });
  };

  const progress = (completedFields.size / 7) * 100;

  return (
    <div className={`min-h-screen transition-all duration-700 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-purple-50 to-orange-50'}`}>
      
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200/50 z-50 backdrop-blur-sm">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-1000 ease-out shadow-lg"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dark mode toggle */}
      <div className="fixed top-6 right-6 z-40">
        <Button
          onClick={() => setIsDarkMode(!isDarkMode)}
          variant="ghost"
          size="sm"
          className={`rounded-full backdrop-blur-lg border-0 shadow-lg hover:scale-110 transition-all duration-300 ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))} className="space-y-16">
            
            {/* Animated Header */}
            <div className="text-center space-y-8 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
              <div className="relative inline-block">
                <h1 className={`text-7xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tell Your Story
                </h1>
                <div className="absolute -top-4 -right-4 animate-bounce">
                  <Sparkles className="w-10 h-10 text-purple-500" />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full opacity-60" />
              </div>
              <p className={`text-2xl font-light ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Transform your musical memory into something beautiful
              </p>
            </div>

            {/* Section 1: The Essentials */}
            <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
              <Card className={`group relative overflow-hidden backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-2 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/80 hover:bg-white/95'}`}>
                
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl opacity-75">
                  <div className={`absolute inset-[3px] rounded-2xl ${isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'}`} />
                </div>
                
                <div className="relative p-8">
                  <CardHeader className="pb-8 px-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                          <span className="text-3xl">🎵</span>
                        </div>
                        <div>
                          <CardTitle className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            The Essentials
                          </CardTitle>
                          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Start with the basics that shape your story
                          </p>
                        </div>
                      </div>
                      {completedFields.has('title') && completedFields.has('authorName') && (
                        <CheckCircle className="w-8 h-8 text-green-500 animate-in zoom-in-0 duration-500" />
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-8 px-0">
                    
                    {/* Title Field */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Story Title
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder={currentPlaceholders.title}
                                className={`h-14 text-lg rounded-xl border-2 transition-all duration-300 ${
                                  focusedField === 'title' 
                                    ? 'border-purple-500 shadow-lg shadow-purple-500/25 scale-105' 
                                    : 'border-gray-200 hover:border-purple-300'
                                } ${completedFields.has('title') ? 'bg-green-50 border-green-300' : ''} ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-white'}`}
                                onFocus={() => setFocusedField('title')}
                                onBlur={() => setFocusedField(null)}
                                {...field}
                              />
                              {completedFields.has('title') && (
                                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                              )}
                            </div>
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
                        <FormItem className="space-y-3">
                          <FormLabel className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Your Name
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="How should we credit you?"
                                className={`h-14 text-lg rounded-xl border-2 transition-all duration-300 ${
                                  focusedField === 'authorName' 
                                    ? 'border-purple-500 shadow-lg shadow-purple-500/25 scale-105' 
                                    : 'border-gray-200 hover:border-purple-300'
                                } ${completedFields.has('authorName') ? 'bg-green-50 border-green-300' : ''} ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-white'}`}
                                onFocus={() => setFocusedField('authorName')}
                                onBlur={() => setFocusedField(null)}
                                {...field}
                              />
                              {completedFields.has('authorName') && (
                                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                              )}
                            </div>
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
                        <FormItem className="space-y-3">
                          <FormLabel className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            How old were you?
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="e.g., 16, early twenties, in my thirties..."
                                className={`h-14 text-lg rounded-xl border-2 transition-all duration-300 ${
                                  focusedField === 'age' 
                                    ? 'border-purple-500 shadow-lg shadow-purple-500/25 scale-105' 
                                    : 'border-gray-200 hover:border-purple-300'
                                } ${completedFields.has('age') ? 'bg-green-50 border-green-300' : ''} ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-white'}`}
                                onFocus={() => setFocusedField('age')}
                                onBlur={() => setFocusedField(null)}
                                {...field}
                              />
                              {completedFields.has('age') && (
                                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                              )}
                            </div>
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
                        <FormItem className="space-y-3">
                          <FormLabel className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            How did you discover this song?
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Textarea
                                placeholder={currentPlaceholders.discoveryMoment}
                                className={`min-h-[120px] text-lg rounded-xl border-2 transition-all duration-300 resize-none ${
                                  focusedField === 'discoveryMoment' 
                                    ? 'border-purple-500 shadow-lg shadow-purple-500/25 scale-105' 
                                    : 'border-gray-200 hover:border-purple-300'
                                } ${completedFields.has('discoveryMoment') ? 'bg-green-50 border-green-300' : ''} ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-white'}`}
                                onFocus={() => setFocusedField('discoveryMoment')}
                                onBlur={() => setFocusedField(null)}
                                {...field}
                              />
                              {completedFields.has('discoveryMoment') && (
                                <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                              )}
                            </div>
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
                        <FormItem className="space-y-3">
                          <FormLabel className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            What's your main memory with this song?
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Textarea
                                placeholder={currentPlaceholders.coreMemory}
                                className={`min-h-[140px] text-lg rounded-xl border-2 transition-all duration-300 resize-none ${
                                  focusedField === 'coreMemory' 
                                    ? 'border-purple-500 shadow-lg shadow-purple-500/25 scale-105' 
                                    : 'border-gray-200 hover:border-purple-300'
                                } ${completedFields.has('coreMemory') ? 'bg-green-50 border-green-300' : ''} ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-white'}`}
                                onFocus={() => setFocusedField('coreMemory')}
                                onBlur={() => setFocusedField(null)}
                                {...field}
                              />
                              {completedFields.has('coreMemory') && (
                                <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Progressive revelation arrow */}
            {visibleSections >= 1 && (
              <div className="flex justify-center animate-in fade-in-0 zoom-in-0 duration-500">
                <div className="flex items-center space-x-4 text-purple-500">
                  <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-purple-500" />
                  <ArrowRight className="w-6 h-6 animate-bounce" />
                  <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-purple-500" />
                </div>
              </div>
            )}

            {/* Section 2: Deep Cuts (Progressive Revelation) */}
            {visibleSections >= 1 && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
                <Card className={`group relative overflow-hidden backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-2 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/80 hover:bg-white/95'}`}>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-2xl opacity-75">
                    <div className={`absolute inset-[3px] rounded-2xl ${isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'}`} />
                  </div>
                  
                  <div className="relative p-8">
                    <CardHeader className="pb-8 px-0">
                      <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                          <span className="text-3xl">🎶</span>
                        </div>
                        <div>
                          <CardTitle className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Deep Cuts
                          </CardTitle>
                          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            Optional details to enrich your story
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-8 px-0">
                      
                      {/* World Context */}
                      <FormField
                        control={form.control}
                        name="worldContext"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              What did the world feel like then?
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Textarea
                                  placeholder="Paint the picture: sights, sounds, smells, the atmosphere..."
                                  className={`min-h-[120px] text-lg rounded-xl border-2 transition-all duration-300 resize-none ${
                                    focusedField === 'worldContext' 
                                      ? 'border-orange-500 shadow-lg shadow-orange-500/25 scale-105' 
                                      : 'border-gray-200 hover:border-orange-300'
                                  } ${completedFields.has('worldContext') ? 'bg-green-50 border-green-300' : ''} ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-white'}`}
                                  onFocus={() => setFocusedField('worldContext')}
                                  onBlur={() => setFocusedField(null)}
                                  {...field}
                                />
                                {completedFields.has('worldContext') && (
                                  <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Shared Story */}
                      <FormField
                        control={form.control}
                        name="sharedStory"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Who else was part of this story?
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Textarea
                                  placeholder="Did someone introduce you to the song, or share the moment?"
                                  className={`min-h-[120px] text-lg rounded-xl border-2 transition-all duration-300 resize-none ${
                                    focusedField === 'sharedStory' 
                                      ? 'border-orange-500 shadow-lg shadow-orange-500/25 scale-105' 
                                      : 'border-gray-200 hover:border-orange-300'
                                  } ${completedFields.has('sharedStory') ? 'bg-green-50 border-green-300' : ''} ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-white'}`}
                                  onFocus={() => setFocusedField('sharedStory')}
                                  onBlur={() => setFocusedField(null)}
                                  {...field}
                                />
                                {completedFields.has('sharedStory') && (
                                  <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Surprising Connection */}
                      <FormField
                        control={form.control}
                        name="surprisingConnection"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Looking back, is there anything surprising about your connection?
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Textarea
                                  placeholder='e.g., "I used to hate this artist" or "became our wedding song by accident"'
                                  className={`min-h-[120px] text-lg rounded-xl border-2 transition-all duration-300 resize-none ${
                                    focusedField === 'surprisingConnection' 
                                      ? 'border-orange-500 shadow-lg shadow-orange-500/25 scale-105' 
                                      : 'border-gray-200 hover:border-orange-300'
                                  } ${completedFields.has('surprisingConnection') ? 'bg-green-50 border-green-300' : ''} ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-white'}`}
                                  onFocus={() => setFocusedField('surprisingConnection')}
                                  onBlur={() => setFocusedField(null)}
                                  {...field}
                                />
                                {completedFields.has('surprisingConnection') && (
                                  <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            {/* AI Generation Section */}
            {visibleSections >= 2 && (
              <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
                <Card className={`group relative overflow-hidden backdrop-blur-xl border-0 shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-2 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/80 hover:bg-white/95'}`}>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-75">
                    <div className={`absolute inset-[3px] rounded-2xl ${isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'}`} />
                  </div>
                  
                  <div className="relative p-8">
                    <CardHeader className="pb-8 px-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                            <Wand2 className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <CardTitle className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              AI Story Generator
                            </CardTitle>
                            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              Transform your memories into a beautiful narrative
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={handleGenerateStory}
                          disabled={isGenerating}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-4 text-lg rounded-xl"
                        >
                          {isGenerating ? (
                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          ) : (
                            <Wand2 className="w-5 h-5 mr-2" />
                          )}
                          {isGenerating ? "Generating..." : "Generate Story"}
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="px-0">
                      {/* Story Content */}
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              Your Story
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Textarea
                                  placeholder="Your generated story will appear here, or write your own..."
                                  className={`min-h-[200px] text-lg rounded-xl border-2 transition-all duration-300 resize-none ${
                                    focusedField === 'content' 
                                      ? 'border-blue-500 shadow-lg shadow-blue-500/25 scale-105' 
                                      : 'border-gray-200 hover:border-blue-300'
                                  } ${completedFields.has('content') ? 'bg-green-50 border-green-300' : ''} ${isDarkMode ? 'bg-white/10 text-white placeholder-gray-400' : 'bg-white'}`}
                                  onFocus={() => setFocusedField('content')}
                                  onBlur={() => setFocusedField(null)}
                                  {...field}
                                />
                                {completedFields.has('content') && (
                                  <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </div>
                </Card>
              </div>
            )}

            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.handleSubmit((data) => onSubmit(data, false))()}
                disabled={saveStoryMutation.isPending}
                className={`px-8 py-4 text-lg rounded-xl border-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'}`}
              >
                <Save className="w-5 h-5 mr-2" />
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={saveStoryMutation.isPending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-4 text-lg rounded-xl"
              >
                <Send className="w-5 h-5 mr-2" />
                {saveStoryMutation.isPending ? "Publishing..." : "Publish Story"}
              </Button>
            </div>

          </form>
        </Form>
      </div>
    </div>
  );
}