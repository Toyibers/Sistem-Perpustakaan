import { supabase } from "./src/utils/supabaseClient";

async function check() {
  const { data, error } = await supabase.from('borrowings').select('updated_at').limit(1);
  console.log("Borrowings Data:", data);
  console.log("Borrowings Error:", error);
}

check();
