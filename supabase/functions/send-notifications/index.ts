import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const expoAccessToken = Deno.env.get("EXPO_ACCESS_TOKEN");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, appointment_id, user_id, title, message, type } = await req.json();

    if (action === "send_appointment_reminder") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const { data: appointments, error } = await supabase
        .from("appointments_full")
        .select("*")
        .gte("scheduled_at", tomorrow.toISOString())
        .lt("scheduled_at", dayAfter.toISOString())
        .eq("status", "scheduled");

      if (error) throw error;

      const notifications = [];

      for (const apt of appointments || []) {
        if (!apt.patient_id) continue;

        const notification = {
          user_id: apt.patient_id,
          title: "Recordatorio de Cita",
          message: `Tu cita es mañana a las ${new Date(apt.scheduled_at).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}. ${apt.type_name || ""}`,
          type: "appointment_reminder",
          data: { appointment_id: apt.id },
        };

        notifications.push(notification);

        await supabase.from("notifications").insert(notification);
      }

      return new Response(
        JSON.stringify({ success: true, count: notifications.length }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "send_push_notification") {
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("push_token")
        .eq("id", user_id)
        .single();

      if (userError || !user?.push_token) {
        return new Response(
          JSON.stringify({ success: false, message: "No push token found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${expoAccessToken}`,
        },
        body: JSON.stringify({
          to: user.push_token,
          title,
          body: message,
          data: { type },
          sound: "default",
          badge: 1,
        }),
      });

      const result = await expoResponse.json();

      return new Response(
        JSON.stringify({ success: true, result }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create_notification") {
      const { error } = await supabase.from("notifications").insert({
        user_id,
        title,
        message,
        type: type || "general",
      });

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
