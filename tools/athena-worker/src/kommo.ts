/**
 * Kommo CRM Integration (placeholder)
 * Waiting for API key from Thales
 */

const KOMMO_API_KEY = process.env.KOMMO_API_KEY;
const KOMMO_SUBDOMAIN = process.env.KOMMO_SUBDOMAIN;

export interface KommoLead {
  id: number;
  name: string;
  pipeline_id: number;
  status_id: number;
  responsible_user_id: number;
  created_at: number;
  contacts?: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
  }[];
  custom_fields?: Record<string, unknown>;
}

export function isConfigured(): boolean {
  return Boolean(KOMMO_API_KEY && KOMMO_SUBDOMAIN);
}

async function kommoFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  if (!isConfigured()) {
    throw new Error('Kommo not configured. Set KOMMO_API_KEY and KOMMO_SUBDOMAIN.');
  }

  const url = `https://${KOMMO_SUBDOMAIN}.kommo.com/api/v4/${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${KOMMO_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Kommo API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function getLeads(limit = 50): Promise<KommoLead[]> {
  const data = await kommoFetch(`leads?limit=${limit}&with=contacts`);
  return data?._embedded?.leads || [];
}

export async function getLeadById(id: number): Promise<KommoLead | null> {
  try {
    const data = await kommoFetch(`leads/${id}?with=contacts`);
    return data || null;
  } catch {
    return null;
  }
}

export async function getNewLeads(sinceTimestamp: number): Promise<KommoLead[]> {
  const data = await kommoFetch(
    `leads?filter[created_at][from]=${sinceTimestamp}&with=contacts&order[created_at]=desc`
  );
  return data?._embedded?.leads || [];
}

export async function addNote(leadId: number, text: string): Promise<void> {
  await kommoFetch(`leads/${leadId}/notes`, {
    method: 'POST',
    body: JSON.stringify([{
      note_type: 'common',
      params: { text },
    }]),
  });
}

export async function getPipelines(): Promise<any[]> {
  const data = await kommoFetch('leads/pipelines');
  return data?._embedded?.pipelines || [];
}
