import { ChromaClient } from 'chromadb';
import { supabase } from './supabase.js';
import { log } from './logger.js';

const COLLECTION_NAME = process.env.CHROMA_COLLECTION || 'doctor_auto_kb';

let chromaClient: ChromaClient | null = null;

function getChroma(): ChromaClient {
  if (!chromaClient) {
    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    chromaClient = new ChromaClient({ path: chromaUrl });
  }
  return chromaClient;
}

export interface KnowledgeDoc {
  id: string;
  category: string;
  subcategory?: string;
  title: string;
  content: string;
  source?: string;
}

/**
 * Query knowledge base by similarity (RAG)
 * Falls back to Supabase text search if ChromaDB is unavailable
 */
export async function queryKnowledge(query: string, limit = 5): Promise<KnowledgeDoc[]> {
  // Try ChromaDB first
  try {
    const chroma = getChroma();
    const collection = await chroma.getOrCreateCollection({ name: COLLECTION_NAME });

    const results = await collection.query({
      queryTexts: [query],
      nResults: limit,
    });

    if (results.documents[0] && results.documents[0].length > 0) {
      return results.documents[0].map((doc, i) => ({
        id: results.ids[0][i],
        category: (results.metadatas[0][i] as any)?.categoria || 'geral',
        subcategory: (results.metadatas[0][i] as any)?.subcategoria,
        title: (results.metadatas[0][i] as any)?.titulo || 'Sem titulo',
        content: doc || '',
        source: (results.metadatas[0][i] as any)?.fonte,
      }));
    }
  } catch {
    // ChromaDB not available, fall back to Supabase
  }

  // Fallback: search Supabase ia_knowledge_base with text match
  const { data } = await supabase
    .from('ia_knowledge_base')
    .select('*')
    .or(`titulo.ilike.%${query}%,conteudo.ilike.%${query}%,categoria.ilike.%${query}%`)
    .limit(limit);

  if (data && data.length > 0) {
    return data.map(d => ({
      id: d.id,
      category: d.categoria,
      subcategory: d.subcategoria,
      title: d.titulo,
      content: d.conteudo,
      source: d.fonte,
    }));
  }

  return [];
}

/**
 * Ingest a document into both Supabase and ChromaDB
 */
export async function ingestDocument(doc: {
  categoria: string;
  subcategoria?: string;
  titulo: string;
  conteudo: string;
  fonte?: string;
}): Promise<string> {
  // 1. Save to Supabase
  const { data, error } = await supabase
    .from('ia_knowledge_base')
    .insert({
      categoria: doc.categoria,
      subcategoria: doc.subcategoria,
      titulo: doc.titulo,
      conteudo: doc.conteudo,
      fonte: doc.fonte || 'manual',
    })
    .select('id')
    .single();

  if (error) throw error;
  const docId = data.id;

  // 2. Index in ChromaDB
  try {
    const chroma = getChroma();
    const collection = await chroma.getOrCreateCollection({ name: COLLECTION_NAME });

    await collection.add({
      ids: [docId],
      documents: [doc.conteudo],
      metadatas: [{
        categoria: doc.categoria,
        subcategoria: doc.subcategoria || '',
        titulo: doc.titulo,
        fonte: doc.fonte || 'manual',
      }],
    });

    // Update embedding_id in Supabase
    await supabase
      .from('ia_knowledge_base')
      .update({ embedding_id: docId })
      .eq('id', docId);
  } catch (err) {
    // ChromaDB might not be running, that's OK - data is in Supabase
    console.warn('ChromaDB unavailable, document saved to Supabase only');
  }

  return docId;
}

/**
 * Bulk ingest from a markdown file (parsed into sections)
 */
export async function ingestMarkdown(
  content: string,
  categoria: string,
  fonte: string,
): Promise<number> {
  // Split by ## headers
  const sections = content.split(/^## /gm).filter(s => s.trim());
  let count = 0;

  for (const section of sections) {
    const lines = section.split('\n');
    const titulo = lines[0].trim().replace(/^#+\s*/, '');
    const conteudo = lines.slice(1).join('\n').trim();

    if (!conteudo || conteudo.length < 10) continue;

    // Detect subcategory from ### headers within the section
    const subcategoria = titulo.split(' - ')[0] || undefined;

    await ingestDocument({
      categoria,
      subcategoria,
      titulo,
      conteudo,
      fonte,
    });
    count++;
  }

  return count;
}

/**
 * Sync Supabase business tables to knowledge base
 */
export async function syncBusinessData(athenaId: string): Promise<number> {
  let total = 0;

  // Tables to sync
  const tableMappings = [
    { table: 'empresas', categoria: 'empresa', titulo: (r: any) => `Empresa: ${r.nome || r.razao_social || 'N/A'}` },
    { table: 'colaboradores', categoria: 'equipe', titulo: (r: any) => `Colaborador: ${r.nome || 'N/A'}` },
    { table: 'mecanicos', categoria: 'equipe', titulo: (r: any) => `Mecanico: ${r.nome || 'N/A'}` },
    { table: 'recursos', categoria: 'operacional', titulo: (r: any) => `Recurso: ${r.nome || r.tipo || 'N/A'}` },
    { table: 'catalogo_servicos', categoria: 'servicos', titulo: (r: any) => `Servico: ${r.nome || 'N/A'}` },
  ];

  for (const mapping of tableMappings) {
    try {
      const { data, error } = await supabase.from(mapping.table).select('*');
      if (error || !data || data.length === 0) continue;

      for (const row of data) {
        await ingestDocument({
          categoria: mapping.categoria,
          titulo: mapping.titulo(row),
          conteudo: JSON.stringify(row, null, 2),
          fonte: `supabase:${mapping.table}`,
        });
        total++;
      }
    } catch {
      // Table might not exist or be empty
    }
  }

  if (total > 0) {
    await log(athenaId, 'info', `Sync concluido: ${total} documentos indexados`, { total });
  }

  return total;
}
