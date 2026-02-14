import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Twitter, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Copy,
  Download,
  ExternalLink
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";
import { 
  generateStoryShareData, 
  generateShareImage,
  shareToTwitter,
  shareToFacebook,
  shareToInstagram,
  shareToWhatsApp,
  copyToClipboard,
  type ShareData
} from "@/lib/sharing";
import type { StoryWithDetails } from "@shared/schema";

interface SharePreviewModalProps {
  story: StoryWithDetails;
  isOpen: boolean;
  onClose: () => void;
}

export default function SharePreviewModal({ story, isOpen, onClose }: SharePreviewModalProps) {
  const { toast } = useToast();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [shareImage, setShareImage] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  useEffect(() => {
    if (isOpen && story) {
      const data = generateStoryShareData(story);
      setShareData(data);
      
      // Generate share image
      setIsGeneratingImage(true);
      generateShareImage(story).then((imageUrl) => {
        setShareImage(imageUrl);
        setIsGeneratingImage(false);
      });
    }
  }, [isOpen, story]);

  const handleShare = async (platform: string) => {
    if (!shareData) return;
    
    try {
      switch (platform) {
        case 'twitter':
          shareToTwitter(shareData);
          toast({
            title: "Shared to Twitter",
            description: "Opening Twitter in a new window",
          });
          break;
          
        case 'facebook':
          shareToFacebook(shareData);
          toast({
            title: "Shared to Facebook",
            description: "Opening Facebook in a new window",
          });
          break;
          
        case 'instagram':
          shareToInstagram(shareData);
          toast({
            title: "Content copied for Instagram",
            description: "Paste the text in your Instagram post",
          });
          break;
          
        case 'whatsapp':
          shareToWhatsApp(shareData);
          toast({
            title: "Shared to WhatsApp",
            description: "Opening WhatsApp in a new window",
          });
          break;
          
        case 'copy':
          const copied = await copyToClipboard(shareData);
          if (copied) {
            toast({
              title: "Link copied",
              description: "Story link copied to clipboard",
            });
          }
          break;
      }
      onClose();
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const downloadShareImage = () => {
    if (!shareImage) return;
    
    const link = document.createElement('a');
    link.download = `${story.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_share.png`;
    link.href = shareImage;
    link.click();
    
    toast({
      title: "Image downloaded",
      description: "Share image saved to your device",
    });
  };

  if (!shareData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Share Your Musical Memory
          </DialogTitle>
          <DialogDescription>
            Preview how your story will appear on different social media platforms
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">Platform Previews</TabsTrigger>
            <TabsTrigger value="image">Share Image</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-6 mt-6">
            
            {/* Twitter Preview */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Twitter className="w-5 h-5" />
                  Twitter Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">You</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-500 mb-2">@yourusername · now</div>
                      <div className="text-gray-900 mb-3">
                        {shareData.text}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {shareData.hashtags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-blue-600">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="text-sm font-semibold text-gray-900">{shareData.title}</div>
                        <div className="text-sm text-gray-500 mt-1">Musical Memory Platform</div>
                      </div>
                    </div>
                  </div>
                </div>
                <Button onClick={() => handleShare('twitter')} className="w-full">
                  <Twitter className="w-4 h-4 mr-2" />
                  Share on Twitter
                </Button>
              </CardContent>
            </Card>

            {/* Facebook Preview */}
            <Card className="border-blue-600">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Facebook className="w-5 h-5" />
                  Facebook Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">You</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Your Name</div>
                      <div className="text-sm text-gray-500">Just now</div>
                    </div>
                  </div>
                  <div className="text-gray-900 mb-3">{shareData.text}</div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {story.song.albumArt && (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <img 
                          src={story.song.albumArt} 
                          alt={story.song.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-3 bg-gray-50">
                      <div className="font-semibold text-gray-900">{shareData.title}</div>
                      <div className="text-sm text-gray-500">Musical Memory Platform</div>
                    </div>
                  </div>
                </div>
                <Button onClick={() => handleShare('facebook')} className="w-full">
                  <Facebook className="w-4 h-4 mr-2" />
                  Share on Facebook
                </Button>
              </CardContent>
            </Card>

            {/* Instagram Preview */}
            <Card className="border-pink-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-pink-600">
                  <Instagram className="w-5 h-5" />
                  Instagram Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="text-gray-900 mb-3">
                    {shareData.text}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {shareData.hashtags.map((tag) => (
                      <span key={tag} className="text-blue-600">#{tag} </span>
                    ))}
                  </div>
                  <div className="text-sm text-gray-500">
                    Link in bio: {shareData.url}
                  </div>
                </div>
                <Button onClick={() => handleShare('instagram')} className="w-full">
                  <Instagram className="w-4 h-4 mr-2" />
                  Copy for Instagram
                </Button>
              </CardContent>
            </Card>

            {/* WhatsApp Preview */}
            <Card className="border-green-400">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <SiWhatsapp className="w-5 h-5" />
                  WhatsApp Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-gray-900 whitespace-pre-line">
                      {shareData.text}
                      {"\n\n"}
                      {shareData.url}
                    </div>
                  </div>
                </div>
                <Button onClick={() => handleShare('whatsapp')} className="w-full">
                  <SiWhatsapp className="w-4 h-4 mr-2" />
                  Share on WhatsApp
                </Button>
              </CardContent>
            </Card>

          </TabsContent>

          <TabsContent value="image" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Share Image</CardTitle>
                <DialogDescription>
                  A custom image created for your story that's optimized for social media sharing
                </DialogDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isGeneratingImage ? (
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <div className="text-gray-600">Generating share image...</div>
                    </div>
                  </div>
                ) : shareImage ? (
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={shareImage} 
                        alt="Share preview" 
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={downloadShareImage} variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download Image
                      </Button>
                      <Button onClick={() => handleShare('copy')} variant="outline" className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-gray-600">Failed to generate image</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </DialogContent>
    </Dialog>
  );
}