import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  idList: string;
  dateLastActivity: string;
  labels: { name: string; color: string }[];
  customFieldItems?: { idCustomField: string; value?: { text?: string; number?: string } }[];
}

interface TrelloList {
  id: string;
  name: string;
}

// Mapeamento de listas do Trello para status do sistema
const listToStatus: Record<string, string> = {
  'diagnóstico': 'diagnostico',
  'diagnostico': 'diagnostico',
  'orçamento': 'orcamento',
  'orcamento': 'orcamento',
  'aguardando aprovação': 'aguardando_aprovacao',
  'aguardando aprovacao': 'aguardando_aprovacao',
  'aguardando peça': 'aguardando_peca',
  'aguardando peca': 'aguardando_peca',
  'em execução': 'em_execucao',
  'em execucao': 'em_execucao',
  'execução': 'em_execucao',
  'execucao': 'em_execucao',
  'em teste': 'em_teste',
  'teste': 'em_teste',
  'pronto': 'pronto',
  'pronto para retirada': 'pronto',
  'entregue': 'entregue',
  'finalizado': 'entregue',
};

function normalizeListName(name: string): string {
  return name.toLowerCase().trim();
}

function extractPlateFromCard(card: TrelloCard): string | null {
  // Tenta extrair placa do nome ou descrição (formato: ABC-1234 ou ABC1234)
  const plateRegex = /[A-Z]{3}[-\s]?\d{4}|[A-Z]{3}\d[A-Z]\d{2}/gi;
  
  const nameMatch = card.name.match(plateRegex);
  if (nameMatch) return nameMatch[0].toUpperCase().replace(/[-\s]/g, '-');
  
  const descMatch = card.desc.match(plateRegex);
  if (descMatch) return descMatch[0].toUpperCase().replace(/[-\s]/g, '-');
  
  return null;
}

function extractClientFromCard(card: TrelloCard): string {
  // Tenta extrair nome do cliente do card
  // Formato comum: "PLACA - CLIENTE - SERVIÇO" ou similar
  const parts = card.name.split(/[-–|]/);
  if (parts.length >= 2) {
    // Remove a placa se estiver no início
    const firstPart = parts[0].trim();
    if (/[A-Z]{3}[-\s]?\d{4}|[A-Z]{3}\d[A-Z]\d{2}/i.test(firstPart)) {
      return parts[1]?.trim() || 'Cliente não identificado';
    }
    return firstPart;
  }
  return card.name.slice(0, 50);
}

function extractServiceFromCard(card: TrelloCard): string {
  const parts = card.name.split(/[-–|]/);
  if (parts.length >= 3) {
    return parts.slice(2).join(' - ').trim();
  }
  if (parts.length >= 2) {
    return parts[parts.length - 1].trim();
  }
  return card.desc?.slice(0, 200) || 'Serviço não especificado';
}

function extractTotalFromCard(card: TrelloCard): number | null {
  // Tenta extrair valor do card (formato: R$ 1.234,56 ou 1234.56)
  const valueRegex = /R?\$?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi;
  
  const descMatch = card.desc?.match(valueRegex);
  if (descMatch) {
    const valueStr = descMatch[0].replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    const value = parseFloat(valueStr);
    if (!isNaN(value)) return value;
  }
  
  return null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TRELLO_API_KEY = Deno.env.get('TRELLO_API_KEY');
    const TRELLO_API_TOKEN = Deno.env.get('TRELLO_API_TOKEN');
    const TRELLO_BOARD_ID = Deno.env.get('TRELLO_BOARD_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!TRELLO_API_KEY || !TRELLO_API_TOKEN || !TRELLO_BOARD_ID) {
      throw new Error('Credenciais do Trello não configuradas');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar listas do board
    console.log('Buscando listas do Trello...');
    const listsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/lists?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`
    );
    
    if (!listsResponse.ok) {
      const errorText = await listsResponse.text();
      console.error('Erro ao buscar listas:', errorText);
      throw new Error(`Erro ao buscar listas do Trello: ${listsResponse.status}`);
    }
    
    const lists: TrelloList[] = await listsResponse.json();
    console.log(`Encontradas ${lists.length} listas`);

    // Criar mapa de listId para status
    const listIdToStatus: Record<string, string> = {};
    lists.forEach(list => {
      const normalizedName = normalizeListName(list.name);
      const status = listToStatus[normalizedName] || 'orcamento';
      listIdToStatus[list.id] = status;
      console.log(`Lista "${list.name}" -> status "${status}"`);
    });

    // Buscar cards do board
    console.log('Buscando cards do Trello...');
    const cardsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`
    );
    
    if (!cardsResponse.ok) {
      throw new Error(`Erro ao buscar cards do Trello: ${cardsResponse.status}`);
    }
    
    const cards: TrelloCard[] = await cardsResponse.json();
    console.log(`Encontrados ${cards.length} cards`);

    // Buscar empresa POMBAL
    const { data: pombalCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('code', 'POMBAL')
      .single();

    const companyId = pombalCompany?.id;

    // Processar cada card
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const card of cards) {
      try {
        const plate = extractPlateFromCard(card);
        if (!plate) {
          console.log(`Card "${card.name}" sem placa identificável, pulando...`);
          results.skipped++;
          continue;
        }

        const clientName = extractClientFromCard(card);
        const service = extractServiceFromCard(card);
        const total = extractTotalFromCard(card);
        const status = listIdToStatus[card.idList] || 'orcamento';

        console.log(`Processando: ${plate} - ${clientName} - Status: ${status}`);

        // Verificar se o cliente já existe
        let { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('name', clientName)
          .maybeSingle();

        let clientId: string;

        if (!existingClient) {
          // Criar cliente
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              name: clientName,
              phone: '(00) 00000-0000',
              registration_source: 'trello_import',
            })
            .select('id')
            .single();

          if (clientError) {
            console.error(`Erro ao criar cliente ${clientName}:`, clientError);
            results.errors.push(`Cliente ${clientName}: ${clientError.message}`);
            continue;
          }
          clientId = newClient.id;
        } else {
          clientId = existingClient.id;
        }

        // Verificar se o veículo já existe
        let { data: existingVehicle } = await supabase
          .from('vehicles')
          .select('id')
          .eq('plate', plate)
          .maybeSingle();

        let vehicleId: string;

        if (!existingVehicle) {
          // Criar veículo
          const { data: newVehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .insert({
              plate: plate,
              brand: 'A definir',
              model: 'A definir',
              client_id: clientId,
            })
            .select('id')
            .single();

          if (vehicleError) {
            console.error(`Erro ao criar veículo ${plate}:`, vehicleError);
            results.errors.push(`Veículo ${plate}: ${vehicleError.message}`);
            continue;
          }
          vehicleId = newVehicle.id;
        } else {
          vehicleId = existingVehicle.id;
        }

        // Verificar se já existe OS para este veículo com status ativo
        const { data: existingOS } = await supabase
          .from('service_orders')
          .select('id, status')
          .eq('vehicle_id', vehicleId)
          .neq('status', 'entregue')
          .maybeSingle();

        if (existingOS) {
          // Atualizar status da OS existente
          const { error: updateError } = await supabase
            .from('service_orders')
            .update({
              status: status,
              problem_description: service,
              total: total,
              updated_at: new Date().toISOString(),
              completed_at: status === 'entregue' ? new Date().toISOString() : null,
            })
            .eq('id', existingOS.id);

          if (updateError) {
            results.errors.push(`Atualizar OS ${existingOS.id}: ${updateError.message}`);
          } else {
            results.updated++;
          }
        } else {
          // Criar nova OS
          const { error: osError } = await supabase
            .from('service_orders')
            .insert({
              client_id: clientId,
              vehicle_id: vehicleId,
              status: status,
              problem_description: service,
              total: total,
              completed_at: status === 'entregue' ? new Date().toISOString() : null,
            });

          if (osError) {
            console.error(`Erro ao criar OS para ${plate}:`, osError);
            results.errors.push(`OS ${plate}: ${osError.message}`);
          } else {
            results.created++;
          }
        }
      } catch (cardError: unknown) {
        const errorMessage = cardError instanceof Error ? cardError.message : String(cardError);
        console.error(`Erro ao processar card ${card.name}:`, cardError);
        results.errors.push(`Card ${card.name}: ${errorMessage}`);
      }
    }

    console.log('Sincronização concluída:', results);

    return new Response(JSON.stringify({
      success: true,
      message: `Sincronização concluída: ${results.created} criadas, ${results.updated} atualizadas, ${results.skipped} puladas`,
      details: results,
      lists: lists.map(l => ({ id: l.id, name: l.name, status: listIdToStatus[l.id] })),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Erro na sincronização:', error);
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
