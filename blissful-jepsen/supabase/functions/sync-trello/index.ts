const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
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
