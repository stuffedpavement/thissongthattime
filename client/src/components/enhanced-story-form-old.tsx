import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { Wand2, Save, Send, RefreshCw, CheckCircle, Sparkles, ArrowRight } from "lucide-react";

import type { Song, InsertStory, StoryWithDetails } from "@shared/schema";

// Schema for published stories (strict validation)
const enhancedStoryFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  authorName: z.string().min(1, "Name is required"),
  // Core story fields
  age: z.string().optional(),
  lifeContext: z.string().optional(),
  discoveryMoment: z.string().optional(),
  coreMemory: z.string().optional(),
  emotionalConnection: z.string().optional(),
  
  // Streamlined optional prompts
  worldContext: z.string().optional(),
  sharedStory: z.string().optional(),
  emotionalRole: z.string().optional(),
  turningPoint: z.string().optional(),
  musicalHook: z.string().optional(),
  surprisingConnection: z.string().optional(),
  messageToPastSelf: z.string().optional(),
});

// Schema for drafts (relaxed validation)
const draftStoryFormSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  authorName: z.string().optional(),
  // Core story fields
  age: z.string().optional(),
  lifeContext: z.string().optional(),
  discoveryMoment: z.string().optional(),
  coreMemory: z.string().optional(),
  emotionalConnection: z.string().optional(),
  
  // Streamlined optional prompts
  worldContext: z.string().optional(),
  sharedStory: z.string().optional(),
  emotionalRole: z.string().optional(),
  turningPoint: z.string().optional(),
  musicalHook: z.string().optional(),
  surprisingConnection: z.string().optional(),
  messageToPastSelf: z.string().optional(),
});

type EnhancedStoryFormData = z.infer<typeof enhancedStoryFormSchema>;
type DraftStoryFormData = z.infer<typeof draftStoryFormSchema>;

interface EnhancedStoryFormProps {
  song: Song | null;
  onComplete: () => void;
  existingStory?: StoryWithDetails;
}

const saveDraftToStorage = (data: DraftStoryFormData, songId?: number) => {
  if (typeof window !== 'undefined') {
    const draftKey = songId ? `story-draft-${songId}` : 'story-draft-general';
    localStorage.setItem(draftKey, JSON.stringify(data));
  }
};

export default function EnhancedStoryForm({ song, onComplete, existingStory }: EnhancedStoryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  const [currentSection, setCurrentSection] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<number>>(new Set([0]));

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

  // Rotate placeholder texts every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholders({
        title: placeholderTexts.title[Math.floor(Math.random() * placeholderTexts.title.length)],
        discoveryMoment: placeholderTexts.discoveryMoment[Math.floor(Math.random() * placeholderTexts.discoveryMoment.length)],
        coreMemory: placeholderTexts.coreMemory[Math.floor(Math.random() * placeholderTexts.coreMemory.length)]
      });
    }, 3000);

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

  // Track field completion and auto-save
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (song?.id) {
        saveDraftToStorage(value as DraftStoryFormData, song.id);
      }
      
      // Track completed fields
      const newCompletedFields = new Set<string>();
      Object.entries(value).forEach(([key, val]) => {
        if (val && typeof val === 'string' && val.trim().length > 0) {
          newCompletedFields.add(key);
        }
      });
      setCompletedFields(newCompletedFields);

      // Progressive revelation - show next section when current has content
      const coreFieldsCompleted = ['title', 'authorName', 'discoveryMoment'].some(field => 
        newCompletedFields.has(field)
      );
      if (coreFieldsCompleted && !visibleSections.has(1)) {
        setVisibleSections(prev => new Set([...Array.from(prev), 1]));
      }
    });

    return () => subscription.unsubscribe();
  }, [form, song?.id, visibleSections]);

  // Load draft from storage on component mount
  useEffect(() => {
    if (song?.id && typeof window !== 'undefined' && !existingStory) {
      const draftKey = `story-draft-${song.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          form.reset(draftData);
        } catch (error) {
          console.error('Error loading draft:', error);
        }
      }
    }
  }, [song?.id, form, existingStory]);

  const storyMutation = useMutation({
    mutationFn: async (data: { story: InsertStory; publish: boolean }) => {
      const url = existingStory ? `/api/stories/${existingStory.id}` : "/api/stories";
      const method = existingStory ? "PATCH" : "POST";
      
      return apiRequest(method, url, data.story);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stories"] });
      if (song?.id) {
        const draftKey = `story-draft-${song.id}`;
        localStorage.removeItem(draftKey);
      }
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

  const generateQAContent = (data: EnhancedStoryFormData): string => {
    let content = "";
    
    // Essential questions
    if (data.age) content += `**How old were you?**\n${data.age}\n\n`;
    if (data.lifeContext) content += `**What was happening in your life then?**\n${data.lifeContext}\n\n`;
    if (data.discoveryMoment) content += `**How did you discover this song?**\n${data.discoveryMoment}\n\n`;
    if (data.coreMemory) content += `**What's your main memory with this song?**\n${data.coreMemory}\n\n`;
    if (data.emotionalConnection) content += `**How does it make you feel now?**\n${data.emotionalConnection}\n\n`;
    
    // Optional deeper questions
    if (data.worldContext) content += `**What did the world feel like then?**\n${data.worldContext}\n\n`;
    if (data.sharedStory) content += `**Who else was part of this story?**\n${data.sharedStory}\n\n`;
    if (data.emotionalRole) content += `**Did this song help you through something, or elevate a great moment?**\n${data.emotionalRole}\n\n`;
    if (data.turningPoint) content += `**Did it mark a turning point?**\n${data.turningPoint}\n\n`;
    if (data.musicalHook) content += `**What grabs you about the song itself?**\n${data.musicalHook}\n\n`;
    if (data.surprisingConnection) content += `**Looking back, is there anything surprising about your connection?**\n${data.surprisingConnection}\n\n`;
    if (data.messageToPastSelf) content += `**What would you tell your past self?**\n${data.messageToPastSelf}\n\n`;
    
    return content.trim();
  };

  const onSubmit = async (data: EnhancedStoryFormData, publish: boolean = false) => {
    if (!song) return;

    const storyData: InsertStory = {
      title: data.title,
      content: data.content,
      songId: song.id,
      authorName: data.authorName,
      userId: 1, // Default user for now
      isPublished: publish,
    };

    storyMutation.mutate({ story: storyData, publish });
  };

  const handleGenerateStory = async () => {
    if (!song) return;

    setIsGenerating(true);
    try {
      const formData = form.getValues();
      
      // Get selected tone from radio buttons
      const selectedTone = document.querySelector('input[name="tone"]:checked') as HTMLInputElement;
      const tone = selectedTone?.value || "nostalgic";
      
      // Create prompts object with only filled fields
      const prompts: any = {};
      if (formData.age) prompts.age = formData.age;
      if (formData.lifeContext) prompts.lifeContext = formData.lifeContext;
      if (formData.discoveryMoment) prompts.discoveryMoment = formData.discoveryMoment;
      if (formData.coreMemory) prompts.coreMemory = formData.coreMemory;
      if (formData.emotionalConnection) prompts.emotionalConnection = formData.emotionalConnection;
      if (formData.worldContext) prompts.worldContext = formData.worldContext;
      if (formData.sharedStory) prompts.sharedStory = formData.sharedStory;
      if (formData.emotionalRole) prompts.emotionalRole = formData.emotionalRole;
      if (formData.turningPoint) prompts.turningPoint = formData.turningPoint;
      if (formData.musicalHook) prompts.musicalHook = formData.musicalHook;
      if (formData.surprisingConnection) prompts.surprisingConnection = formData.surprisingConnection;
      if (formData.messageToPastSelf) prompts.messageToPastSelf = formData.messageToPastSelf;

      const response = await apiRequest("POST", "/api/stories/generate", {
        prompts,
        songTitle: song.title,
        artist: song.artist,
        tone,
      });

      const result = await response.json();
      form.setValue("content", result.content);
      setIsAiGenerated(true);

      // Scroll to content area
      setTimeout(() => {
        const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
        if (textarea) {
          textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

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

  // Calculate progress
  const totalFields = 7; // Core fields
  const progress = (completedFields.size / totalFields) * 100;

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' : 'bg-gradient-to-br from-slate-50 via-purple-50 to-orange-50'}`}>
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Dark mode toggle */}
      <div className="fixed top-6 right-6 z-40">
        <Button
          onClick={() => setIsDarkMode(!isDarkMode)}
          variant="ghost"
          size="sm"
          className={`rounded-full backdrop-blur-lg ${isDarkMode ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/10 text-black hover:bg-black/20'}`}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))} className="space-y-12">
            
            {/* Header with animated title */}
            <div className="text-center space-y-6 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
              <div className="relative">
                <h1 className={`text-6xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tell Your Story
                </h1>
                <div className="absolute -top-2 -right-2 animate-bounce">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Transform your musical memory into something beautiful
              </p>
              <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
            </div>

            {/* A Side: The Essentials */}
            <div className="animate-in fade-in-0 slide-in-from-bottom-8 duration-700">
              <Card className={`group relative overflow-hidden backdrop-blur-lg border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/70 hover:bg-white/90'}`}>
                {/* Animated gradient border */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-lg opacity-75">
                  <div className={`absolute inset-[2px] rounded-lg ${isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'}`} />
                </div>
                
                <div className="relative">
                  <CardHeader className="pb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl">🎵</span>
                      </div>
                      <div>
                        <CardTitle className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          The Essentials
                        </CardTitle>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Start with the basics that shape your story
                        </p>
                      </div>
                      {completedFields.has('title') && (
                        <CheckCircle className="w-6 h-6 text-green-500 animate-in zoom-in-0 duration-300" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
              
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800">You've named that tune! Now give us a headline for the memory</FormLabel>
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
                    <FormLabel className="text-green-800">What should we call you: real name, stage name, or secret identity?</FormLabel>
                    <FormControl>
                      <Input placeholder="Sarah, DJ Moonbeam, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Core Questions */}
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800">How old were you?</FormLabel>
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

              <FormField
                control={form.control}
                name="lifeContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800">What was happening in your life then?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="The backdrop to your memory e.g., starting university, moving cities, falling in love, dealing with loss…"
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
                name="discoveryMoment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800">How did you discover this song?</FormLabel>
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

              <FormField
                control={form.control}
                name="coreMemory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800">What's your main memory with this song?</FormLabel>
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
          <Card className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-sky-50">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">B Side: Deep Cuts</CardTitle>
              <p className="text-sm text-blue-700 font-medium">Pick a few of these optional prompts to help you dig deeper</p>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <FormField
                control={form.control}
                name="worldContext"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-800">What did the world feel like then?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Paint the picture: sights, sounds, smells"
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
                    <FormLabel className="text-blue-800">Who else was part of this story?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Did someone introduce you to the song, or share the moment?"
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
                    <FormLabel className="text-blue-800">Did this song help you through something, or elevate a great moment?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Comfort, motivation, or the perfect soundtrack to that time of life?"
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
                    <FormLabel className="text-blue-800">Did it mark a turning point?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A before-and-after moment in your life, or your musical journey?"
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
                    <FormLabel className="text-blue-800">What grabs you about the song itself?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A lyric, an earworm, the beat?"
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
                    <FormLabel className="text-blue-800">How does it make you feel now?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What emotions or memories surface when you hear it today?"
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
                    <FormLabel className="text-blue-800">Looking back, is there anything surprising about your connection?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder='e.g., "I used to hate this artist" or "became our wedding song by accident"'
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
                    <FormLabel className="text-blue-800">What would you tell your past self?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A message to the you back then"
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

          {/* Story Creation Section */}
          <Card className="border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-purple-800">♦ Bring Your Story to Life</CardTitle>
              <p className="text-purple-700 font-medium">Now that you've gathered your memories, choose how to craft your story</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Publishing Format Selection */}
              <div className="space-y-4">
                <h4 className="font-semibold text-purple-700">Choose Your Publishing Format:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Q&A Format */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-300 h-full">
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <span className="text-red-600 text-lg font-bold">?</span>
                        </div>
                        <h5 className="font-semibold text-gray-900">Q&A Format</h5>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Publish your completed answers as a structured Q&A</p>
                      
                      <div className="space-y-2 mb-4 flex-grow">
                        <div className="text-sm text-blue-600 flex items-center">
                          <span className="mr-2">•</span>
                          <span>Questions appear in bold</span>
                        </div>
                        <div className="text-sm text-blue-600 flex items-center">
                          <span className="mr-2">•</span>
                          <span>Easy to read format</span>
                        </div>
                        <div className="text-sm text-blue-600 flex items-center">
                          <span className="mr-2">•</span>
                          <span>Perfect for detailed memories</span>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        onClick={() => {
                          const data = form.getValues();
                          const qaContent = generateQAContent(data);
                          form.setValue("content", qaContent);
                          setIsAiGenerated(false);
                          
                          setTimeout(() => {
                            const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                            if (textarea) {
                              textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 100);
                          
                          toast({
                            title: "Q&A Generated",
                            description: "Your completed questions and answers have been formatted for publishing.",
                          });
                        }}
                        variant="outline"
                        className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                      >
                        Generate Q&A
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Free Writing */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-green-300 h-full">
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-yellow-600 text-lg">✏️</span>
                        </div>
                        <h5 className="font-semibold text-gray-900">Free Writing</h5>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Write your story yourself - the prompts above may have sparked inspiration</p>
                      
                      <div className="space-y-2 mb-4 flex-grow">
                        <div className="text-sm text-green-600 flex items-center">
                          <span className="mr-2">•</span>
                          <span>Complete creative control</span>
                        </div>
                        <div className="text-sm text-green-600 flex items-center">
                          <span className="mr-2">•</span>
                          <span>Your authentic voice</span>
                        </div>
                        <div className="text-sm text-green-600 flex items-center">
                          <span className="mr-2">•</span>
                          <span>Tell it your way</span>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        onClick={() => {
                          setTimeout(() => {
                            const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
                            if (textarea) {
                              textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              textarea.focus();
                            }
                          }, 100);
                        }}
                        variant="outline"
                        className="w-full border-green-500 text-green-600 hover:bg-green-50"
                      >
                        Start Writing
                      </Button>
                    </CardContent>
                  </Card>

                  {/* AI-Assisted Writing */}
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-300 h-full">
                    <CardContent className="p-4 h-full flex flex-col">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 text-lg">🤖</span>
                        </div>
                        <h5 className="font-semibold text-gray-900">AI-Assisted Writing</h5>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">Let AI weave your memories into a polished narrative using only the details you've provided</p>
                      
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Choose the narrative tone:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="tone" value="nostalgic" defaultChecked className="text-purple-600" />
                            <span className="text-sm">Nostalgic</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="tone" value="emotional" className="text-purple-600" />
                            <span className="text-sm">Emotional</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="tone" value="joyful" className="text-purple-600" />
                            <span className="text-sm">Joyful</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input type="radio" name="tone" value="reflective" className="text-purple-600" />
                            <span className="text-sm">Reflective</span>
                          </label>
                        </div>
                      </div>
                      
                      <Button
                        type="button"
                        onClick={handleGenerateStory}
                        disabled={isGenerating}
                        className="w-full bg-purple-600 text-white hover:bg-purple-700 mt-auto"
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
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Content Editor */}
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-purple-800">Your Story</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your story will appear here once you choose a format above, or you can start typing..."
                        className="resize-none min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {isAiGenerated && (
                      <p className="text-sm text-blue-600 mt-2">
                        💡 This is an AI-generated draft. Feel free to edit it to match your voice!
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSubmit(form.getValues(), false)}
                  disabled={storyMutation.isPending}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  disabled={storyMutation.isPending}
                  className="flex-1"
                >
                  {storyMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Publish Story
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}