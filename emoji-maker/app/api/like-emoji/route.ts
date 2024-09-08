import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { emojiId } = await request.json();

  try {
    // Check if the user has already liked this emoji
    const { data: existingLike, error: likeError } = await supabase
      .from('emoji_likes')
      .select()
      .eq('user_id', userId)
      .eq('emoji_id', emojiId)
      .single();

    if (likeError && likeError.code !== 'PGRST116') throw likeError;

    let action: 'liked' | 'unliked';

    if (existingLike) {
      // User has already liked, so unlike
      await supabase
        .from('emoji_likes')
        .delete()
        .eq('user_id', userId)
        .eq('emoji_id', emojiId);
      action = 'unliked';
    } else {
      // User hasn't liked, so add like
      await supabase
        .from('emoji_likes')
        .insert({ user_id: userId, emoji_id: emojiId });
      action = 'liked';
    }

    // Update the likes count
    const { data: updatedEmoji, error: updateError } = await supabase.rpc(
        'update_emoji_likes_count',
        { emoji_id: emojiId }
      );
      
    if (updateError) throw updateError;
    
    console.log('Updated emoji data:', updatedEmoji); // Add this line
    
    return NextResponse.json({ 
        success: true, 
        likes_count: updatedEmoji[0].likes_count, // Make sure we're accessing the correct property
        action
    });
  } catch (error) {
    console.error('Error updating likes:', error);
    return NextResponse.json({ error: 'Failed to update likes' }, { status: 500 });
  }
}