import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('emoji_likes')
      .select('emoji_id')
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ likes: data });
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return NextResponse.json({ error: 'Failed to fetch user likes' }, { status: 500 });
  }
}