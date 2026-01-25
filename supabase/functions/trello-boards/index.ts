import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TRELLO_API_KEY = Deno.env.get('TRELLO_API_KEY');
    const TRELLO_TOKEN = Deno.env.get('TRELLO_TOKEN');

    if (!TRELLO_API_KEY || !TRELLO_TOKEN) {
      return new Response(
        JSON.stringify({ error: 'Trello API credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, boardId, listId, cardId } = await req.json();
    const baseUrl = 'https://api.trello.com/1';
    const authParams = `key=${TRELLO_API_KEY}&token=${TRELLO_TOKEN}`;

    let url = '';
    
    switch (action) {
      case 'getBoards':
        url = `${baseUrl}/members/me/boards?${authParams}&fields=id,name,desc,url,dateLastActivity`;
        break;
      case 'getLists':
        if (!boardId) throw new Error('boardId is required');
        url = `${baseUrl}/boards/${boardId}/lists?${authParams}&fields=id,name,pos`;
        break;
      case 'getBoardCards':
        if (!boardId) throw new Error('boardId is required');
        url = `${baseUrl}/boards/${boardId}/cards?${authParams}&fields=id,name,desc,due,url,idList,labels,dateLastActivity`;
        break;
      case 'getListCards':
        if (!listId) throw new Error('listId is required');
        url = `${baseUrl}/lists/${listId}/cards?${authParams}&fields=id,name,desc,due,url,labels,dateLastActivity`;
        break;
      case 'getCard':
        if (!cardId) throw new Error('cardId is required');
        url = `${baseUrl}/cards/${cardId}?${authParams}&fields=id,name,desc,due,url,labels,dateLastActivity,idList`;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Trello API error:', errorText);
      throw new Error(`Trello API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
