import './index.css';
import React, { useEffect, useState } from 'react';
import ApiService from './services/ApiService.js';

{/* StatusShape is a function that controls the style of the status text on the admin panel */}
function StatusShape({ status }) {
    const isActive = status === "Active" || status === "available";
    const styles = isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500";
    
    return (
        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${styles}`}>
            {isActive ? "Active" : "Suspended"}
        </span>
    );
}

{/* AdminPanel is a component that renders the Admin panel on the admin page. The admin panel is basically a table that shows the state of all the resources in the building and 
  allows an admin to add, remove, suspend and activate a resource */}
export default function AdminPanel() {
    /* State holding resources fetched directly from the database */
    const [resources, setResources] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [newResource, setNewResource] = useState({
        name: "",
        type: "Washing Machine",
        location: "",
        status: "Active"
    });
    const [activeFloor, setActiveFloor] = useState("All");

    /*
     * DYNAMIC INTEGRATION:
     * Fetch all facilities from PostgreSQL when the Admin Panel mounts.
     */
    async function loadFacilities() {
        try {
            setIsLoading(true);
            const data = await ApiService.get('/facilities');

            // Map PostgreSQL rows to AdminPanel display format
            const formatted = data.map(f => ({
                id: f.id,
                name: f.name,
                type: f.type,
                location: f.location,
                floor_number: f.floor_number,
                status: f.status === 'suspended' ? 'Suspended' : 'Active'
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

    /* floors is basically an array of floors from the available resources in state. new Set() removes duplicates, keeping only unique floor names */
    const floors = ["All", ...new Set(resources.map((r) => floorOf(r.location)))];

    {/* ToggleStatus is a local function that toggles the status of the Activate/Suspend button on the admin panel it takes in the id of the selected resource as input */}
    function ToggleStatus(id) {
        setResources((prev) => 
            prev.map((r) => {
                if (r.id !== id) {
                    return r;
                } 
                const newStatus = r.status === "Active" ? "Suspended" : "Active";
                return { ...r, status: newStatus };
            })
        );
    }

    {/* RemoveResource sends a DELETE request to PostgreSQL so the row is removed permanently */}
    async function RemoveResource(id) {
        if (!window.confirm("Are you sure you want to permanently remove this resource?")) {
            return;
        }

        try {
            // Delete from PostgreSQL
            await ApiService.delete(`/facilities/${id}`);

            // Remove from React table on success
            setResources((prev) => prev.filter((r) => r.id !== id));
            console.log(`Resource #${id} successfully removed from database.`);

        } catch (err) {
            console.error('Failed to remove resource:', err);
            alert(`Error removing resource: ${err.message}`);
        }
    }

    {/* AddResource is a function that handles the AddResource button click. 
        BACKEND INTEGRATION: Sends the new facility to PostgreSQL via ApiService */}
    async function AddResource() {
        if (!newResource.name.trim() || !newResource.location.trim()) return;

        try {
            // Save to PostgreSQL database
            const created = await ApiService.post('/facilities', {
                name: newResource.name,
                type: newResource.type,
                location: newResource.location
            });

            // Add the created facility to state
            setResources((prev) => [
                ...prev,
                {
                    id: created.id,
                    name: created.name,
                    type: created.type,
                    location: created.location,
                    floor_number: created.floor_number,
                    status: created.status === 'suspended' ? 'Suspended' : 'Active'
                }
            ]);

            // Reset the form and close it
            setNewResource({ name: "", type: "Washing Machine", location: "", status: "Active" });
            setFormOpen(false);

        } catch (err) {
            console.error('Failed to create resource:', err);
            alert(`Error adding resource: ${err.message}`);
        }
    }

    function floorOf(location = "") {
        /* This uses a regex which looks for the word "Floor", optional whitespace, then captures one or more digits. */
        const match = location.match(/Floor\s*(\d+)/i);
        return match ? `Floor ${match[1]}` : "Other";
    }

    const visibleResources = activeFloor === "All"
        ? resources
        : resources.filter((r) => floorOf(r.location) === activeFloor);

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
                        placeholder="Resource name (e.g. Washer #4)"
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
                            visibleResources.map((r) => (
                                <tr key={r.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition">
                                    <td className="p-3 font-semibold text-gray-900">{r.name}</td>
                                    <td className="p-3 text-gray-600">{r.type}</td>
                                    <td className="p-3 text-gray-600">{r.location}</td>
                                    <td className="p-3">
                                        <StatusShape status={r.status} />
                                    </td>
                                    <td className="p-3">
                                        <button
                                            className={`text-sm font-semibold ${
                                                r.status !== "Active"
                                                    ? "text-teal-700 border border-teal-600"
                                                    : "text-gray-500 border border-gray-600"
                                            } px-2.5 py-1 rounded-md mr-10 cursor-pointer`}
                                            onClick={() => ToggleStatus(r.id)}
                                        >
                                            {r.status === "Active" ? "Suspend" : "Activate"}
                                        </button>
                                        <button
                                            onClick={() => RemoveResource(r.id)}
                                            className="text-sm font-semibold text-red-600 cursor-pointer hover:underline"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
}