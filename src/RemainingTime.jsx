import React from "react";

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