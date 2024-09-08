import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('emojis')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add cache control headers
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, max-age=0');

    return NextResponse.json({ emojis: data }, { headers });
  } catch (error) {
    console.error('Error fetching emojis:', error);
    return NextResponse.json({ error: 'Failed to fetch emojis' }, { status: 500 });
  }
}