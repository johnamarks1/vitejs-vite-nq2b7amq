export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export async function searchListings(query: string, filters?: any) {
  const apiUrl = `${supabaseConfig.url}/functions/v1/search-listings`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseConfig.anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, filters }),
  });

  if (!response.ok) {
    throw new Error('Failed to search listings');
  }

  return response.json();
}
