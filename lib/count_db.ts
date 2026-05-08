import { supabaseAdmin } from "./supabase";

async function countEverything() {
  const { count: leadCount } = await supabaseAdmin.from("leads").select("*", { count: "exact", head: true });
  const { count: campaignCount } = await supabaseAdmin.from("campaigns").select("*", { count: "exact", head: true });
  
  console.log("Total Leads in DB:", leadCount);
  console.log("Total Campaigns in DB:", campaignCount);
  
  if (leadCount === 0 && campaignCount > 0) {
    const { data: campaigns } = await supabaseAdmin.from("campaigns").select("*");
    console.log("Campaigns with leads count > 0:", campaigns?.filter(c => c.total_leads > 0).length);
  }
}

countEverything();
