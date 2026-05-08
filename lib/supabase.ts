import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder";

// Usamos a service_role key para bypass de RLS no server-side (uso próprio)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
