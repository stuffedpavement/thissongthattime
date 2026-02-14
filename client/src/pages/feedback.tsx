import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { MessageSquare, Bug, Send } from "lucide-react";

const feedbackSchema = z.object({
  type: z.enum(["issue", "feedback"]),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(10, "Please provide more details (at least 10 characters)"),
  email: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high"]).optional(),
  device: z.string().optional(),
  browser: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

export default function Feedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "feedback",
      subject: "",
      description: "",
      email: "",
      priority: "medium",
      device: "",
      browser: "",
    },
  });

  const submitFeedback = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      return apiRequest("POST", "/api/feedback", data);
    },
    onSuccess: () => {
      toast({
        title: "Feedback sent!",
        description: "Thank you for helping us improve Playback Stories.",
      });
      form.reset();
      setIsSubmitting(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send feedback",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const watchType = form.watch("type");

  const onSubmit = (data: FeedbackFormData) => {
    setIsSubmitting(true);
    submitFeedback.mutate(data);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center space-x-3">
          <MessageSquare className="w-8 h-8 text-spotify-green" />
          <h1 className="text-4xl font-bold gradient-text">Feedback</h1>
        </div>
        <p className="text-xl text-gray-600">
          Help us make ThisSongThatTime better for everyone
        </p>
      </div>

      {/* Feedback Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="text-center border-2 border-red-200 hover:border-red-300 transition-colors">
          <CardContent className="pt-6">
            <Bug className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-semibold text-red-700">Something's Not Working</h3>
            <p className="text-sm text-gray-600">Report issues you're experiencing</p>
          </CardContent>
        </Card>

        <Card className="text-center border-2 border-blue-200 hover:border-blue-300 transition-colors">
          <CardContent className="pt-6">
            <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-700">Ideas & Suggestions</h3>
            <p className="text-sm text-gray-600">Share ideas, requests, or general thoughts</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Form */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Feedback Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What type of feedback do you have?</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 gap-3">
                        <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="issue" id="issue" />
                          <div className="flex-1">
                            <Label htmlFor="issue" className="font-medium cursor-pointer flex items-center">
                              <Bug className="w-4 h-4 text-red-500 mr-2" />
                              Something's Not Working
                            </Label>
                            <p className="text-sm text-gray-600">Report issues you're experiencing with the app</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="feedback" id="feedback-option" />
                          <div className="flex-1">
                            <Label htmlFor="feedback-option" className="font-medium cursor-pointer flex items-center">
                              <MessageSquare className="w-4 h-4 text-blue-500 mr-2" />
                              Ideas & Suggestions
                            </Label>
                            <p className="text-sm text-gray-600">Share ideas, feature requests, or general thoughts</p>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority field - only show for issues */}
              {watchType === "issue" && (
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How urgent is this issue?</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                            <SelectItem value="medium">Medium - Noticeable problem</SelectItem>
                            <SelectItem value="high">High - Major issue preventing use</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Subject */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchType === "issue" ? "Brief description of the issue" : "What's this about?"}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder={
                          watchType === "issue" ? "e.g., Can't save story" : "e.g., Love the AI story feature"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {watchType === "issue" ? "What happened? What did you expect to happen?" : "Tell us more"}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={5}
                        placeholder={
                          watchType === "issue" 
                            ? "Please describe the issue in detail. What steps led to this problem? What did you expect to happen instead?"
                            : "Share your thoughts, ideas, or suggestions. The more detail, the better!"
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Technical details - show for issues */}
              {watchType === "issue" && (
                <>
                  <FormField
                    control={form.control}
                    name="device"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., iPhone 13, Windows laptop, etc." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="browser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Browser (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Chrome, Safari, Firefox, etc." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your email (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="If you'd like us to follow up" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={submitFeedback.isPending}
              >
                {submitFeedback.isPending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}