import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("exercise-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("[API] Error uploading image:", uploadError);
      return NextResponse.json({ error: "Error uploading image" }, { status: 500 });
    }

    const { data } = supabase.storage
      .from("exercise-images")
      .getPublicUrl(fileName);

    return NextResponse.json({ imageUrl: data.publicUrl });
  } catch (error) {
    console.error("[API] Error processing image upload:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
