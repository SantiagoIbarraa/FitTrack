import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET all exercises
export async function GET() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("gym_exercises")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("[API] Database error:", error);
      return NextResponse.json({ error: "Error fetching exercises" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error fetching gym exercises:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST a new exercise
export async function POST(request: Request) {
  const supabase = await createClient();
  const formData = await request.json();

  const { name, category, description, image_url } = formData;
  console.log(formData, "el formdata que hicimos")
 

  if (!name || !category) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }



  //correcto
  try {
    const { data, error } = await supabase
      .from("gym_exercises")
      .insert({ name, category, description, image_url })
      .select()
      .single();

    if (error) {
      console.error("[API] Database error on create:", error);
      return NextResponse.json({ error: "Error creating exercise" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating exercise:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
console.log("si lees esto te gusta las empanadas")
