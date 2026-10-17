import React, { useEffect, useState } from 'react';
import './index.css';
import ApiService from './services/ApiService.js';

/**
 * Announcements renders the admin broadcast management section.
 * Allows administrators to create broadcasts targeted to specific floors
 * or the entire building, view live broadcasts, and delete them.
 */
export default function Announcements() {
    const [posts, setPosts] = useState([]);
    const [announceInput, setAnnounceInput] = useState("");
    const [targetFloor, setTargetFloor] = useState("All");
    const [isLoading, setIsLoading] = useState(true);

    /**
     * Fetches all broadcasts from PostgreSQL via ApiService.
     */
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

    /**
     * Deletes a broadcast from PostgreSQL and updates the UI list.
     * @param {number} id - Announcement database ID.
     */
    async function deletePost(id) {
        if (!window.confirm("Are you sure you want to delete this broadcast?")) return;

        try {
            await ApiService.delete(`/announcements/${id}`);
            setPosts((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            alert(`Error deleting announcement: ${err.message}`);
        }
    }

    /**
     * Parses the admin textarea input and posts the announcement to PostgreSQL.
     * Supports formats like "Title: Description" or plain text.
     */
    async function postAnnouncement() {
        const text = announceInput.trim();
        if (!text) return;

        const colonIndex = text.indexOf(":");
        let title = "Announcement";
        let body = text;

        if (colonIndex > -1) {
            title = text.slice(0, colonIndex).trim();
            body = text.slice(colonIndex + 1).trim();
        }

        try {
            const created = await ApiService.post('/announcements', {
                title,
                body,
                floorNumber: targetFloor === "All" ? null : targetFloor
            });

            // Prepend new broadcast to state
            setPosts((prev) => [created, ...prev]);
            setAnnounceInput("");
        } catch (err) {
            alert(`Error posting announcement: ${err.message}`);
        }
    }

    return (
        <aside>
            <h2 className="text-lg font-semibold mb-4 text-black">Announcements</h2>

            <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-5">
                <div className="text-sm font-bold text-teal-700 mb-2">Create Announcement</div>
                
                {/* Floor target selection dropdown */}
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

                <textarea
                    value={announceInput}
                    onChange={(e) => setAnnounceInput(e.target.value)}
                    placeholder="Format: 'Title: Message' (e.g. Filter Check: Washers will be inspected...)"
                    className="w-full min-h-[74px] border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white mb-3 text-black"
                />

                <button
                    onClick={postAnnouncement}
                    className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-lg cursor-pointer hover:bg-teal-700 transition"
                >
                    Post Announcement
                </button>
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
                        <div className="flex justify-end">
                            <button
                                onClick={() => deletePost(p.id)}
                                className="text-xs cursor-pointer font-semibold text-red-600 hover:underline"
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