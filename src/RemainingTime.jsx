import React from "react";

/**
 * RemainingTime renders the live countdown timer.
 * When the countdown reaches 0, it triggers onExpire() so the UI automatically
 * re-fetches and flips back to "Available".
 */
export default function RemainingTime({ endTime, onExpire }) {
    const [remaining, setRemaining] = React.useState(() => endTime - Date.now());

    React.useEffect(() => {
        const id = setInterval(() => {
            const diff = endTime - Date.now();
            setRemaining(diff);

            // Once the timer hits 0, stop interval and trigger the onExpire callback
            if (diff <= 0) {
                clearInterval(id);
                if (onExpire) {
                    onExpire();
                }
            }
        }, 1000);

        return () => clearInterval(id);
    }, [endTime, onExpire]);

    if (remaining <= 0) {
        return <span className="text-emerald-600 font-semibold text-sm">Freeing...</span>;
    }

    const hrs = Math.floor(remaining / (60000 * 60));
    const mins = Math.floor((remaining % (60000 * 60)) / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);

    return (
        <span className="text-gray-400 text-sm">
            {hrs > 0 ? `${hrs}:` : ''}{mins}:{secs.toString().padStart(2, '0')} left
        </span>
    );
}