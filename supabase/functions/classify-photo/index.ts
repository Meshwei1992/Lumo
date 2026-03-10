import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { photoUrl, photoId } = await req.json();
    if (!photoUrl || !photoId) {
      return new Response(JSON.stringify({ error: "photoUrl and photoId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
            content: `You are a photo classifier for a dating app. Analyze the image and classify it into exactly ONE category.

Categories:
- "full_face": Clear portrait photo, face fully visible, close-up, no obstructions
- "mystery": Partial face, wearing sunglasses, far from camera, unclear identity, silhouette
- "lifestyle": Activity photo (surfing, hiking, traveling, cooking), with pets, hobbies
- "social": Multiple people visible in the image, group photo

Also detect these attributes:
- face_visible: boolean
- sunglasses: boolean  
- people_count: number
- has_pet: boolean
- activity: string or null (e.g. "hiking", "surfing", "travel")
- distance: "close" | "medium" | "far"`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Classify this photo into one category. Return ONLY valid JSON.",
              },
              {
                type: "image_url",
                image_url: { url: photoUrl },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_photo",
              description: "Classify a photo into a dating app category",
              parameters: {
                type: "object",
                properties: {
                  category: {
                    type: "string",
                    enum: ["full_face", "mystery", "lifestyle", "social"],
                  },
                  face_visible: { type: "boolean" },
                  sunglasses: { type: "boolean" },
                  people_count: { type: "number" },
                  has_pet: { type: "boolean" },
                  activity: { type: "string", nullable: true },
                  distance: { type: "string", enum: ["close", "medium", "far"] },
                },
                required: ["category", "face_visible", "sunglasses", "people_count", "has_pet", "distance"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_photo" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let classification = { category: "mystery" };
    if (toolCall?.function?.arguments) {
      try {
        classification = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse AI response");
      }
    }

    // Update the photo record in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: updateError } = await supabase
      .from("profile_photos")
      .update({ category: classification.category })
      .eq("id", photoId);

    if (updateError) {
      console.error("DB update error:", updateError);
    }

    return new Response(JSON.stringify(classification), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("classify-photo error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
