import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params {
  params: { id: string };
}

// PUT (update) an exercise
export async function PUT(request: Request, { params }: Params) {
  const supabase = await createClient();
  const { id } = params;
  const body = await request.json();

  const { name, category, description, image_url } = body;

  if (!name || !category) {
    return NextResponse.json({ error: "Name and category are required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("gym_exercises")
      .update({
        name,
        category,
        description,
        image_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[API] Database error on update:", error);
      return NextResponse.json({ error: "Error updating exercise" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] Error updating exercise:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE an exercise
export async function DELETE(request: Request, { params }: Params) {
  const supabase = await createClient();
  const { id } = params;

  try {
    const { error } = await supabase.from("gym_exercises").delete().eq("id", id);

    if (error) {
      console.error("[API] Database error on delete:", error);
      return NextResponse.json({ error: "Error deleting exercise" }, { status: 500 });
    }

    return NextResponse.json({ message: "Exercise deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("[API] Error deleting exercise:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
