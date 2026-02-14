import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { Save, Send } from "lucide-react";
import type { Song, InsertStory, StoryWithDetails } from "@shared/schema";

const storyFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  authorName: z.string().min(1, "Name is required"),
});

type StoryFormData = z.infer<typeof storyFormSchema>;

const CURRENT_USER_ID = 1;

interface StoryFormProps {
  song: Song | null;
  onComplete: () => void;
  existingStory?: StoryWithDetails;
}

export default function StoryForm({ song, onComplete, existingStory }: StoryFormProps) {
  const { toast } = useToast();

  const form = useForm<StoryFormData>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      title: existingStory?.title || "",
      content: existingStory?.content || "",
      authorName: existingStory?.authorName || "",
    },
  });

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

  const onSubmit = (data: StoryFormData, publish: boolean = false) => {
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
      isPublished: publish,
    };

    saveStoryMutation.mutate({ story: storyData, publish });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Tell Your Story</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))} className="space-y-6">
              
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
                      <Input placeholder="How should we credit you?" {...field} />
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
                        placeholder="Share your musical memory..."
                        className="min-h-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.handleSubmit((data) => onSubmit(data, false))()}
                  disabled={saveStoryMutation.isPending}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  disabled={saveStoryMutation.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {saveStoryMutation.isPending ? "Publishing..." : "Publish Story"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}