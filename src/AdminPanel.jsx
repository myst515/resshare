import './index.css';
import React, { useEffect, useState } from 'react';
import ApiService from './services/ApiService.js';

{/* StatusShape renders distinct badges for Available, In Use, and Suspended */}
function StatusShape({ status }) {
    let styles = "bg-gray-100 text-gray-500";
    let label = "Suspended";

    if (status === "available" || status === "Active") {
        styles = "bg-emerald-50 text-emerald-700";
        label = "Available";
    } else if (status === "in_use") {
        styles = "bg-blue-50 text-blue-700";
        label = "In Use";
    }

    return (
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${styles}`}>
            {label}
        </span>
    );
}

export default function AdminPanel() {
    const [resources, setResources] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newResource, setNewResource] = useState({
        name: "",
        type: "Washing Machine",
        location: "",
        status: "available"
    });
    const [activeFloor, setActiveFloor] = useState("All");

    async function loadFacilities() {
        try {
            setIsLoading(true);
            const data = await ApiService.get('/facilities');

            // Preserves real PostgreSQL status ('available', 'in_use', 'suspended')
            const formatted = data.map(f => ({
                id: f.id,
                name: f.name,
                type: f.type,
                location: f.location,
                floor_number: f.floor_number,
                status: f.status
            }));

            setResources(formatted);
        } catch (err) {
            console.error('Failed to load facilities:', err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadFacilities();
    }, []);

    const floors = ["All", ...new Set(resources.map((r) => `Floor ${r.floor_number}`))];

    {/* ToggleStatus: Sends PATCH to update status in PostgreSQL */}
    async function ToggleStatus(resource) {
        if (resource.status === 'in_use') {
            alert('Cannot suspend a resource that is currently in use by a resident!');
            return;
        }

        const newDbStatus = resource.status === 'suspended' ? 'available' : 'suspended';

        try {
            await ApiService.patch(`/facilities/${resource.id}/status`, {
                status: newDbStatus
            });

            // Update UI on success
            setResources((prev) =>
                prev.map((r) => (r.id === resource.id ? { ...r, status: newDbStatus } : r))
            );

        } catch (err) {
            alert(`Error updating status: ${err.message}`);
        }
    }

    async function RemoveResource(id, status) {
        if (status === 'in_use') {
            alert('Cannot remove a resource that is currently in use by a resident!');
            return;
        }

        if (!window.confirm("Are you sure you want to permanently remove this resource?")) {
            return;
        }

        try {
            await ApiService.delete(`/facilities/${id}`);
            setResources((prev) => prev.filter((r) => r.id !== id));
        } catch (err) {
            alert(`Error removing resource: ${err.message}`);
        }
    }

    async function AddResource() {
        if (!newResource.name.trim() || !newResource.location.trim()) return;

        try {
            const created = await ApiService.post('/facilities', {
                name: newResource.name,
                type: newResource.type,
                location: newResource.location
            });

            setResources((prev) => [...prev, created]);
            setNewResource({ name: "", type: "Washing Machine", location: "", status: "available" });
            setFormOpen(false);

        } catch (err) {
            alert(`Error adding resource: ${err.message}`);
        }
    }

    const visibleResources = activeFloor === "All"
        ? resources
        : resources.filter((r) => `Floor ${r.floor_number}` === activeFloor);

    return (
        <div className="min-h-screen p-8">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl mb-4 font-bold">Resource Directory</h1>

                <button
                    onClick={() => setFormOpen((v) => !v)}
                    className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer hover:opacity-80 transition"
                >
                    {formOpen ? "Cancel" : "Add Resource"}
                </button>
            </div>

            {formOpen && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 flex gap-2 shadow-sm">
                    <input
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm flex-1 text-black"
                        placeholder="Resource name"
                        value={newResource.name}
                        onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                    />
                    <select
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm text-black"
                        value={newResource.type}
                        onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                    >
                        <option>Washing Machine</option>
                        <option>Kitchen Stove</option>
                        <option>Clothes Dryer</option>
                    </select>
                    <input
                        className="border border-gray-200 rounded-md px-3 py-2 text-sm flex-1 text-black"
                        placeholder="Location (e.g. Floor 2 Laundry Room)"
                        value={newResource.location}
                        onChange={(e) => setNewResource({ ...newResource, location: e.target.value })}
                    />
                    <button
                        onClick={AddResource}
                        className="bg-teal-600 text-white text-sm font-semibold px-4 py-2 cursor-pointer rounded-lg hover:bg-teal-700 transition"
                    >
                        Save
                    </button>
                </div>
            )}

            {/* Floor Filter Buttons */}
            <div className="flex gap-2 mb-4">
                {floors.sort().map((f) => (
                    <button
                        key={f}
                        onClick={() => setActiveFloor(f)}
                        className={`text-sm cursor-pointer font-semibold px-3.5 py-1.5 rounded-full border transition ${
                            activeFloor === f
                                ? "bg-teal-600 border-teal-600 text-white"
                                : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            {isLoading ? (
                <p className="text-gray-500 text-sm py-4">Loading resources from database...</p>
            ) : (
                <table className="w-full text-sm bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <thead>
                        <tr className="text-left text-xs font-semibold text-gray-500 border-b border-gray-200 bg-gray-50/50">
                            <th className="p-3">Resource Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Location</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleResources.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-4 text-center text-gray-400">
                                    No resources found.
                                </td>
                            </tr>
                        ) : (
                            visibleResources.map((r) => {
                                const isInUse = r.status === 'in_use';

                                return (
                                    <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition">
                                        <td className="p-3 font-semibold text-gray-900">{r.name}</td>
                                        <td className="p-3 text-gray-600">{r.type}</td>
                                        <td className="p-3 text-gray-600">{r.location}</td>
                                        <td className="p-3">
                                            <StatusShape status={r.status} />
                                        </td>
                                        <td className="p-3">
                                            <button
                                                disabled={isInUse}
                                                className={`text-sm font-semibold px-2.5 py-1 rounded-md mr-10 transition ${
                                                    isInUse
                                                        ? "opacity-30 cursor-not-allowed text-gray-400 border border-gray-300"
                                                        : r.status === "suspended"
                                                        ? "text-teal-700 border border-teal-600 hover:bg-teal-50 cursor-pointer"
                                                        : "text-gray-500 border border-gray-600 hover:bg-gray-100 cursor-pointer"
                                                }`}
                                                onClick={() => ToggleStatus(r)}
                                            >
                                                {r.status === "suspended" ? "Activate" : "Suspend"}
                                            </button>

                                            <button
                                                disabled={isInUse}
                                                onClick={() => RemoveResource(r.id, r.status)}
                                                className={`text-sm font-semibold transition ${
                                                    isInUse
                                                        ? "opacity-30 cursor-not-allowed text-gray-400"
                                                        : "text-red-600 hover:underline cursor-pointer"
                                                }`}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}