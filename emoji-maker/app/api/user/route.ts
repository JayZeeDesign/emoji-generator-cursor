import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user exists in profiles table
  const { data: existingUser, error: fetchError } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error fetching user:', fetchError);
    return NextResponse.json({ error: 'Error fetching user' }, { status: 500 });
  }

  if (!existingUser) {
    // Create new user profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ user_id: userId });

    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return NextResponse.json({ error: 'Error creating user profile' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}