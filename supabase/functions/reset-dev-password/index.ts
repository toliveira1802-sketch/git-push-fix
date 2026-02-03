import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const email = "dev2@doctor.com";
    const password = "123456";

    console.log("Creating new dev user:", email);

    // Create new user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: "Dev User 2" },
    });

    if (authError) {
      console.error("Error creating user:", authError);
      
      if (authError.message.includes("already been registered")) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: "Usuário já existe. Tente dev2@doctor.com / 123456",
            email 
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = authData.user.id;
    console.log("User created:", userId);

    // Update role to dev
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .update({ role: "dev" })
      .eq("user_id", userId);

    if (roleError) {
      console.error("Error updating role:", roleError);
      // Try insert if update failed
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: userId, role: "dev" });
    }

    console.log("Success! New dev user created");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Novo usuário dev criado!",
        email,
        password,
        userId
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
