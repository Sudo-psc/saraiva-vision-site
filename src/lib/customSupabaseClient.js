import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yluhrvsqdohxcnwwrekz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsdWhydnNxZG9oeGNud3dyZWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyNTMyNTUsImV4cCI6MjA1NTgyOTI1NX0.EbMXKQua6g8HyrZlTcF3VFOd1ehGcgye84uzEv_WnrQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);