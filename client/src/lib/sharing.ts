import type { StoryWithDetails } from "@shared/schema";

export interface ShareData {
  title: string;
  text: string;
  url: string;
  hashtags: string[];
  image?: string;
}

export function generateStoryShareData(story: StoryWithDetails): ShareData {
  const baseUrl = window.location.origin;
  const storyUrl = `${baseUrl}/story/${story.id}`;
  
  // Generate dynamic preview text
  const previewText = generatePreviewText(story);
  
  // Generate relevant hashtags
  const hashtags = generateHashtags(story);
  
  return {
    title: `Musical Memory: ${story.title}`,
    text: previewText,
    url: storyUrl,
    hashtags,
    image: story.song.albumArt || undefined
  };
}

function generatePreviewText(story: StoryWithDetails): string {
  const songInfo = `${story.song.title} by ${story.song.artist}`;
  const truncatedContent = story.content.length > 100 
    ? story.content.substring(0, 97) + "..." 
    : story.content;
    
  return `🎵 "${story.title}" - A musical memory about ${songInfo}\n\n${truncatedContent}\n\nRead the full story at:`;
}

function generateHashtags(story: StoryWithDetails): string[] {
  const baseHashtags = ['musicalMemory', 'musicStory', 'memories'];
  
  // Add genre-based hashtags
  if (story.song.genre) {
    const genreTag = story.song.genre.toLowerCase().replace(/\s+/g, '');
    baseHashtags.push(genreTag);
  }
  
  // Add decade-based hashtags
  if (story.song.year) {
    const decade = Math.floor(story.song.year / 10) * 10;
    baseHashtags.push(`${decade}sMusic`);
  }
  
  // Add artist hashtag (clean version)
  const artistTag = story.song.artist
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 15);
  if (artistTag) {
    baseHashtags.push(artistTag);
  }
  
  return baseHashtags;
}

export function shareToTwitter(shareData: ShareData): void {
  const hashtags = shareData.hashtags.map(tag => `#${tag}`).join(' ');
  const text = `${shareData.text} ${shareData.url} ${hashtags}`;
  const encodedText = encodeURIComponent(text);
  
  window.open(
    `https://twitter.com/intent/tweet?text=${encodedText}`,
    '_blank',
    'width=550,height=420'
  );
}

export function shareToFacebook(shareData: ShareData): void {
  const encodedUrl = encodeURIComponent(shareData.url);
  const encodedQuote = encodeURIComponent(shareData.text);
  
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedQuote}`,
    '_blank',
    'width=580,height=400'
  );
}

export function shareToInstagram(shareData: ShareData): void {
  // Instagram doesn't support direct URL sharing, so we copy the text
  const hashtags = shareData.hashtags.map(tag => `#${tag}`).join(' ');
  const instagramText = `${shareData.text}\n\n${hashtags}\n\nLink in bio: ${shareData.url}`;
  
  copyToClipboard({ ...shareData, text: instagramText });
  
  // Try to open Instagram
  try {
    window.open('https://www.instagram.com/', '_blank');
  } catch (e) {
    // Fallback - just copy to clipboard
  }
}

export function shareToWhatsApp(shareData: ShareData): void {
  const text = `${shareData.text}\n\n${shareData.url}`;
  const encodedText = encodeURIComponent(text);
  
  // Try WhatsApp Web first, then mobile app
  const whatsappUrl = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    ? `whatsapp://send?text=${encodedText}`
    : `https://web.whatsapp.com/send?text=${encodedText}`;
    
  window.open(whatsappUrl, '_blank');
}

export function shareViaEmail(shareData: ShareData): void {
  const subject = encodeURIComponent(shareData.title);
  const body = encodeURIComponent(
    `${shareData.text}\n\nRead the full story: ${shareData.url}\n\nShared via Musical Memory Platform`
  );
  
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

export async function copyToClipboard(shareData: ShareData): Promise<boolean> {
  try {
    const textToCopy = `${shareData.text}\n\n${shareData.url}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(textToCopy);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = textToCopy;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const copied = document.execCommand('copy');
      document.body.removeChild(textArea);
      return copied;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export async function shareViaWebAPI(shareData: ShareData): Promise<boolean> {
  if (!navigator.share) return false;
  
  try {
    await navigator.share({
      title: shareData.title,
      text: shareData.text,
      url: shareData.url
    });
    return true;
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      console.error('Web Share API failed:', error);
    }
    return false;
  }
}

export function canUseWebShare(): boolean {
  return 'share' in navigator;
}

// Generate dynamic Open Graph meta tags for social media previews
export function generateOpenGraphMeta(story: StoryWithDetails): string {
  const shareData = generateStoryShareData(story);
  
  return `
    <meta property="og:title" content="${shareData.title}" />
    <meta property="og:description" content="${shareData.text.replace(/\n/g, ' ').substring(0, 160)}" />
    <meta property="og:url" content="${shareData.url}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Musical Memory Platform" />
    ${shareData.image ? `<meta property="og:image" content="${shareData.image}" />` : ''}
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${shareData.title}" />
    <meta name="twitter:description" content="${shareData.text.replace(/\n/g, ' ').substring(0, 200)}" />
    ${shareData.image ? `<meta name="twitter:image" content="${shareData.image}" />` : ''}
    
    <meta name="description" content="${shareData.text.replace(/\n/g, ' ').substring(0, 160)}" />
  `;
}

// Generate shareable image with story preview
export function generateShareImage(story: StoryWithDetails): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve('');
      return;
    }
    
    // Set canvas size for social media sharing
    canvas.width = 1200;
    canvas.height = 630;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Wrap text
    const title = story.title;
    const maxWidth = canvas.width - 100;
    const words = title.split(' ');
    let line = '';
    let y = 200;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width / 2, y);
        line = words[n] + ' ';
        y += 60;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width / 2, y);
    
    // Add song info
    ctx.font = '32px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    const songInfo = `${story.song.title} by ${story.song.artist}`;
    ctx.fillText(songInfo, canvas.width / 2, y + 80);
    
    // Add author
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(`by ${story.authorName}`, canvas.width / 2, y + 120);
    
    // Add musical note emoji
    ctx.font = '64px system-ui, -apple-system, sans-serif';
    ctx.fillText('🎵', canvas.width / 2, 100);
    
    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/png');
    resolve(dataUrl);
  });
}