import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ score: 0, feedback: null, revealBonus: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const conversationText = messages
      .filter((m: any) => m.senderId !== "system")
      .map((m: any) => `${m.senderId === "me" ? "User" : "Match"}: ${m.text}`)
      .join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are analyzing a dating app conversation to measure connection quality.
            
This is for a dating app called "Lumo" where photos are pixelated and gradually reveal based on genuine conversation quality.

Analyze the conversation and return a JSON object with these fields:
- connectionScore: number 0-100 (overall connection quality - be STRICT, progress should be slow and earned)
- positiveIndicators: array of positive signs
- improvementAreas: array of things that could be better
- feedback: a short, encouraging message (max 50 chars) to show the user if the conversation is going well (null if score < 30)
- revealBonus: number 0-8 (extra reveal percentage - be CONSERVATIVE, max 8% per analysis)
- phoneExchangeDetected: boolean (true if either person mentions exchanging phone numbers, WhatsApp, calling, or moving to another platform)

SCORING GUIDELINES (be strict - connection takes time):
- 0-15: Generic greetings, one-word answers, surface level
- 15-30: Basic back-and-forth, some questions asked
- 30-50: Genuine curiosity shown, sharing personal stories, humor
- 50-70: Emotional depth, vulnerability, meaningful topics, mutual interest
- 70-85: Deep authentic connection, both sides engaged equally
- 85-100: Exceptional chemistry, should be rare

REVEAL BONUS RULES (slow and meaningful):
- 0-2%: Basic conversation, just chatting
- 2-4%: Good quality, genuine interest shown  
- 4-6%: Deep meaningful conversation
- 6-8%: Exceptional connection, both deeply engaged

If phoneExchangeDetected is true, add a small bonus (2-3%) as it indicates real interest.

DO NOT give high scores for short conversations. 
Length matters - 5 messages should not score above 25.
10 messages should not score above 45.
Quality AND quantity both matter.

Return ONLY valid JSON, no markdown.`
          },
          {
            role: "user",
            content: `Analyze this conversation (${messages.length} total messages):\n\n${conversationText}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    let analysis;
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Conservative fallback
      const msgCount = messages.length;
      analysis = {
        connectionScore: Math.min(30, msgCount * 2),
        feedback: msgCount >= 10 ? "Keep going! ✨" : null,
        revealBonus: Math.min(5, Math.floor(msgCount / 4)),
        phoneExchangeDetected: false,
      };
    }

    // Cap reveal bonus at 8%
    const revealBonus = Math.min(8, analysis.revealBonus || 0);
    // Add small bonus for phone exchange
    const phoneBonus = analysis.phoneExchangeDetected ? 3 : 0;

    return new Response(
      JSON.stringify({
        score: Math.min(100, analysis.connectionScore || 0),
        feedback: analysis.feedback || null,
        revealBonus: revealBonus + phoneBonus,
        positiveIndicators: analysis.positiveIndicators || [],
        improvementAreas: analysis.improvementAreas || [],
        phoneExchangeDetected: analysis.phoneExchangeDetected || false,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("analyze-conversation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        score: 0, feedback: null, revealBonus: 0
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
