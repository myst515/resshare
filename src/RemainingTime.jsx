import React from "react";

{/*RemainingTime is a component that renders the remaining time of a resource on the resource cards. It takes in the estimated endTime of a resource use as input and returns the remaining time as an html span element */}
export default function RemainingTime({endTime}){
    const [remaining, setRemaining] = React.useState(() => endTime - Date.now());

    React.useEffect(()=>{
        const id= setInterval(() => {
            setRemaining(endTime-Date.now());
        }, 1000);
        return () => clearInterval(id);
    }, [endTime]);

    if(remaining <= 0){
        return <span className="text-gray-400">Ending...</span>;
    }
    const hrs = Math.floor(remaining/(60000*60))
    const mins = Math.floor(remaining%(60000*60)/60000);
    const secs = Math.floor((remaining%60000)/1000);
    return(<span className="text-gray-400 text-sm">{hrs}:{mins}:{secs.toString().padStart(2, '0')} left</span>)
}