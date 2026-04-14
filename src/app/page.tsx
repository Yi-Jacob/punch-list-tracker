"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProjectSummary = {
  id: string;
  name: string;
  address: string;
  status: string;
  itemCount: number;
  completionPct: number;
  createdAt: string;
};

export default function Home() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Punch List Tracker</h1>
        <Link
          href="/projects/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          New Project
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No projects yet</p>
          <p>Create your first project to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block border rounded-lg p-4 hover:border-blue-400 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">{p.name}</h2>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    p.completionPct === 100
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {p.completionPct}% complete
                </span>
              </div>
              <p className="text-gray-600 text-sm">{p.address}</p>
              <p className="text-gray-400 text-xs mt-1">
                {p.itemCount} item{p.itemCount !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
