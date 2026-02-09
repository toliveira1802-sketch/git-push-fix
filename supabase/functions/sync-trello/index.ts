const ALLOWED_ORIGINS = [
  'https://pushy-pal-files.lovable.app',
  'https://id-preview--7175ffd2-29ee-4bd1-8af6-4ee556488123.lovable.app',
  'https://anlazsytwwedfayfwupu.supabase.co',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.find(o => origin.startsWith(o)) || ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Trello sync temporarily disabled
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: "Trello sync disabled", 
      synced: 0 
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
