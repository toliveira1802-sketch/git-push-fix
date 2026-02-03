import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VeiculoOrfao {
  client_id_original: string | null
  marca: string | null
  modelo: string | null
  versao: string | null
  ano: string | null
  cor: string | null
  placa: string | null
  chassi: string | null
  km: number | null
  combustivel: string | null
  notas: string | null
  origem_contato: string | null
  is_active: boolean
}

function parseCSVLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ';' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

function cleanValue(value: string): string | null {
  if (!value || value === '' || value === 'undefined' || value === 'null') {
    return null
  }
  return value.trim()
}

function parseKm(value: string): number | null {
  if (!value) return null
  const cleaned = value.replace(/\D/g, '')
  const num = parseInt(cleaned)
  return isNaN(num) ? null : num
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { csvData, batchStart = 0, batchSize = 500 } = await req.json()

    if (!csvData) {
      return new Response(
        JSON.stringify({ error: 'csvData is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const lines = csvData.split('\n')
    const headers = parseCSVLine(lines[0].replace(/^\uFEFF/, ''))
    
    const records: VeiculoOrfao[] = []
    const endIndex = Math.min(batchStart + batchSize, lines.length)
    
    for (let i = batchStart + 1; i < endIndex; i++) {
      const line = lines[i]?.trim()
      if (!line) continue
      
      const values = parseCSVLine(line)
      const record: Record<string, string> = {}
      
      headers.forEach((header, idx) => {
        record[header.trim()] = values[idx] || ''
      })

      const placa = cleanValue(record.plate)
      if (!placa) continue

      const marca = cleanValue(record.marca)
      const carro = cleanValue(record.carro) || ''
      const modeloCol = cleanValue(record.modelo) || ''
      const modelo = `${carro} ${modeloCol}`.trim() || null

      records.push({
        client_id_original: cleanValue(record.client_id),
        marca,
        modelo,
        versao: cleanValue(record.versao),
        ano: cleanValue(record.year),
        cor: cleanValue(record.color),
        placa: placa.toUpperCase(),
        chassi: cleanValue(record.chassis),
        km: parseKm(record.km),
        combustivel: cleanValue(record.fuel_type),
        notas: cleanValue(record.notes),
        origem_contato: cleanValue(record.origem_contato),
        is_active: true,
      })
    }

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          imported: 0, 
          message: 'No valid records in this batch',
          hasMore: endIndex < lines.length - 1
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { error } = await supabase
      .from('veiculos_orfaos')
      .insert(records)

    if (error) {
      console.error('Insert error:', error)
      return new Response(
        JSON.stringify({ error: error.message, details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported: records.length,
        batchStart,
        batchEnd: endIndex - 1,
        hasMore: endIndex < lines.length - 1,
        nextBatchStart: endIndex - 1
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
