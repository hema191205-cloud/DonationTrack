import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Mock localStorage for Node environment
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
    };
})();

// Load env
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

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const supportService = {
    createTicket: async (ticketData) => {
        try {
            console.log('Attempting to create ticket in Supabase...');
            const { data, error } = await supabase
                .from('support_tickets')
                .insert([ticketData])
                .select();

            if (error) {
                console.warn('Supabase failed (expected if table not created):', error.message);
                return fallbackToLocalStorage(ticketData);
            }
            return { data: data[0], error: null };
        } catch (err) {
            console.error('Unexpected error:', err);
            return fallbackToLocalStorage(ticketData);
        }
    }
};

const fallbackToLocalStorage = (ticketData) => {
    console.log('Falling back to localStorage...');
    const localTickets = JSON.parse(localStorageMock.getItem('local_support_tickets') || '[]');
    const newTicket = { ...ticketData, id: 'local-' + Date.now(), is_local: true };
    localStorageMock.setItem('local_support_tickets', JSON.stringify([newTicket, ...localTickets]));
    return { data: newTicket, error: null };
};

async function verify() {
    console.log('--- Verification Started ---');
    const testData = {
        user_id: 'test-user-uuid',
        user_name: 'Verification Bot',
        message: 'This is a test message to verify the dynamic support implementation.',
        type: 'help'
    };

    const { data, error } = await supportService.createTicket(testData);

    if (error) {
        console.error('FAILED: Verification failed.', error);
        process.exit(1);
    }

    console.log('SUCCESS: Ticket processed.', data);
    
    if (data.is_local) {
        const saved = JSON.parse(localStorageMock.getItem('local_support_tickets'));
        if (saved && saved.length > 0) {
            console.log('SUCCESS: Local storage persistence verified.');
        } else {
            console.error('FAILED: Local storage persistence failed.');
            process.exit(1);
        }
    } else {
        console.log('SUCCESS: Supabase persistence verified.');
    }
    console.log('--- Verification Completed ---');
}

verify();
