// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('ADMIN_SERVICE_ROLE_KEY') ?? ''
    );

    // Manual JWT Verification untuk mendeteksi siapa yang memanggil API
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) throw new Error("Missing Auth Token");

    const { data: { user }, error: verifyErr } = await supabaseClient.auth.getUser(token);
    if (verifyErr || !user) throw new Error("Unauthorized: Invalid Token");


    const body = await req.json();
    const action = body.action || "create";

    if (action === "create") {
      const { email, password, role, nama } = body;
      if (!email || !password || !role || !nama) throw new Error("Missing fields for create");

      const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { role, nama },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already") || authError.message.toLowerCase().includes("registered")) {
          const { data: allUsers } = await supabaseClient.auth.admin.listUsers();
          const existing = allUsers?.users?.find((u: any) => u.email === email);
          if (existing) {
            return new Response(JSON.stringify({ user: existing }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }
        throw authError;
      }
      return new Response(JSON.stringify({ user: authData.user }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === "update") {
      const { id, password } = body;
      if (!id || !password) throw new Error("Missing fields for update");
      const { error } = await supabaseClient.auth.admin.updateUserById(id, { password });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === "delete") {
      const { id } = body;
      if (!id) throw new Error("Missing id for delete");
      const { error } = await supabaseClient.auth.admin.deleteUser(id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error("Invalid action parameter");
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
