/*
  # Create Listings Schema for REFinder

  ## New Tables
  
  ### `listings`
  - `id` (uuid, primary key) - Unique identifier for each listing
  - `external_id` (text, unique) - ID from the source platform
  - `source` (text) - Source platform (Land.com, Zillow, Crexi, LoopNet, etc.)
  - `title` (text) - Property title
  - `description` (text) - Full property description
  - `price` (numeric) - Total price in USD
  - `acres` (numeric) - Property size in acres
  - `price_per_acre` (numeric) - Calculated price per acre
  - `location` (text) - City/County/State location
  - `address` (text, nullable) - Full address if available
  - `latitude` (numeric, nullable) - GPS latitude
  - `longitude` (numeric, nullable) - GPS longitude
  - `property_type` (text) - Type (Hunting, Timber, Recreational, etc.)
  - `tags` (jsonb) - Array of feature tags (Road Frontage, Creek, etc.)
  - `images` (jsonb) - Array of image URLs
  - `source_url` (text) - Link to original listing
  - `distance_info` (text, nullable) - Distance from reference points
  - `created_at` (timestamptz) - When listing was added
  - `updated_at` (timestamptz) - Last update timestamp
  - `is_active` (boolean) - Whether listing is still available

  ### `saved_searches`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users) - User who saved the search
  - `name` (text) - Name of the saved search
  - `query` (text) - The natural language query
  - `filters` (jsonb) - Structured filters extracted from query
  - `is_active` (boolean) - Whether alerts are enabled
  - `last_match_at` (timestamptz, nullable) - Last time new matches were found
  - `match_count` (integer) - Number of current matches
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `favorites`
  - `id` (uuid, primary key)
  - `user_id` (uuid, references auth.users)
  - `listing_id` (uuid, references listings)
  - `created_at` (timestamptz)
  - Unique constraint on (user_id, listing_id)

  ### `ai_match_scores`
  - `id` (uuid, primary key)
  - `listing_id` (uuid, references listings)
  - `search_query` (text) - The query that generated this score
  - `score` (integer) - Match score 0-100
  - `reasoning` (text) - AI explanation of the score
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only access their own saved searches and favorites
  - Listings are publicly readable
  - AI match scores are publicly readable
*/

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text UNIQUE NOT NULL,
  source text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  acres numeric NOT NULL,
  price_per_acre numeric NOT NULL,
  location text NOT NULL,
  address text,
  latitude numeric,
  longitude numeric,
  property_type text NOT NULL,
  tags jsonb DEFAULT '[]'::jsonb,
  images jsonb DEFAULT '[]'::jsonb,
  source_url text NOT NULL,
  distance_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Listings are publicly readable"
  ON listings FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_listings_source ON listings(source);
CREATE INDEX IF NOT EXISTS idx_listings_price_per_acre ON listings(price_per_acre);
CREATE INDEX IF NOT EXISTS idx_listings_acres ON listings(acres);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);

CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  query text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  last_match_at timestamptz,
  match_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own saved searches"
  ON saved_searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON favorites(listing_id);

CREATE TABLE IF NOT EXISTS ai_match_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  search_query text NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  reasoning text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_match_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AI match scores are publicly readable"
  ON ai_match_scores FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_ai_match_scores_listing_id ON ai_match_scores(listing_id);
CREATE INDEX IF NOT EXISTS idx_ai_match_scores_score ON ai_match_scores(score DESC);
