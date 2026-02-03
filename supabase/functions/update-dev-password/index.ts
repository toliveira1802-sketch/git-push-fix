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

    const password = "123456";

    // Get existing dev users from user_roles
    const { data: devRoles, error: rolesError } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "dev");

    if (rolesError) {
      console.error("Error fetching dev roles:", rolesError);
      return new Response(
        JSON.stringify({ error: rolesError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!devRoles || devRoles.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "Nenhum usuário dev encontrado na tabela user_roles"
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    // Update password for all dev users
    for (const devUser of devRoles) {
      try {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          devUser.user_id,
          { password, email_confirm: true }
        );

        if (updateError) {
          results.push({ userId: devUser.user_id, success: false, error: updateError.message });
        } else {
          // Ensure must_change_password is false
          await supabaseAdmin.from("colaboradores").update({
            must_change_password: false
          }).eq("user_id", devUser.user_id);
          
          results.push({ userId: devUser.user_id, success: true });
        }
      } catch (e) {
        results.push({ userId: devUser.user_id, success: false, error: String(e) });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`Password updated for ${successCount}/${results.length} dev users`);

    return new Response(
      JSON.stringify({ 
        success: successCount > 0, 
        message: `Senha 123456 resetada para ${successCount} usuários dev!`,
        password,
        results
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