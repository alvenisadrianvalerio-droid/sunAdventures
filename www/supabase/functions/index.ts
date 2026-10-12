// Edge Function: reset-password
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, usuario, codigo, nuevaPassword } = await req.json();

    if (!usuario) return json({ error: "Falta el usuario" }, 400);
    const email = `${usuario.toLowerCase().trim()}@foursunflowers.local`;

    // ---------- ACCIÓN 1: solicitar código ----------
    if (action === "solicitar") {
      const { data: users, error } = await admin.auth.admin.listUsers();
      if (error) return json({ error: "Error consultando usuarios" }, 500);
      const existe = users.users.some(u => u.email === email);
      if (!existe) {
        return json({ ok: true, mensaje: "Si el usuario existe, se ha generado un código." });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expira = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const { error: upErr } = await admin
        .from("reset_codes")
        .upsert({ usuario: usuario.toLowerCase().trim(), codigo: code, expira, usado: false }, { onConflict: "usuario" });
      if (upErr) return json({ error: "Error guardando código: " + upErr.message }, 500);

      return json({ ok: true, codigo: code, mensaje: "Usa este código para cambiar tu contraseña." });
    }

    // ---------- ACCIÓN 2: confirmar código y cambiar contraseña ----------
    if (action === "confirmar") {
      if (!codigo || !nuevaPassword) return json({ error: "Faltan datos" }, 400);
      if (nuevaPassword.length < 6) return json({ error: "La contraseña debe tener al menos 6 caracteres" }, 400);

      const { data: rc, error: rErr } = await admin
        .from("reset_codes")
        .select("codigo, expira, usado")
        .eq("usuario", usuario.toLowerCase().trim())
        .single();
      if (rErr || !rc) return json({ error: "No hay código solicitado para este usuario" }, 400);
      if (rc.usado) return json({ error: "Este código ya se usó" }, 400);
      if (new Date(rc.expira) < new Date()) return json({ error: "El código ha caducado" }, 400);
      if (rc.codigo !== codigo.toString()) return json({ error: "Código incorrecto" }, 400);

      const { data: users } = await admin.auth.admin.listUsers();
      const target = users.users.find(u => u.email === email);
      if (!target) return json({ error: "Usuario no encontrado" }, 404);

      const { error: updErr } = await admin.auth.admin.updateUserById(target.id, { password: nuevaPassword });
      if (updErr) return json({ error: "No se pudo cambiar: " + updErr.message }, 500);

      await admin.from("reset_codes").update({ usado: true }).eq("usuario", usuario.toLowerCase().trim());

      return json({ ok: true, mensaje: "Contraseña actualizada correctamente." });
    }

    return json({ error: "Acción no válida" }, 400);
  } catch (err) {
    return json({ error: "Error inesperado: " + (err?.message || err) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}