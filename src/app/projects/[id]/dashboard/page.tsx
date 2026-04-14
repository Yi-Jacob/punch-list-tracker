"use client";

import Link from "next/link";
import { useEffect, useState, use } from "react";

type PunchItem = {
  id: string;
  location: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string | null;
};

type Project = {
  id: string;
  name: string;
  address: string;
  items: PunchItem[];
};

function groupBy(items: PunchItem[], key: keyof PunchItem): Record<string, PunchItem[]> {
  const groups: Record<string, PunchItem[]> = {};
  for (const item of items) {
    const val = (item[key] as string) || "Unassigned";
    if (!groups[val]) groups[val] = [];
    groups[val].push(item);
  }
  return groups;
}

function BreakdownTable({
  title,
  groups,
}: {
  title: string;
  groups: Record<string, PunchItem[]>;
}) {
  const entries = Object.entries(groups).sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2">{title}</th>
            <th className="pb-2">Open</th>
            <th className="pb-2">In Progress</th>
            <th className="pb-2">Complete</th>
            <th className="pb-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([name, items]) => {
            const open = items.filter((i) => i.status === "open").length;
            const inProgress = items.filter((i) => i.status === "in_progress").length;
            const complete = items.filter((i) => i.status === "complete").length;
            return (
              <tr key={name} className="border-b last:border-0">
                <td className="py-2 font-medium">{name}</td>
                <td className="py-2">
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                    {open}
                  </span>
                </td>
                <td className="py-2">
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded">
                    {inProgress}
                  </span>
                </td>
                <td className="py-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                    {complete}
                  </span>
                </td>
                <td className="py-2 font-semibold">{items.length}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then(setProject)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (!project) return <p className="p-6 text-red-500">Project not found</p>;

  const items = project.items;
  const total = items.length;
  const open = items.filter((i) => i.status === "open").length;
  const inProgress = items.filter((i) => i.status === "in_progress").length;
  const complete = items.filter((i) => i.status === "complete").length;
  const pct = total === 0 ? 0 : Math.round((complete / total) * 100);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href={`/projects/${id}`} className="text-blue-600 text-sm hover:underline">
          &larr; Back to Items
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">{project.name} — Dashboard</h1>
      <p className="text-gray-600 mb-6">{project.address}</p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border rounded-lg p-4 text-center">
          <div className="text-3xl font-bold">{total}</div>
          <div className="text-sm text-gray-500">Total Items</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{open}</div>
          <div className="text-sm text-gray-500">Open</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-yellow-600">{inProgress}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="border rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{complete}</div>
          <div className="text-sm text-gray-500">Complete</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg font-semibold">{pct}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-green-500 h-4 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-6">
        <BreakdownTable title="Location" groups={groupBy(items, "location")} />
        <BreakdownTable title="Priority" groups={groupBy(items, "priority")} />
        <BreakdownTable title="Assignee" groups={groupBy(items, "assigned_to")} />
      </div>
    </main>
  );
}
