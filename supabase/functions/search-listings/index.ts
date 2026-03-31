import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SearchRequest {
  query: string;
  filters?: {
    minAcres?: number;
    maxAcres?: number;
    maxPricePerAcre?: number;
    location?: string;
    propertyTypes?: string[];
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { query, filters }: SearchRequest = await req.json();

    const mockListings = [
      {
        id: "1",
        external_id: "land_com_12345",
        source: "Land.com",
        title: "Rolling Timber Tract – Cleburne County",
        description: "Prime hunting tract with mature hardwood timber, seasonal creek, established food plots, and county road frontage. Power available at road.",
        price: 485000,
        acres: 142,
        price_per_acre: 3415,
        location: "Cleburne County, AL",
        latitude: 33.68,
        longitude: -85.52,
        property_type: "Hunting / Timber",
        tags: ["Road Frontage", "Creek", "Timber", "Deer Stand"],
        images: ["https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80"],
        source_url: "https://land.com/listing/12345",
        distance_info: "1h 45m from Birmingham",
        is_active: true,
      },
      {
        id: "2",
        external_id: "zillow_67890",
        source: "Zillow",
        title: "Subdividable Pasture & Timber – Tallapoosa Co.",
        description: "Large subdividable parcel with highway frontage, water & power at road. Mix of open pasture and pine timber. Survey stakes in place.",
        price: 612000,
        acres: 198,
        price_per_acre: 3090,
        location: "Tallapoosa County, AL",
        latitude: 32.87,
        longitude: -85.77,
        property_type: "Recreational / Subdividable",
        tags: ["Subdividable", "Road Frontage", "Utilities", "Open Pasture"],
        images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80"],
        source_url: "https://zillow.com/listing/67890",
        distance_info: "1h 20m from Birmingham",
        is_active: true,
      },
    ];

    const aiMatchScores = mockListings.map((listing, idx) => ({
      listing_id: listing.id,
      score: 94 - idx * 3,
      reasoning: `Strong match for your query: "${query}". Meets acreage and price requirements.`,
    }));

    const response = {
      success: true,
      count: mockListings.length,
      listings: mockListings,
      ai_scores: aiMatchScores,
      parsed_filters: filters || {
        location: "Within 2hr of Birmingham, AL",
        pricePerAcre: "≤ $4,000/acre",
        acreage: "50–200 acres",
        type: "Hunting / Recreational",
        keywords: ["road frontage", "creek", "timber"],
      },
      message: `Found ${mockListings.length} properties. To integrate real listings, you'll need to:
1. Sign up for APIs from Land.com, Zillow, Crexi, LoopNet
2. Add API keys as Supabase Edge Function secrets
3. Implement scrapers or API clients for each platform
4. Store listings in the database for caching and performance`,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to search listings",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
