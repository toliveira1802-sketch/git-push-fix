import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const email = 'admin@doctorautoprime.com.br';
    const password = 'admin123';

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      // Update password if user exists
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        { password }
      );
      if (updateError) throw updateError;
      userId = existingUser.id;
      console.log('User password updated:', email);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Administrador Master' }
      });
      if (createError) throw createError;
      userId = newUser.user.id;
      console.log('User created:', email);
    }

    // Check if colaboradores entry exists
    const { data: existingProfile } = await supabaseAdmin
      .from('colaboradores')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingProfile) {
      // Create colaboradores entry
      const { error: profileError } = await supabaseAdmin
        .from('colaboradores')
        .insert({
          user_id: userId,
          full_name: 'Administrador Master',
          cargo: 'Master',
          must_change_password: false
        });
      if (profileError) console.error('Profile error:', profileError);
    }

    // Check if role exists
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!existingRole) {
      // Assign 'dev' role (master role in the system)
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role: 'dev' });
      if (roleError) console.error('Role error:', roleError);
    } else {
      // Update to dev role
      await supabaseAdmin
        .from('user_roles')
        .update({ role: 'dev' })
        .eq('user_id', userId);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Admin user ready',
        credentials: { email, password, role: 'master (dev)' }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
