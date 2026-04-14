import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*, items:punch_items(status)")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const result = projects.map((p) => {
    const items = p.items as { status: string }[];
    const total = items.length;
    const complete = items.filter((i) => i.status === "complete").length;
    return {
      id: p.id,
      name: p.name,
      address: p.address,
      status: p.status,
      created_at: p.created_at,
      itemCount: total,
      completionPct: total === 0 ? 0 : Math.round((complete / total) * 100),
    };
  });

  return Response.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, address } = body;

  if (!name || !address) {
    return Response.json({ error: "Name and address are required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("projects")
    .insert({ name, address })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
