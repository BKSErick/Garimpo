import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Usamos a service_role key para bypass de RLS no server-side (uso próprio)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
