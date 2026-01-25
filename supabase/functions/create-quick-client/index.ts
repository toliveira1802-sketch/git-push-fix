import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req: Request): Promise<Response> => {
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
    
    if (!body.name || !body.phone || !body.vehiclePlate || !body.vehicleBrand || !body.vehicleModel) {
      return new Response(
        JSON.stringify({ error: "Nome, telefone, placa, marca e modelo são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Create client
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from("clients")
      .insert({
        name: body.name,
        phone: body.phone,
        email: body.email || null,
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

    // 2. Create vehicle
    const { data: vehicleData, error: vehicleError } = await supabaseAdmin
      .from("vehicles")
      .insert({
        client_id: clientData.id,
        plate: body.vehiclePlate.toUpperCase(),
        brand: body.vehicleBrand,
        model: body.vehicleModel,
        year: body.vehicleYear || null,
        color: body.vehicleColor || null,
        is_active: true,
      })
      .select("id")
      .single();

    if (vehicleError) {
      console.error("create-quick-client: Error creating vehicle", vehicleError);
      // Rollback client creation
      await supabaseAdmin.from("clients").delete().eq("id", clientData.id);
      return new Response(
        JSON.stringify({ error: `Erro ao criar veículo: ${vehicleError.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("create-quick-client: Vehicle created:", vehicleData.id);

    // 3. Generate order number and create service order
    const year = new Date().getFullYear();
    const { data: lastOrder } = await supabaseAdmin
      .from("service_orders")
      .select("order_number")
      .like("order_number", `${year}-%`)
      .order("order_number", { ascending: false })
      .limit(1)
      .single();

    let nextNumber = 1;
    if (lastOrder?.order_number) {
      const parts = lastOrder.order_number.split("-");
      if (parts.length === 2) {
        nextNumber = parseInt(parts[1], 10) + 1;
      }
    }
    const orderNumber = `${year}-${nextNumber.toString().padStart(5, "0")}`;

    const { data: osData, error: osError } = await supabaseAdmin
      .from("service_orders")
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
      await supabaseAdmin.from("vehicles").delete().eq("id", vehicleData.id);
      await supabaseAdmin.from("clients").delete().eq("id", clientData.id);
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
