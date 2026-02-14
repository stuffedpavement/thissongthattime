import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Share, 
  Twitter, 
  Facebook, 
  Instagram, 
  Mail,
  Link2,
  Smartphone,
  Eye
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import SharePreviewModal from "./share-preview-modal";
import {
  generateStoryShareData,
  shareToTwitter,
  shareToFacebook,
  shareToInstagram,
  shareToWhatsApp,
  shareViaEmail,
  copyToClipboard,
  shareViaWebAPI,
  canUseWebShare
} from "@/lib/sharing";
import type { StoryWithDetails } from "@shared/schema";

interface ShareButtonProps {
  story: StoryWithDetails;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "default" | "lg";
  showLabel?: boolean;
}

export default function ShareButton({ 
  story, 
  variant = "ghost", 
  size = "sm",
  showLabel = true 
}: ShareButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const shareData = generateStoryShareData(story);

  const handleShare = async (platform: string) => {
    setIsOpen(false);
    
    try {
      switch (platform) {
        case 'preview':
          setShowPreview(true);
          break;
          
        case 'native':
          const shared = await shareViaWebAPI(shareData);
          if (shared) {
            toast({
              title: "Shared successfully!",
              description: "Story shared via your device",
            });
          }
          break;
          
        case 'twitter':
          shareToTwitter(shareData);
          toast({
            title: "Opening Twitter",
            description: "Share window opened",
          });
          break;
          
        case 'facebook':
          shareToFacebook(shareData);
          toast({
            title: "Opening Facebook",
            description: "Share window opened",
          });
          break;
          
        case 'instagram':
          shareToInstagram(shareData);
          toast({
            title: "Text copied for Instagram",
            description: "Paste in your Instagram post",
          });
          break;
          
        case 'whatsapp':
          shareToWhatsApp(shareData);
          toast({
            title: "Opening WhatsApp",
            description: "Share window opened",
          });
          break;
          
        case 'email':
          shareViaEmail(shareData);
          toast({
            title: "Opening email client",
            description: "Email draft created",
          });
          break;
          
        case 'copy':
          const copied = await copyToClipboard(shareData);
          if (copied) {
            toast({
              title: "Link copied!",
              description: "Story link copied to clipboard",
            });
          } else {
            toast({
              title: "Copy failed",
              description: "Please try again",
              variant: "destructive",
            });
          }
          break;
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className="gap-1">
            <Share className="w-4 h-4" />
            {showLabel && <span>Share</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => handleShare('preview')}>
            <Eye className="w-4 h-4 mr-2" />
            Preview & Share
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {canUseWebShare() && (
            <>
              <DropdownMenuItem onClick={() => handleShare('native')}>
                <Smartphone className="w-4 h-4 mr-2" />
                Share via device
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={() => handleShare('twitter')}>
            <Twitter className="w-4 h-4 mr-2" />
            Quick share to Twitter
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleShare('facebook')}>
            <Facebook className="w-4 h-4 mr-2" />
            Quick share to Facebook
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleShare('instagram')}>
            <Instagram className="w-4 h-4 mr-2" />
            Copy for Instagram
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
            <SiWhatsapp className="w-4 h-4 mr-2" />
            Share to WhatsApp
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleShare('email')}>
            <Mail className="w-4 h-4 mr-2" />
            Share via Email
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleShare('copy')}>
            <Link2 className="w-4 h-4 mr-2" />
            Copy link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <SharePreviewModal 
        story={story}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </>
  );
}