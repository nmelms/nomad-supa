"use server";

import { createClient } from "@/lib/supabase/server";

export async function addCampsite(formData: FormData) {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const lat = Number(formData.get("latitude"));
  const lng = Number(formData.get("longitude"));

  const { error } = await supabase.from("campsites").insert({
    name,
    state,
    lat,
    lng,
  });

  if (error) {
    throw new Error(error.message);
  }
}
