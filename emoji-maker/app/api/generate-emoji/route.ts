import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import Replicate from "replicate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { prompt } = await request.json();

  try {
    // Generate emoji using Replicate
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
    );

    if (!output || typeof output[0] !== 'string') {
      throw new Error('Failed to generate emoji');
    }

    const imageUrl = output[0];

    // Download the image
    const response = await fetch(imageUrl);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const fileName = `${userId}_${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('emojis')
      .upload(fileName, buffer, {
        contentType: 'image/png',
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL of the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('emojis')
      .getPublicUrl(fileName);

    // Add entry to emojis table
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

    return NextResponse.json({ success: true, emoji: emojiData });
  } catch (error) {
    console.error('Error generating or uploading emoji:', error);
    return NextResponse.json({ error: 'Failed to generate or upload emoji' }, { status: 500 });
  }
}