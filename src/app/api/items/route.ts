import { createClient } from "@/utils/supabase/server";
import { VALID_PRIORITIES } from "@/lib/status";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, location, description, priority, assignedTo, photo } = body;

  if (!projectId || !location || !description) {
    return Response.json(
      { error: "projectId, location, and description are required" },
      { status: 400 }
    );
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return Response.json(
      { error: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("punch_items")
    .insert({
      project_id: projectId,
      location,
      description,
      priority: priority || "normal",
      assigned_to: assignedTo || null,
      photo: photo || null,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
