
import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// Replace these placeholders with your actual Supabase project URL and public anon key.
// You can find these in your Supabase project's dashboard under Settings > API.
const supabaseUrl = 'https://eqhoghvittwcrhkdcgkj.supabase.co'; // e.g., 'https://xyzabc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxaG9naHZpdHR3Y3Joa2RjZ2tqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNDQzMDUsImV4cCI6MjA2NzcyMDMwNX0.7TAXi7MsgDpMNXuN-xexFI2gCRm-jW9aSCFiivnlnTM'; // e.g., 'ey...'

if (supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
  const errorMessage = "Supabase credentials are not set. Please replace 'YOUR_SUPABASE_URL' and 'YOUR_SUPABASE_ANON_KEY' in supabaseClient.ts with your actual Supabase project credentials.";
  
  // Display a user-friendly error on the page itself to make it obvious.
  const root = document.getElementById('root');
  if (root) {
      root.innerHTML = `
        <div style="padding: 2rem; text-align: center; font-family: sans-serif; background-color: #fff5f5; border: 1px solid #fecaca; color: #991b1b; margin: 2rem; border-radius: 0.5rem;">
            <h1 style="font-size: 1.5rem; font-weight: bold;">Configuration Error</h1>
            <p style="margin-top: 1rem;">${errorMessage}</p>
        </div>
      `;
  }
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
        fetch: fetch.bind(globalThis),
    }
});