import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Load env from .env
let supabaseUrl = ''
let supabaseAnonKey = ''

try {
    const envContent = fs.readFileSync('.env', 'utf8')
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            if (key.trim() === 'VITE_SUPABASE_URL') supabaseUrl = value.trim()
            if (key.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = value.trim()
        }
    })
} catch (e) {
    console.error('Failed to read .env', e)
}

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupportTable() {
    console.log('Testing support_tickets table in DONARTRACK PROJECT...')
    const testTicket = {
        user_id: '00000000-0000-0000-0000-000000000000', // Mock UUID
        user_name: 'Test Assistant',
        user_role: 'assistant',
        subject: 'Test Ticket from DONARTRACK PROJECT',
        message: 'Checking if the support_tickets table exists and is writable in this instance.',
        status: 'pending'
    }

    const { data, error } = await supabase
        .from('support_tickets')
        .insert([testTicket])
        .select()

    if (error) {
        console.error('Error:', error.message)
        if (error.code === '42P01') {
            console.error('Table support_tickets does NOT exist.')
        }
    } else {
        console.log('Success! Ticket created:', data)
    }
}

testSupportTable()
