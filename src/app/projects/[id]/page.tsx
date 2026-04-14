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
  photo: string | null;
  created_at: string;
};

type Project = {
  id: string;
  name: string;
  address: string;
  status: string;
  items: PunchItem[];
};

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  complete: "bg-green-100 text-green-800",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const NEXT_STATUS: Record<string, string> = {
  open: "in_progress",
  in_progress: "complete",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  complete: "Complete",
};

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [assignedTo, setAssignedTo] = useState("");
  const [photo, setPhoto] = useState("");

  function fetchProject() {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then(setProject)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchProject();
  }, [id]);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: id,
        location,
        description,
        priority,
        assignedTo: assignedTo || null,
        photo: photo || null,
      }),
    });

    if (res.ok) {
      setLocation("");
      setDescription("");
      setPriority("normal");
      setAssignedTo("");
      setPhoto("");
      setShowForm(false);
      fetchProject();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function advanceStatus(item: PunchItem) {
    const nextStatus = NEXT_STATUS[item.status];
    if (!nextStatus) return;

    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.ok) {
      fetchProject();
    } else {
      const data = await res.json();
      setError(data.error);
    }
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/items/${itemId}`, { method: "DELETE" });
    fetchProject();
  }

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (!project) return <p className="p-6 text-red-500">Project not found</p>;

  const total = project.items.length;
  const complete = project.items.filter((i) => i.status === "complete").length;
  const pct = total === 0 ? 0 : Math.round((complete / total) * 100);

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 text-sm hover:underline">
          &larr; All Projects
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-600">{project.address}</p>
        </div>
        <div className="text-right">
          <Link
            href={`/projects/${id}/dashboard`}
            className="text-blue-600 text-sm hover:underline"
          >
            View Dashboard
          </Link>
          <div className="mt-2">
            <span className="text-2xl font-bold">{pct}%</span>
            <span className="text-gray-500 text-sm ml-1">complete</span>
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="ml-2 font-bold">
            &times;
          </button>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {showForm ? "Cancel" : "Add Punch Item"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={addItem} className="border rounded-lg p-4 mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Unit 204 - Kitchen"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Drywall patch needed behind door"
              rows={2}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Assigned To</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="John Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo URL</label>
              <input
                type="url"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="https://..."
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Item
          </button>
        </form>
      )}

      {project.items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No punch items yet. Add one above.
        </p>
      ) : (
        <div className="space-y-3">
          {project.items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded ${STATUS_COLORS[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${PRIORITY_COLORS[item.priority]}`}>
                    {item.priority}
                  </span>
                  <span className="text-xs text-gray-500">{item.location}</span>
                </div>
                <p className="font-medium">{item.description}</p>
                {item.assigned_to && (
                  <p className="text-sm text-gray-500 mt-1">Assigned to: {item.assigned_to}</p>
                )}
                {item.photo && (
                  <a
                    href={item.photo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                  >
                    View Photo
                  </a>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                {NEXT_STATUS[item.status] && (
                  <button
                    onClick={() => advanceStatus(item)}
                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100"
                  >
                    Mark {STATUS_LABELS[NEXT_STATUS[item.status]]}
                  </button>
                )}
                <button
                  onClick={() => deleteItem(item.id)}
                  className="text-sm text-red-500 px-2 py-1 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
