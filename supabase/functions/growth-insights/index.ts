import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GrowthMetrics {
  currentMRR: number;
  monthlyGrowthRate: number;
  avgRevenuePerUser: number;
  churnRate: number;
  customerAcquisitionCost: number;
  projectedARR: number;
  ltvCacRatio: number;
  customers: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const metrics: GrowthMetrics = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    console.log("Generating growth insights for metrics:", metrics);

    const systemPrompt = `You are an expert SaaS growth analyst and startup advisor. Analyze the provided metrics and give actionable, specific insights. Be direct and data-driven. Format your response as JSON with exactly this structure:
{
  "healthScore": <number 0-100>,
  "healthLabel": "<string: Excellent|Good|Fair|Needs Attention|Critical>",
  "primaryInsight": "<string: one sentence key takeaway>",
  "recommendations": ["<string>", "<string>", "<string>"],
  "risks": ["<string>", "<string>"],
  "opportunities": ["<string>", "<string>"]
}`;

    const userPrompt = `Analyze these SaaS growth metrics:
- Current MRR: $${metrics.currentMRR.toLocaleString()}
- Monthly Growth Rate: ${metrics.monthlyGrowthRate}%
- ARPU: $${metrics.avgRevenuePerUser}
- Churn Rate: ${metrics.churnRate}%
- CAC: $${metrics.customerAcquisitionCost}
- Projected ARR: $${metrics.projectedARR.toLocaleString()}
- LTV:CAC Ratio: ${metrics.ltvCacRatio.toFixed(1)}x
- Current Customers: ${metrics.customers}

Provide strategic insights based on these numbers. Consider industry benchmarks (e.g., healthy churn <5%, LTV:CAC >3x, growth >10% monthly for early stage).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");
    
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from the response (handle markdown code blocks)
    let insights;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1]?.trim() || content.trim();
      insights = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      // Return a fallback response
      insights = {
        healthScore: 70,
        healthLabel: "Good",
        primaryInsight: "Your metrics show solid growth potential with room for optimization.",
        recommendations: [
          "Focus on reducing churn to improve LTV",
          "Consider increasing prices if ARPU is below market",
          "Invest in customer success to boost retention"
        ],
        risks: [
          "Monitor churn rate closely",
          "Watch CAC efficiency as you scale"
        ],
        opportunities: [
          "Expand into adjacent market segments",
          "Implement annual billing for better cash flow"
        ]
      };
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in growth-insights function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate insights" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
