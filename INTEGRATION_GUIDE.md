# REFinder - Real Listing Integration Guide

This guide explains how to integrate real property listings from multiple sources into REFinder.

## Current Status

✅ **Completed:**
- Database schema for storing listings
- Edge function infrastructure for fetching listings
- UI displays sample data and is ready for real data

⚠️ **To Complete:**
You need to obtain API access and integrate with real estate platforms.

## Required API Integrations

### 1. Zillow API
- **Sign up:** https://www.zillow.com/howto/api/APIOverview.htm
- **Note:** Zillow has deprecated public API access. Alternative: Use their RapidAPI marketplace or third-party scrapers
- **Alternative:** Use RapidAPI's Zillow scraper: https://rapidapi.com/apimaker/api/zillow-com1

### 2. Land.com
- **Contact:** Land.com does not have a public API. You'll need to:
  - Contact their business development team for data partnership
  - Use web scraping (check their Terms of Service)
  - Use RSS feeds if available

### 3. Crexi (Commercial Real Estate)
- **Sign up:** https://www.crexi.com/api
- **Requirements:** Requires business partnership or broker relationship
- **Alternative:** Web scraping with proper rate limiting

### 4. LoopNet
- **Sign up:** https://www.loopnet.com
- **Note:** No public API - requires business partnership with CoStar (parent company)
- **Alternative:** Web scraping or third-party data providers

## Implementation Steps

### Step 1: Add API Keys to Environment

The edge function will need API keys. Add them as environment variables:

```bash
# These are automatically available in edge functions
ZILLOW_API_KEY=your_key_here
LANDCOM_API_KEY=your_key_here
CREXI_API_KEY=your_key_here
LOOPNET_API_KEY=your_key_here
```

### Step 2: Update Edge Function

Edit `supabase/functions/search-listings/index.ts` to fetch from real sources:

```typescript
// Example: Fetching from Zillow via RapidAPI
async function fetchZillowListings(query: string, filters: any) {
  const response = await fetch('https://zillow-com1.p.rapidapi.com/propertyExtendedSearch', {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': Deno.env.get('RAPIDAPI_KEY'),
      'X-RapidAPI-Host': 'zillow-com1.p.rapidapi.com',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      location: filters.location || 'Alabama',
      status_type: 'ForSale',
      home_type: 'Lots',
    }),
  });

  return response.json();
}
```

### Step 3: Store Listings in Database

Update the edge function to save listings to the database:

```typescript
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Insert or update listings
const { data, error } = await supabase
  .from('listings')
  .upsert(listings, { onConflict: 'external_id' });
```

### Step 4: Implement AI Scoring

Use AI to score each listing based on the user's query:

```typescript
// Example: Using Claude to score matches
async function scoreListingMatch(listing: any, query: string) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Rate this property from 0-100 on how well it matches: "${query}". Property: ${listing.title}, ${listing.acres} acres, $${listing.price_per_acre}/acre, ${listing.location}. Respond with just a number and brief reason.`
      }]
    })
  });

  const result = await response.json();
  return parseScore(result.content[0].text);
}
```

## Alternative: Web Scraping Approach

If APIs aren't available, you can scrape listings (check Terms of Service first):

```typescript
// Example using cheerio for scraping
import * as cheerio from 'npm:cheerio';

async function scrapeLandCom(searchTerm: string) {
  const response = await fetch(`https://www.land.com/search/${searchTerm}`);
  const html = await response.text();
  const $ = cheerio.load(html);

  const listings = [];
  $('.property-card').each((i, el) => {
    listings.push({
      title: $(el).find('.title').text(),
      price: parsePrice($(el).find('.price').text()),
      acres: parseAcres($(el).find('.acres').text()),
      // ... more fields
    });
  });

  return listings;
}
```

## Recommended Third-Party Data Providers

Instead of building scrapers, consider these data providers:

1. **Estated API** - Property data API
2. **Attom Data Solutions** - Comprehensive real estate data
3. **DataFiniti** - Real estate listings aggregator
4. **Bright MLS** - MLS data (requires broker license)

## Testing

Currently, the app shows sample data. Once you implement real sources:

1. Test with small queries first
2. Monitor API rate limits
3. Cache results in the database
4. Set up error handling and fallbacks

## Cost Considerations

- **API Costs:** Most real estate APIs charge per request ($0.001 - $0.10 per query)
- **Rate Limits:** Implement caching to avoid hitting limits
- **Database Storage:** Current schema supports unlimited listings
- **Edge Function Costs:** Supabase edge functions are free for reasonable usage

## Next Steps

1. Choose your data sources (APIs vs scraping vs third-party providers)
2. Sign up and get API keys
3. Update the edge function with real integrations
4. Test thoroughly with various search queries
5. Implement caching and rate limiting
6. Set up monitoring and error alerts

## Support

For questions about implementation, check:
- Supabase Edge Functions docs: https://supabase.com/docs/guides/functions
- Real estate API comparisons: https://www.programmableweb.com/category/real-estate/apis
