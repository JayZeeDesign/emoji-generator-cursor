import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import Replicate from "replicate";

// Add this type definition at the top of the file
type ReplicateOutput = string[] | Record<string, unknown>;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: Request) {
  console.log('Received POST request to generate emoji');
  const { userId } = auth();
  console.log('User ID:', userId);

  if (!userId) {
    console.log('Unauthorized: No user ID');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { prompt } = await request.json();
  console.log('Prompt:', prompt);

  try {
    console.log('Generating emoji with Replicate');
    const output = await replicate.run(
      "fofr/sdxl-emoji:dee76b5afde21b0f01ed7925f0665b7e879c50ee718c5f78a9d38e04d523cc5e",
      {
        input: {
          prompt: "A TOK emoji of " + prompt,
          width: 1024,
          height: 1024,
          refine: "no_refiner",
          scheduler: "K_EULER",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt: "",
          prompt_strength: 0.8,
          num_inference_steps: 50
        }
      }
    ) as ReplicateOutput;
    console.log('Replicate output:', output);

    if (!Array.isArray(output) || typeof output[0] !== 'string') {
      throw new Error('Failed to generate emoji: Unexpected output format');
    }

    const imageUrl = output[0];

    // Download the image
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const fileName = `${userId}_${Date.now()}.png`;
    console.log('Uploading to Supabase Storage');
    const { error: uploadError } = await supabase.storage
      .from('emojis')
      .upload(fileName, buffer, {
        contentType: 'image/png',
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL of the uploaded image
    console.log('Getting public URL');
    const { data: { publicUrl } } = supabase.storage
      .from('emojis')
      .getPublicUrl(fileName);

    // Add entry to emojis table
    console.log('Adding entry to emojis table');
    const { data: emojiData, error: emojiError } = await supabase
      .from('emojis')
      .insert({
        image_url: publicUrl,
        prompt,
        creator_user_id: userId,
      })
      .select()
      .single();

    if (emojiError) {
      throw emojiError;
    }

    console.log('Emoji generated successfully:', emojiData);
    return NextResponse.json({ success: true, emoji: emojiData });
  } catch (error) {
    console.error('Error generating or uploading emoji:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate or upload emoji', details: errorMessage }, { status: 500 });
  }
}

export const config = {
  maxDuration: 300, // 5 minutes
};