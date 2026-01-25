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
  customFieldItems?: TrelloCustomFieldItem[];
}

interface TrelloCustomFieldItem {
  id: string;
  idCustomField: string;
  idModel: string;
  value?: {
    text?: string;
    number?: string;
    date?: string;
    checked?: string;
  };
  idValue?: string; // Para campos dropdown
}

interface TrelloCustomField {
  id: string;
  name: string;
  type: string;
  options?: { id: string; value: { text: string } }[];
}

interface TrelloList {
  id: string;
  name: string;
}

interface ExtractedCardData {
  plate: string | null;
  clientName: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: number | null;
  vehicleColor: string | null;
  service: string;
  total: number | null;
  km: number | null;
  priority: string;
  observations: string | null;
}

// Mapeamento de listas do Trello para status do sistema
const listToStatus: Record<string, string> = {
  'diagnóstico': 'diagnostico',
  'diagnostico': 'diagnostico',
  'orçamento': 'orcamento',
  'orcamento': 'orcamento',
  'aguardando aprovação': 'aguardando_aprovacao',
  'aguardando aprovacao': 'aguardando_aprovacao',
  'aguardando peças': 'aguardando_peca',
  'aguardando pecas': 'aguardando_peca',
  'aguardando peça': 'aguardando_peca',
  'aguardando peca': 'aguardando_peca',
  'pronto para iniciar': 'pronto_iniciar',
  'pronto p iniciar': 'pronto_iniciar',
  'pronto pra iniciar': 'pronto_iniciar',
  'em execução': 'em_execucao',
  'em execucao': 'em_execucao',
  'execução': 'em_execucao',
  'execucao': 'em_execucao',
  'em teste': 'em_teste',
  'teste': 'em_teste',
  'pronto': 'pronto',
  'pronto para retirada': 'pronto',
  'pronto / aguardando retirada': 'pronto',
  'aguardando retirada': 'pronto',
  'entregue': 'entregue',
  'finalizado': 'entregue',
};

// Mapeamento flexível de nomes de custom fields (normalizado)
const customFieldMapping: Record<string, keyof ExtractedCardData> = {
  // Placa
  'placa': 'plate',
  'plate': 'plate',
  
  // Cliente
  'cliente': 'clientName',
  'client': 'clientName',
  'nome cliente': 'clientName',
  'nome do cliente': 'clientName',
  
  // Veículo - Marca
  'marca': 'vehicleBrand',
  'brand': 'vehicleBrand',
  'fabricante': 'vehicleBrand',
  
  // Veículo - Modelo
  'modelo': 'vehicleModel',
  'model': 'vehicleModel',
  'veiculo': 'vehicleModel',
  'veículo': 'vehicleModel',
  
  // Veículo - Ano
  'ano': 'vehicleYear',
  'year': 'vehicleYear',
  'ano fabricacao': 'vehicleYear',
  'ano fabricação': 'vehicleYear',
  
  // Veículo - Cor
  'cor': 'vehicleColor',
  'color': 'vehicleColor',
  
  // Serviço
  'servico': 'service',
  'serviço': 'service',
  'service': 'service',
  'descricao': 'service',
  'descrição': 'service',
  'problema': 'service',
  
  // Valor
  'valor': 'total',
  'total': 'total',
  'preco': 'total',
  'preço': 'total',
  'price': 'total',
  'orcamento': 'total',
  'orçamento': 'total',
  'valor aprovado': 'total',
  'valor apv': 'total',
  'aprovado': 'total',
  
  // KM
  'km': 'km',
  'quilometragem': 'km',
  'odometro': 'km',
  'odômetro': 'km',
  
  // Prioridade
  'prioridade': 'priority',
  'priority': 'priority',
  'urgencia': 'priority',
  'urgência': 'priority',
  
  // Observações
  'observacao': 'observations',
  'observação': 'observations',
  'observacoes': 'observations',
  'observações': 'observations',
  'obs': 'observations',
  'notas': 'observations',
  'notes': 'observations',
};

// Remove emojis e normaliza nome
function normalizeName(name: string): string {
  return name
    .replace(/[^\p{L}\p{N}\s\/]/gu, '')
    .toLowerCase()
    .trim();
}

// Extrai placa do texto (formato: ABC-1234 ou ABC1234 ou Mercosul ABC1D23)
function extractPlate(text: string): string | null {
  const plateRegex = /[A-Z]{3}[-\s]?\d{4}|[A-Z]{3}\d[A-Z]\d{2}/gi;
  const match = text.match(plateRegex);
  if (match) {
    return match[0].toUpperCase().replace(/[-\s]/g, '-');
  }
  return null;
}

// Extrai número do texto
function extractNumber(text: string): number | null {
  const cleaned = text.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

// Extrai ano (4 dígitos entre 1900 e 2100)
function extractYear(text: string): number | null {
  const match = text.match(/\b(19|20)\d{2}\b/);
  if (match) {
    const year = parseInt(match[0]);
    if (year >= 1900 && year <= 2100) return year;
  }
  return null;
}

// Processa custom fields do card
function processCustomFields(
  card: TrelloCard,
  customFieldsMap: Map<string, TrelloCustomField>
): Partial<ExtractedCardData> {
  const result: Partial<ExtractedCardData> = {};

  if (!card.customFieldItems || card.customFieldItems.length === 0) {
    return result;
  }

  for (const item of card.customFieldItems) {
    const field = customFieldsMap.get(item.idCustomField);
    if (!field) continue;

    const normalizedFieldName = normalizeName(field.name);
    const mappedKey = customFieldMapping[normalizedFieldName];
    
    if (!mappedKey) {
      console.log(`Campo customizado não mapeado: "${field.name}"`);
      continue;
    }

    let value: string | null = null;

    // Extrair valor baseado no tipo do campo
    if (item.value?.text) {
      value = item.value.text;
    } else if (item.value?.number) {
      value = item.value.number;
    } else if (item.value?.date) {
      value = item.value.date;
    } else if (item.idValue && field.options) {
      // Campo dropdown - buscar texto da opção
      const option = field.options.find(o => o.id === item.idValue);
      if (option) {
        value = option.value.text;
      }
    }

    if (!value) continue;

    // Converter e atribuir valor ao campo correto
    switch (mappedKey) {
      case 'plate':
        result.plate = extractPlate(value) || value.toUpperCase();
        break;
      case 'clientName':
        result.clientName = value.trim();
        break;
      case 'vehicleBrand':
        result.vehicleBrand = value.trim();
        break;
      case 'vehicleModel':
        result.vehicleModel = value.trim();
        break;
      case 'vehicleYear':
        result.vehicleYear = extractYear(value) || parseInt(value) || null;
        break;
      case 'vehicleColor':
        result.vehicleColor = value.trim();
        break;
      case 'service':
        result.service = value.trim();
        break;
      case 'total':
        result.total = extractNumber(value);
        break;
      case 'km':
        result.km = extractNumber(value);
        break;
      case 'priority':
        result.priority = value.toLowerCase().includes('alta') || value.toLowerCase().includes('high') 
          ? 'alta' 
          : value.toLowerCase().includes('baixa') || value.toLowerCase().includes('low')
            ? 'baixa'
            : 'normal';
        break;
      case 'observations':
        result.observations = value.trim();
        break;
    }
  }

  return result;
}

// Extrai dados do nome e descrição do card (fallback)
function extractFromCardContent(card: TrelloCard): Partial<ExtractedCardData> {
  const result: Partial<ExtractedCardData> = {};

  // Tenta extrair placa do nome ou descrição
  result.plate = extractPlate(card.name) || extractPlate(card.desc || '');

  // Tenta extrair valor da descrição
  const valueRegex = /R?\$\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi;
  const valueMatch = card.desc?.match(valueRegex);
  if (valueMatch) {
    result.total = extractNumber(valueMatch[0]);
  }

  // Usa descrição como serviço se existir
  if (card.desc && card.desc.length > 0) {
    result.service = card.desc.slice(0, 500);
  }

  return result;
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

    // Buscar custom fields do board
    console.log('Buscando custom fields do Trello...');
    const customFieldsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/customFields?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`
    );
    
    let customFieldsMap = new Map<string, TrelloCustomField>();
    if (customFieldsResponse.ok) {
      const customFields: TrelloCustomField[] = await customFieldsResponse.json();
      console.log(`Encontrados ${customFields.length} custom fields:`);
      customFields.forEach(cf => {
        customFieldsMap.set(cf.id, cf);
        console.log(`  - "${cf.name}" (${cf.type})`);
      });
    } else {
      console.log('Não foi possível buscar custom fields, continuando sem eles...');
    }

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
      const normalizedListName = normalizeName(list.name);
      const status = listToStatus[normalizedListName] || 'orcamento';
      listIdToStatus[list.id] = status;
      console.log(`Lista "${list.name}" -> status "${status}"`);
    });

    // Buscar cards do board COM custom fields
    console.log('Buscando cards do Trello...');
    const cardsResponse = await fetch(
      `https://api.trello.com/1/boards/${TRELLO_BOARD_ID}/cards?customFieldItems=true&key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`
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
      customFieldsFound: [] as string[],
    };

    for (const card of cards) {
      try {
        // Extrair dados dos custom fields
        const customData = processCustomFields(card, customFieldsMap);
        
        // Fallback para extração do conteúdo do card
        const contentData = extractFromCardContent(card);
        
        // Merge dos dados (custom fields tem prioridade)
        const extractedData: ExtractedCardData = {
          plate: customData.plate || contentData.plate || null,
          clientName: customData.clientName || 'Cliente não identificado',
          vehicleBrand: customData.vehicleBrand || 'A definir',
          vehicleModel: customData.vehicleModel || 'A definir',
          vehicleYear: customData.vehicleYear || null,
          vehicleColor: customData.vehicleColor || null,
          service: customData.service || contentData.service || card.name,
          total: customData.total ?? contentData.total ?? null,
          km: customData.km || null,
          priority: customData.priority || 'normal',
          observations: customData.observations || null,
        };

        // Log dos custom fields encontrados
        if (Object.keys(customData).length > 0) {
          results.customFieldsFound.push(card.name);
        }

        // Placa é obrigatória
        if (!extractedData.plate) {
          console.log(`Card "${card.name}" sem placa identificável, pulando...`);
          results.skipped++;
          continue;
        }

        const status = listIdToStatus[card.idList] || 'orcamento';

        console.log(`Processando: ${extractedData.plate} - Cliente: ${extractedData.clientName} - Veículo: ${extractedData.vehicleBrand} ${extractedData.vehicleModel} - Status: ${status}`);

        // Verificar se o cliente já existe
        let { data: existingClient } = await supabase
          .from('clients')
          .select('id')
          .eq('name', extractedData.clientName)
          .maybeSingle();

        let clientId: string;

        if (!existingClient) {
          // Criar cliente
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              name: extractedData.clientName,
              phone: '(00) 00000-0000',
              registration_source: 'trello_import',
            })
            .select('id')
            .single();

          if (clientError) {
            console.error(`Erro ao criar cliente ${extractedData.clientName}:`, clientError);
            results.errors.push(`Cliente ${extractedData.clientName}: ${clientError.message}`);
            continue;
          }
          clientId = newClient.id;
        } else {
          clientId = existingClient.id;
        }

        // Verificar se o veículo já existe
        let { data: existingVehicle } = await supabase
          .from('vehicles')
          .select('id, brand, model')
          .eq('plate', extractedData.plate)
          .maybeSingle();

        let vehicleId: string;

        if (!existingVehicle) {
          // Criar veículo com dados extraídos
          const { data: newVehicle, error: vehicleError } = await supabase
            .from('vehicles')
            .insert({
              plate: extractedData.plate,
              brand: extractedData.vehicleBrand,
              model: extractedData.vehicleModel,
              year: extractedData.vehicleYear,
              color: extractedData.vehicleColor,
              km: extractedData.km,
              client_id: clientId,
            })
            .select('id')
            .single();

          if (vehicleError) {
            console.error(`Erro ao criar veículo ${extractedData.plate}:`, vehicleError);
            results.errors.push(`Veículo ${extractedData.plate}: ${vehicleError.message}`);
            continue;
          }
          vehicleId = newVehicle.id;
        } else {
          vehicleId = existingVehicle.id;
          
          // Atualizar veículo se os dados estavam como "A definir"
          if (existingVehicle.brand === 'A definir' || existingVehicle.model === 'A definir') {
            const updateData: Record<string, unknown> = {};
            if (existingVehicle.brand === 'A definir' && extractedData.vehicleBrand !== 'A definir') {
              updateData.brand = extractedData.vehicleBrand;
            }
            if (existingVehicle.model === 'A definir' && extractedData.vehicleModel !== 'A definir') {
              updateData.model = extractedData.vehicleModel;
            }
            if (extractedData.vehicleYear) updateData.year = extractedData.vehicleYear;
            if (extractedData.vehicleColor) updateData.color = extractedData.vehicleColor;
            if (extractedData.km) updateData.km = extractedData.km;

            if (Object.keys(updateData).length > 0) {
              await supabase
                .from('vehicles')
                .update(updateData)
                .eq('id', vehicleId);
            }
          }
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
              problem_description: extractedData.service,
              total: extractedData.total,
              priority: extractedData.priority,
              observations: extractedData.observations,
              updated_at: new Date().toISOString(),
              completed_at: status === 'entregue' ? new Date().toISOString() : null,
            })
            .eq('id', existingOS.id);

          if (updateError) {
            results.errors.push(`Atualizar OS ${existingOS.id}: ${updateError.message}`);
          } else {
            // Atualizar ou criar item padrão com o valor se existir
            if (extractedData.total && extractedData.total > 0) {
              // Verificar se já existe item padrão
              const { data: existingItem } = await supabase
                .from('service_order_items')
                .select('id')
                .eq('service_order_id', existingOS.id)
                .eq('description', 'Serviço (Trello)')
                .maybeSingle();
              
              if (existingItem) {
                // Atualizar item existente
                await supabase
                  .from('service_order_items')
                  .update({
                    unit_price: extractedData.total,
                    total_price: extractedData.total,
                    status: 'aprovado',
                  })
                  .eq('id', existingItem.id);
              } else {
                // Criar item padrão
                await supabase
                  .from('service_order_items')
                  .insert({
                    service_order_id: existingOS.id,
                    type: 'servico',
                    description: 'Serviço (Trello)',
                    quantity: 1,
                    unit_price: extractedData.total,
                    total_price: extractedData.total,
                    status: 'aprovado',
                  });
              }
            }
            results.updated++;
          }
        } else {
          // Criar nova OS
          const { data: newOS, error: osError } = await supabase
            .from('service_orders')
            .insert({
              client_id: clientId,
              vehicle_id: vehicleId,
              status: status,
              problem_description: extractedData.service,
              total: extractedData.total,
              priority: extractedData.priority,
              observations: extractedData.observations,
              entry_km: extractedData.km,
              completed_at: status === 'entregue' ? new Date().toISOString() : null,
            })
            .select('id')
            .single();

          if (osError) {
            console.error(`Erro ao criar OS para ${extractedData.plate}:`, osError);
            results.errors.push(`OS ${extractedData.plate}: ${osError.message}`);
          } else {
            // Criar item padrão com o valor se existir
            if (newOS && extractedData.total && extractedData.total > 0) {
              await supabase
                .from('service_order_items')
                .insert({
                  service_order_id: newOS.id,
                  type: 'servico',
                  description: 'Serviço (Trello)',
                  quantity: 1,
                  unit_price: extractedData.total,
                  total_price: extractedData.total,
                  status: 'aprovado',
                });
            }
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
      customFields: Array.from(customFieldsMap.values()).map(cf => ({ id: cf.id, name: cf.name, type: cf.type })),
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
