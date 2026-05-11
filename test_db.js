import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rqgzdtzoasuzedwquejr.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZ3pkdHpvYXN1emVkd3F1ZWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MjEwNTUsImV4cCI6MjA4OTk5NzA1NX0.sdq17w5vnN-zrwVDz3C0L7BfWPPQY1Br_LVqgPCfX00'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log("Checking Supabase connection...");
  
  const tables = ['donations', 'requests'];
  
  for (const table of tables) {
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error(`Error checking table '${table}':`, error.message);
    } else {
      console.log(`Table '${table}': ${count || 0} records found.`);
    }
  }

  // Check sample data
  const { data: dons } = await supabase.from('donations').select('*').limit(3);
  console.log("Sample Donations:", JSON.stringify(dons, null, 2));

  const { data: reqs } = await supabase.from('requests').select('*').limit(3);
  console.log("Sample Requests:", JSON.stringify(reqs, null, 2));
}

checkDatabase().catch(console.error);
