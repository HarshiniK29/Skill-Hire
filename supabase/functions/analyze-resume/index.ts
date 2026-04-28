// Edge function: analyze-resume
// Receives extracted resume text and returns ATS score + suggestions via Lovable AI.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) and resume coach.
Analyze the provided resume text. Be strict but constructive.
Return a structured analysis with:
- An ATS-friendliness score from 0 to 100
- A 1-2 sentence summary
- 3-6 concrete strengths
- 3-6 weaknesses or risks
- 5-8 specific, actionable suggestions to improve the resume
- Keywords that are present and important
- Common keywords missing for the candidate's apparent role`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeText, fileName } = await req.json();

    if (!resumeText || typeof resumeText !== "string" || resumeText.trim().length < 50) {
      return new Response(
        JSON.stringify({ error: "Resume text is too short or missing." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const trimmed = resumeText.slice(0, 20000);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: `File name: ${fileName ?? "resume"}\n\nResume content:\n"""\n${trimmed}\n"""`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "submit_ats_analysis",
                description: "Return the structured ATS analysis.",
                parameters: {
                  type: "object",
                  properties: {
                    score: { type: "integer", minimum: 0, maximum: 100 },
                    summary: { type: "string" },
                    strengths: { type: "array", items: { type: "string" } },
                    weaknesses: { type: "array", items: { type: "string" } },
                    suggestions: { type: "array", items: { type: "string" } },
                    keywords_found: { type: "array", items: { type: "string" } },
                    keywords_missing: { type: "array", items: { type: "string" } },
                  },
                  required: [
                    "score",
                    "summary",
                    "strengths",
                    "weaknesses",
                    "suggestions",
                    "keywords_found",
                    "keywords_missing",
                  ],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "submit_ats_analysis" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a minute." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call returned", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI returned no analysis." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(analysis), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-resume error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
