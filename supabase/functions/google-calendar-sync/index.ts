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
    const googleCalendarApiKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
    const googleCalendarId = Deno.env.get("GOOGLE_CALENDAR_ID");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, appointment_id } = await req.json();

    if (action === "sync_to_google") {
      const { data: appointment, error: fetchError } = await supabase
        .from("appointments_full")
        .select("*")
        .eq("id", appointment_id)
        .single();

      if (fetchError) throw fetchError;

      const event = {
        summary: `${appointment.type_name} - ${appointment.patient_name}`,
        description: `Paciente: ${appointment.patient_name}\nDoctor: ${appointment.doctor_name}\nTipo: ${appointment.type_name}\nUbicación: ${appointment.location}`,
        start: {
          dateTime: appointment.scheduled_at,
          timeZone: "America/Mexico_City",
        },
        end: {
          dateTime: new Date(
            new Date(appointment.scheduled_at).getTime() +
              appointment.duration_minutes * 60000
          ).toISOString(),
          timeZone: "America/Mexico_City",
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: 60 },
            { method: "popup", minutes: 15 },
          ],
        },
      };

      const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${googleCalendarId}/events`;

      const response = await fetch(calendarUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleCalendarApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });

      const googleEvent = await response.json();

      if (googleEvent.id) {
        await supabase
          .from("appointments")
          .update({ google_calendar_event_id: googleEvent.id })
          .eq("id", appointment_id);
      }

      return new Response(
        JSON.stringify({ success: true, eventId: googleEvent.id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "sync_from_google") {
      const now = new Date();
      const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const calendarUrl = `https://www.googleapis.com/calendar/v3/calendars/${googleCalendarId}/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`;

      const response = await fetch(calendarUrl, {
        headers: {
          Authorization: `Bearer ${googleCalendarApiKey}`,
        },
      });

      const data = await response.json();

      return new Response(
        JSON.stringify({ success: true, events: data.items || [] }),
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
