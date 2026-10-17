import React, { useEffect, useState } from 'react';
import './index.css';
import ApiService from './services/ApiService.js';

export default function Announcements() {
    const [posts, setPosts] = useState([]);
    const [titleInput, setTitleInput] = useState("");
    const [bodyInput, setBodyInput] = useState("");
    const [targetFloor, setTargetFloor] = useState("All");
    const [editingPostId, setEditingPostId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    async function loadAnnouncements() {
        try {
            setIsLoading(true);
            const data = await ApiService.get('/announcements');
            setPosts(data);
        } catch (err) {
            console.error('Failed to load announcements:', err);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadAnnouncements();
    }, []);

    // Loads the selected announcement into the form for editing
    function startEdit(post) {
        setEditingPostId(post.id);
        setTitleInput(post.title);
        setBodyInput(post.body);
        setTargetFloor(post.floor_number ? String(post.floor_number) : "All");
    }

    function cancelEdit() {
        setEditingPostId(null);
        setTitleInput("");
        setBodyInput("");
        setTargetFloor("All");
    }

    async function deletePost(id) {
        if (!window.confirm("Are you sure you want to delete this broadcast?")) return;

        try {
            await ApiService.delete(`/announcements/${id}`);
            setPosts((prev) => prev.filter((p) => p.id !== id));
            if (editingPostId === id) {
                cancelEdit();
            }
        } catch (err) {
            alert(`Error deleting announcement: ${err.message}`);
        }
    }

    async function handleSubmit() {
        const title = titleInput.trim();
        const body = bodyInput.trim();
        if (!title || !body) {
            alert("Please provide both a title and a message.");
            return;
        }

        const floor = targetFloor === "All" ? null : parseInt(targetFloor, 10);

        try {
            if (editingPostId) {
                // UPDATE existing announcement in PostgreSQL
                const updated = await ApiService.put(`/announcements/${editingPostId}`, {
                    title,
                    body,
                    floorNumber: floor
                });

                setPosts((prev) => prev.map((p) => (p.id === editingPostId ? updated : p)));
                cancelEdit();
            } else {
                // CREATE new announcement in PostgreSQL
                const created = await ApiService.post('/announcements', {
                    title,
                    body,
                    floorNumber: floor
                });

                setPosts((prev) => [created, ...prev]);
                cancelEdit();
            }
        } catch (err) {
            alert(`Error saving announcement: ${err.message}`);
        }
    }

    return (
        <aside>
            <h2 className="text-lg font-semibold mb-4 text-black">Announcements</h2>

            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-5">
                <div className="text-sm font-bold text-teal-700 mb-2">
                    {editingPostId ? "Edit Announcement" : "Create Announcement"}
                </div>
                
                {/* Target Floor Selection */}
                <div className="mb-2 flex items-center gap-2">
                    <label className="text-xs font-semibold text-gray-600">Target:</label>
                    <select
                        value={targetFloor}
                        onChange={(e) => setTargetFloor(e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-black"
                    >
                        <option value="All">All Floors (Building-wide)</option>
                        <option value="1">Floor 1 Only</option>
                        <option value="2">Floor 2 Only</option>
                        <option value="3">Floor 3 Only</option>
                    </select>
                </div>

                {/* Separate Title Input */}
                <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    placeholder="Announcement Title (e.g. Deep Cleaning)"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white mb-2 text-black"
                />

                {/* Message Textarea */}
                <textarea
                    value={bodyInput}
                    onChange={(e) => setBodyInput(e.target.value)}
                    placeholder="Type important updates for residents here..."
                    className="w-full min-h-[70px] border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white mb-3 text-black"
                />

                <div className="flex gap-2">
                    <button
                        onClick={handleSubmit}
                        className="flex-1 bg-teal-600 text-white text-sm font-semibold py-2 rounded-lg cursor-pointer hover:bg-teal-700 transition"
                    >
                        {editingPostId ? "Update Broadcast" : "Post Announcement"}
                    </button>

                    {editingPostId && (
                        <button
                            onClick={cancelEdit}
                            className="bg-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="text-xs font-bold text-gray-500 mb-2">RECENT BROADCASTS</div>

            {isLoading ? (
                <p className="text-xs text-gray-400">Loading broadcasts...</p>
            ) : posts.length === 0 ? (
                <p className="text-xs text-gray-400">No broadcasts posted yet.</p>
            ) : (
                posts.map((p) => (
                    <div key={p.id} className="border-t border-gray-200 first:border-0 py-3.5">
                        <div className="flex justify-between items-start gap-2">
                            <div className="font-bold text-sm text-gray-900">{p.title}</div>
                            <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                {p.floor_number ? `Floor ${p.floor_number}` : 'All Floors'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 mb-2">{p.body}</p>
                        <div className="flex justify-between items-center text-xs">
                            <button
                                onClick={() => startEdit(p)}
                                className="cursor-pointer font-semibold text-teal-700 hover:underline"
                            >
                                Edit broadcast
                            </button>
                            <button
                                onClick={() => deletePost(p.id)}
                                className="cursor-pointer font-semibold text-red-600 hover:underline"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))
            )}
        </aside>
    );
}