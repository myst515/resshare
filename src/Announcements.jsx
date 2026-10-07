import React from 'react'
import './index.css'


const initialPosts = [{ id: 1, title: "Dryer #2 filter maintenance", time: "2 hours ago", body: "Scheduled for monthly filter maintenance tomorrow between 09:00–11:00 AM." },
                        { id: 2, title: "Kitchen deep cleaning", time: "1 day ago", body: "The Floor 1 shared kitchen will be closed for professional deep cleaning this Friday afternoon." }];
                        
export default function Announcements(){
    const [posts, setPosts] = React.useState(initialPosts);
    const [announceInput, setAnnounceInput] = React.useState("");
    const [editingPostId, setEditingPostId] = React.useState(null);

    function deletePost(id){
        setPosts((prev)=>prev.filter((p) => p.id !== id));

        /*This is to fic the bug that occurs when trying to delete a post while editing */
        if(editingPostId === id){
            setEditingPostId(null);
            setAnnounceInput("");
        }
    }
    function postAnnouncement(){
        const text = announceInput.trim();
        if(!text) return;

        const colonIndex = text.indexOf(":");
        let title = "Announcement";
        let body = text;

        if(colonIndex >-1){
            title = text.slice(0, colonIndex).trim();
            body = text.slice(colonIndex+1).trim();
        }

        if(editingPostId){
            setPosts((prev)=> prev.map((p) => (p.id === editingPostId ? {...p, title, body, time:"Just now"}: p)));
            setEditingPostId(null);
        }else{
            const nextId = posts.length > 0? Math.max(...posts.map((p) => p.id)) + 1: 1;
        setPosts((prev)=>[{id:nextId, title, body, time:"Just now"}, ...prev]);
        setAnnounceInput("");
        }

        setAnnounceInput("");
    }

    function startEdit(post){
        setEditingPostId(post.id);
        setAnnounceInput(`${post.title}: ${post.body}`); //reload into text area
    }
    return(
        <aside>
      <h2 className="text-lg font-semibold mb-4">Announcements</h2>

      <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mb-5">
        <div className="text-sm font-bold text-teal-700 mb-2">Create Announcement</div>
        <textarea
          value={announceInput}
          onChange={(e) => setAnnounceInput(e.target.value)}
          placeholder="Type important updates for residents here..."
          className="w-full min-h-[74px] border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white mb-3"
        />
        <button
          onClick={postAnnouncement}
          className="w-full bg-teal-600 text-white text-sm font-semibold py-2.5 rounded-lg cursor-pointer"
        >
          Post Announcement
        </button>
      </div>

      <div className="text-xs font-bold text-gray-500 mb-2">RECENT POSTS</div>
      {posts.map((p) => (
        <div key={p.id} className="border-t border-gray-200 first:border-0 py-3.5">
          <div className="flex justify-between gap-2">
            <div className="font-bold text-sm">{p.title}</div>
            <div className="text-xs text-gray-500 whitespace-nowrap">{p.time}</div>
          </div>
          <p className="text-sm text-gray-500 mt-1 mb-2">{p.body}</p>
          <div className="flex justify-between">
            <button onClick={()=>startEdit(p)} className="text-xs cursor-pointer font-semibold text-teal-700">
                Edit broadcast
            </button>
            <button onClick={()=>deletePost(p.id)} className="text-xs cursor-pointer font-semibold text-red-700">
                Delete
            </button>
          </div>
        </div>
      ))}
    </aside>
    )
}
