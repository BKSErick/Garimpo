import { supabaseAdmin } from "./supabase";

async function checkLeads() {
  const campaignId = "d7d14fa7-f026-4170-a332-0523235e36b7";
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*")
    .eq("campaign_id", campaignId);
    
  console.log("Leads found for campaign:", data?.length || 0);
  if (data && data.length > 0) {
    console.log("First lead:", data[0].name);
  } else if (error) {
    console.error("Error fetching leads:", error.message);
  }
}

checkLeads();
