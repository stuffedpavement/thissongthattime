
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudioToStory(audioBuffer: Buffer, songTitle?: string, artist?: string) {
  try {
    // First, transcribe the audio to text
    const transcription = await openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.wav', { type: 'audio/wav' }),
      model: 'whisper-1',
      language: 'en',
    });

    const transcript = transcription.text;

    // Then use GPT to extract structured story data
    const extractionPrompt = `
You are helping to organize a voice recording into structured story fields for a music memory platform.

The user recorded themselves talking about a song memory. Extract the following information from their recording:

Song: ${songTitle ? `"${songTitle}" by ${artist}` : 'Unknown song'}

From this transcript, extract:
1. A compelling title for their story (if they mention one, or create one based on the memory)
2. Their age when this happened (look for age mentions, school levels, life stages)
3. Life context (what was happening in their life)
4. How they discovered the song
5. Their main memory with the song
6. How it makes them feel now
7. Any other story content that doesn't fit the above categories

Transcript: "${transcript}"

Respond in JSON format:
{
  "title": "extracted or suggested title",
  "age": "age range like '15-19' or 'In my 20s'",
  "lifeContext": "what was happening in their life",
  "discoveryMoment": "how they found the song",
  "coreMemory": "main memory with the song",
  "emotionalConnection": "current feelings about it",
  "content": "any additional story content or a flowing narrative version"
}

If any field cannot be determined from the transcript, set it to null.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting structured data from personal stories about music memories.'
        },
        {
          role: 'user',
          content: extractionPrompt
        }
      ],
      temperature: 0.3,
    });

    const extractedData = JSON.parse(completion.choices[0].message.content || '{}');
    
    return {
      rawTranscript: transcript,
      extractedData,
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error('Failed to transcribe audio');
  }
}
