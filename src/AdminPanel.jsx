import './index.css'
import React from 'react';



{/* myResources is an object array that I will use to to test the Admin panel. It's main purpose is to mimick the type of input it will receive from database*/}
let myResources = [{ id: 1, name: "Washer #1", type: "Washing Machine", location: "Floor 2 Laundry Room", status: "Active" },
  { id: 2, name: "Washer #2", type: "Washing Machine", location: "Floor 2 Laundry Room", status: "Active" },
  { id: 3, name: "Washer #3", type: "Washing Machine", location: "Floor 2 Laundry Room", status: "Suspended" },
  { id: 4, name: "Stove #1", type: "Kitchen Stove", location: "Floor 1 Shared Kitchen", status: "Active" },
  { id: 5, name: "Dryer #1", type: "Clothes Dryer", location: "Floor 2 Laundry Room", status: "Active" }];

{/*StatusShape is a function that controls the style of the status text on the admin panel*/}
function StatusShape({status}){
    const styles = status === "Active"? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500";
    return(
         <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${styles}`}>
            {status}
        </span>
    )
}

{/* AdminPanel is a component that renders the Admin panel on the admin page. The admin panel is basically a table that shows the state of all the resources in the building and 
  allows an admin to add, remove, suspend and activate a resource*/}
export default function AdminPanel() {
    const [resources, setResources] = React.useState(myResources)

    {/*ToggleStatus is a local function that toggles the status of the Activate/Suspend button on the admin panel it takes in the id of the selected resource as input*/}
    function ToggleStatus(id){
        setResources((prev) => 
        prev.map((r)=> {
            if (r.id !== id){
                return r;
            } 
            const newStatus = r.status === "Active"? "Suspended" : "Active";
            return {...r, status:newStatus};
        }))
    }

    {/* RemoveResource is a function that handles the remove button click by removing the selected resource. It does this by first checking if the selected id exists. 
      If it exists it copies the array stored in state and removes the resource from the copied array, then returns the copied array to avoid removing directly from state.*/}
    function RemoveResource(id) {
        setResources((prev) => {
            const index = prev.findIndex((r) => r.id === id);
            if (index === -1) return prev; // not found, nothing to remove

            const updated = [...prev]; // copy the array so we don't mutate state directly
            updated.splice(index, 1);  // remove exactly 1 item starting at that index
            return updated;}
        );
    }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl mb-4">Resource Directory</h1>

      <table className="w-full text-sm bg-white border border-gray-200 rounded-xl overflow-hidden">
        <thead>
          <tr className="text-left text-xs font-semibold text-gray-500 border-b border-gray-200">
            <th className="p-3">Resource Name</th>
            <th className="p-3">Type</th>
            <th className="p-3">Location</th>
            <th className="p-3">Status</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
            {resources.map((r)=>(<tr className="border-b border-gray-200">
            <td className="p-3 font-semibold">{r.name}</td>
            <td className="p-3">{r.type}</td>
            <td className="p-3">{r.location}</td>
            <td className="p-3">
                <StatusShape status={r.status} />
            </td>
            <td className="p-3">
                <button className={`text-sm font-semibold ${r.status !== "Active"? "text-teal-700 border border-teal-600": "text-gray-500 border border-gray-600"}  px-2.5 py-1 rounded-md mr-10`} onClick={()=> ToggleStatus(r.id)}>
                    {r.status === "Active" ? "Suspend" : "Activate"}
                </button>
                <button onClick={() => RemoveResource(r.id)} className="text-sm font-semibold text-red-600 hover:underline">
                    Remove
                </button>
            </td>
          </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}