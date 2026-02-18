import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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

interface CreateQuickClientRequest {
  name: string;
  phone: string;
  email?: string;
  vehiclePlate: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear?: number;
  vehicleColor?: string;
}

Deno.serve(async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("create-quick-client: Starting request processing");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // === AUTHENTICATION CHECK ===
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("create-quick-client: No authorization header");
      return new Response(
        JSON.stringify({ error: "Não autorizado - Token não fornecido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to validate
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      console.error("create-quick-client: Auth error", authError);
      return new Response(
        JSON.stringify({ error: "Não autorizado - Token inválido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-quick-client: User authenticated:", user.email);

    // Check if user has admin, gestao, or dev role
    const { data: hasAdmin } = await supabaseAuth.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    const { data: hasGestao } = await supabaseAuth.rpc('has_role', { _user_id: user.id, _role: 'gestao' });
    const { data: hasDev } = await supabaseAuth.rpc('has_role', { _user_id: user.id, _role: 'dev' });

    if (!hasAdmin && !hasGestao && !hasDev) {
      console.error("create-quick-client: User lacks required role");
      return new Response(
        JSON.stringify({ error: "Sem permissão para criar clientes" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-quick-client: User has required role");

    // Parse request body
    const body: CreateQuickClientRequest = await req.json();
    
    // === COMPREHENSIVE INPUT VALIDATION ===
    
    // Validate required fields first
    if (!body.name || !body.phone || !body.vehiclePlate || !body.vehicleBrand || !body.vehicleModel) {
      return new Response(
        JSON.stringify({ error: "Nome, telefone, placa, marca e modelo são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Trim whitespace from all string inputs
    const name = body.name.trim();
    const phone = body.phone.replace(/\D/g, ''); // Remove non-digits
    const vehiclePlate = body.vehiclePlate.trim().toUpperCase();
    const vehicleBrand = body.vehicleBrand.trim();
    const vehicleModel = body.vehicleModel.trim();
    const vehicleColor = body.vehicleColor?.trim() || null;
    const vehicleYear = body.vehicleYear || null;
    const email = body.email?.trim() || null;

    // Validate name (3-100 characters)
    if (name.length < 3 || name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Nome deve ter entre 3 e 100 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate phone (10-11 digits after removing non-digits)
    if (!/^\d{10,11}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Telefone inválido (deve conter 10-11 dígitos)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate vehicle plate (7 alphanumeric characters - old format or Mercosul)
    if (!/^[A-Z0-9]{7}$/.test(vehiclePlate)) {
      return new Response(
        JSON.stringify({ error: "Placa inválida (7 caracteres alfanuméricos)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate brand (2-50 characters)
    if (vehicleBrand.length < 2 || vehicleBrand.length > 50) {
      return new Response(
        JSON.stringify({ error: "Marca deve ter entre 2 e 50 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate model (2-50 characters)
    if (vehicleModel.length < 2 || vehicleModel.length > 50) {
      return new Response(
        JSON.stringify({ error: "Modelo deve ter entre 2 e 50 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate year if provided (1900-2100)
    if (vehicleYear !== null && (vehicleYear < 1900 || vehicleYear > 2100)) {
      return new Response(
        JSON.stringify({ error: "Ano do veículo inválido (1900-2100)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate color if provided (2-30 characters)
    if (vehicleColor !== null && (vehicleColor.length < 2 || vehicleColor.length > 30)) {
      return new Response(
        JSON.stringify({ error: "Cor deve ter entre 2 e 30 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format if provided
    if (email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: "Email inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-quick-client: Input validation passed");

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Create client (using validated/sanitized values)
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from("clientes")
      .insert({
        name: name,
        phone: phone,
        email: email,
        status: "active",
        registration_source: "admin",
        pending_review: false,
      })
      .select("id")
      .single();

    if (clientError) {
      console.error("create-quick-client: Error creating client", clientError);
      return new Response(
        JSON.stringify({ error: `Erro ao criar cliente: ${clientError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-quick-client: Client created:", clientData.id);

    // 2. Create vehicle (using validated/sanitized values)
    const { data: vehicleData, error: vehicleError } = await supabaseAdmin
      .from("veiculos")
      .insert({
        client_id: clientData.id,
        plate: vehiclePlate,
        brand: vehicleBrand,
        model: vehicleModel,
        year: vehicleYear,
        color: vehicleColor,
        is_active: true,
      })
      .select("id")
      .single();

    if (vehicleError) {
      console.error("create-quick-client: Error creating vehicle", vehicleError);
      // Rollback client creation
      await supabaseAdmin.from("clientes").delete().eq("id", clientData.id);
      return new Response(
        JSON.stringify({ error: `Erro ao criar veículo: ${vehicleError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-quick-client: Vehicle created:", vehicleData.id);

    // 3. Generate non-sequential order number to prevent enumeration attacks
    const year = new Date().getFullYear();
    let orderNumber = "";
    let attempts = 0;
    
    while (attempts < 10) {
      // Random 6-char alphanumeric suffix (non-sequential for security)
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      const candidate = `${year}-${randomSuffix}`;
      
      const { data: existing } = await supabaseAdmin
        .from("ordens_servico")
        .select("id")
        .eq("order_number", candidate)
        .maybeSingle();
      
      if (!existing) {
        orderNumber = candidate;
        break;
      }
      attempts++;
    }
    
    if (!orderNumber) {
      orderNumber = `${year}-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    }

    const { data: osData, error: osError } = await supabaseAdmin
      .from("ordens_servico")
      .insert({
        order_number: orderNumber,
        client_id: clientData.id,
        vehicle_id: vehicleData.id,
        status: "orcamento",
      })
      .select("id")
      .single();

    if (osError) {
      console.error("create-quick-client: Error creating service order", osError);
      // Rollback
      await supabaseAdmin.from("veiculos").delete().eq("id", vehicleData.id);
      await supabaseAdmin.from("clientes").delete().eq("id", clientData.id);
      return new Response(
        JSON.stringify({ error: `Erro ao criar OS: ${osError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-quick-client: Service order created:", osData.id, orderNumber);

    return new Response(
      JSON.stringify({
        success: true,
        clientId: clientData.id,
        vehicleId: vehicleData.id,
        serviceOrderId: osData.id,
        orderNumber: orderNumber,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("create-quick-client: Unexpected error", error);
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
