
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AudioStoryRecorderProps {
  onTranscriptionComplete: (transcription: {
    title?: string;
    content?: string;
    age?: string;
    coreMemory?: string;
    emotionalConnection?: string;
    lifeContext?: string;
    discoveryMoment?: string;
  }) => void;
  song: { title: string; artist: string } | null;
}

export default function AudioStoryRecorder({ onTranscriptionComplete, song }: AudioStoryRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording Started",
        description: "Tell us about your memory with this song. Include your age, what was happening in your life, and how you discovered it.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "You can now play back your recording or transcribe it into text.",
      });
    }
  };

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      if (song) {
        formData.append('songTitle', song.title);
        formData.append('artist', song.artist);
      }

      const response = await fetch('/api/transcribe-story', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      
      // Extract structured data from transcription
      onTranscriptionComplete(result.extractedData);
      
      toast({
        title: "Transcription Complete",
        description: "Your voice story has been converted to text and organized into the form fields.",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription Failed",
        description: "Could not transcribe your recording. Please try again or use text input.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <Card className="border-l-4 border-orange-500 bg-gradient-to-r from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="text-xl text-orange-800 flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Voice Your Memory
        </CardTitle>
        <p className="text-orange-700">
          Speak your story and we'll transcribe it into the form fields below. 
          Make sure to mention your age, what was happening in your life, and how you discovered this song.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Recording Prompt */}
        {!audioBlob && (
          <div className="bg-orange-100 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2">What to include in your recording:</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• A title for your memory</li>
              <li>• How old you were (or age range)</li>
              <li>• What was happening in your life at the time</li>
              <li>• How you discovered this song</li>
              <li>• Your main memory with the song</li>
              <li>• How it makes you feel now</li>
            </ul>
          </div>
        )}

        {/* Recording Controls */}
        <div className="flex gap-3 items-center">
          {!isRecording && !audioBlob && (
            <Button
              onClick={startRecording}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </Button>
          )}

          {audioBlob && (
            <>
              <Button
                onClick={playRecording}
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-50"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 mr-2" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isPlaying ? 'Pause' : 'Play Back'}
              </Button>

              <Button
                onClick={resetRecording}
                variant="outline"
                className="border-gray-500 text-gray-600 hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Re-record
              </Button>

              <Button
                onClick={transcribeAudio}
                disabled={isTranscribing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isTranscribing ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" />
                    Transcribe to Text
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Hidden audio element for playback */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            style={{ display: 'none' }}
          />
        )}

        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording in progress...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
