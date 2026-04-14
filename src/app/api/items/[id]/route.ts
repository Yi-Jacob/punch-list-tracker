import { createClient } from "@/utils/supabase/server";
import { isValidTransition, getTransitionError, VALID_PRIORITIES } from "@/lib/status";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const { data: item, error: fetchError } = await supabase
    .from("punch_items")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !item) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  if (body.status && body.status !== item.status) {
    if (!isValidTransition(item.status, body.status)) {
      return Response.json(
        { error: getTransitionError(item.status, body.status) },
        { status: 400 }
      );
    }
  }

  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    return Response.json(
      { error: `Priority must be one of: ${VALID_PRIORITIES.join(", ")}` },
      { status: 400 }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.assignedTo !== undefined) updateData.assigned_to = body.assignedTo;
  if (body.priority) updateData.priority = body.priority;
  if (body.photo !== undefined) updateData.photo = body.photo;
  if (body.location) updateData.location = body.location;
  if (body.description) updateData.description = body.description;

  const { data, error } = await supabase
    .from("punch_items")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { error } = await supabase.from("punch_items").delete().eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
