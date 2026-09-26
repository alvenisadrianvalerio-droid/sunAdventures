import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { message } = await request.json();
    if (!message?.contenido) throw new Error("Falta el mensaje");

    webpush.setVapidDetails(
      Deno.env.get("VAPID_SUBJECT")!,
      Deno.env.get("VAPID_PUBLIC_KEY")!,
      Deno.env.get("VAPID_PRIVATE_KEY")!,
    );

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: subscriptions, error } = await admin
      .from("push_subscriptions")
      .select("id,subscription")
      .neq("user_id", message.user_id);
    if (error) throw error;

    await Promise.all((subscriptions || []).map(async ({ id, subscription }) => {
      try {
        await webpush.sendNotification(subscription, JSON.stringify({
          title: "Nuevo mensaje 💛",
          body: message.contenido,
          url: "/#chat",
        }));
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await admin.from("push_subscriptions").delete().eq("id", id);
        } else {
          console.warn("No se pudo notificar una suscripción:", error);
        }
      }
    }));

    return new Response(JSON.stringify({ sent: subscriptions?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
