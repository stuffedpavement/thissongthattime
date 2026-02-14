import OpenAI from "openai";

// Using gpt-4o for high-quality story generation
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
});

interface StoryPrompts {
  // Core story fields
  age?: string;
  lifeContext?: string;
  discoveryMoment?: string;
  coreMemory?: string;
  emotionalConnection?: string;

  // Streamlined optional prompts
  worldContext?: string;
  sharedStory?: string;
  emotionalRole?: string;
  turningPoint?: string;
  musicalHook?: string;
  surprisingConnection?: string;
  messageToPastSelf?: string;
}

export async function generateStory(
  prompts: StoryPrompts, 
  tone: string, 
  songTitle?: string, 
  artist?: string
): Promise<string> {
  if (!openai.apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const songInfo = songTitle && artist ? `"${songTitle}" by ${artist}` : "this song";

  const systemPrompt = `You are helping someone write down their actual memory about a song. This is NOT creative writing - you're organizing real details they've shared into a clear, simple account.

STRICT RULES:
- Use only facts they provided - no invented details, emotions, or scenes
- Write like someone quickly telling a friend what happened
- No dramatic language, metaphors, or "storytelling" tone
- No interpretations of what things "meant" or "represented"
- No conclusions about life lessons or deeper significance
- Just state what happened, when, where, who was there
- Keep it matter-of-fact and straightforward
- If they didn't mention specific details (weather, clothes, exact location), don't add them
- Maximum 3-4 sentences unless they provided extensive details`;

  const userPrompt = `Here are the facts about someone's memory with ${songInfo}:

${prompts.age ? `- Age: ${prompts.age}` : ''}
${prompts.lifeContext ? `- Life context: ${prompts.lifeContext}` : ''}
${prompts.discoveryMoment ? `- Discovery moment: ${prompts.discoveryMoment}` : ''}
${prompts.coreMemory ? `- Core memory: ${prompts.coreMemory}` : ''}
${prompts.emotionalConnection ? `- Emotional connection: ${prompts.emotionalConnection}` : ''}
${prompts.worldContext ? `- World context: ${prompts.worldContext}` : ''}
${prompts.sharedStory ? `- Shared story: ${prompts.sharedStory}` : ''}
${prompts.emotionalRole ? `- Emotional role: ${prompts.emotionalRole}` : ''}
${prompts.turningPoint ? `- Turning point: ${prompts.turningPoint}` : ''}
${prompts.musicalHook ? `- Musical hook: ${prompts.musicalHook}` : ''}
${prompts.surprisingConnection ? `- Surprising connection: ${prompts.surprisingConnection}` : ''}
${prompts.messageToPastSelf ? `- Message to past self: ${prompts.messageToPastSelf}` : ''}

Write this as a straightforward first-person account. Just state what happened using the facts above. Don't embellish or interpret - just organize these details into a clear, simple memory.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const generatedStory = response.choices[0].message.content;

    if (!generatedStory) {
      throw new Error("No story content generated");
    }

    return generatedStory;
  } catch (error: any) {
    throw new Error(`Story generation failed: ${error.message}`);
  }
}

export async function enhanceStory(
  originalStory: string, 
  suggestions: string
): Promise<string> {
  if (!openai.apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const prompt = `The user wants to improve this memory about a song with these specific suggestions: ${suggestions}

Original memory:
${originalStory}

Revise the memory by incorporating only the suggested changes. Keep the same factual, straightforward tone. Don't add drama or interpretation - just make the requested adjustments while staying true to the original facts.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You help people revise their written memories about songs. Keep edits minimal and factual. Don't add creative interpretations or dramatic language." },
        { role: "user", content: prompt }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const enhancedStory = response.choices[0].message.content;

    if (!enhancedStory) {
      throw new Error("No enhanced story content generated");
    }

    return enhancedStory;
  } catch (error: any) {
    throw new Error(`Story enhancement failed: ${error.message}`);
  }
}