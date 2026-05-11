import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    // Try to select one row from feedback to see columns
    const { data, error } = await supabase.from('feedback').select('*').limit(1)
    if (error) {
        console.error('Error fetching feedback:', error)
    } else {
        console.log('Feedback columns:', data.length > 0 ? Object.keys(data[0]) : 'No data')
    }

    // Try to select one row from donations
    const { data: donData, error: donErr } = await supabase.from('donations').select('*').limit(1)
    if (donErr) {
        console.error('Error fetching donations:', donErr)
    } else {
        console.log('Donation columns:', donData.length > 0 ? Object.keys(donData[0]) : 'No data')
    }
}

checkSchema()
