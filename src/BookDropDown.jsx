import './index.css'
import RemainingTime from "./RemainingTime"
import { useEffect, useState } from 'react';
import { Check, Lock, Clock} from 'lucide-react';

/**
 * BookDropdown is standalone dropdown panel component for booking individual units of a resource.
 * It renders nothing but the panel itself — mounted directly below
 * existing resource card and control its visibility with "Book Now" button.
 * 
 * Props:
 * - isOpen: boolean              whether the dropdown is expanded or not
 * - units: Array<{ id, label, available }>
 * - onBook: (unit) => void       called when the user confirms a booking
 * - onClose?: () => void         optional, called after a booking is confirmed
 *                                 (useful if you want to auto-collapse the dropdown
 *                                 from the parent's state)
 */

export default function BookDropDown({units=[{ id: 1, label: "Machine 1", available: true}, { id: 2, label: "Machine 2", available: true},
                                    { id: 3, label: "Machine 3", available: false,},{ id: 4, label: "Machine 4", available: false}], isOpen, onBook}){
        const DurationOptions = [];
        console.log(units)
        for (let minutes=15; minutes <= 120; minutes +=15){
            DurationOptions.push(minutes);
        }

        {/*FormatDuration is a function that adjusts the input in minutes to a proper format if minutes >= 60*/}
        function FormatDuration(minutes){
            if(minutes < 60){
                return `${minutes} min`;
            }
            if(minutes%60 === 0){
                let hours = minutes/60;
                return hours === 1? `${hours} hr`: `${hours} hrs`
            }
            return `1hr ${minutes%60} min`;
        }
        
        const [SelectedId, setSelectedId] = useState(null);
        const [ConfirmedId, setConfirmedId] = useState(null);
        const [usageMinutes, setUsageMinutes] = useState('');

        {/*HandleSelect is a function that handles the selection of resources so that unavailable resources can't be selected, and it stores the selected resource's id to state. */}
        const HandleSelect = (unit) => {
            if (!unit.available) {

            }
            else{
                setSelectedId(unit.id);
                setUsageMinutes(''); // reset duration whenever selection changes
            }
            return;
        };

        const SelectedUnit = units.find((unit) => unit.id === SelectedId || null); {/* searches for selected unit, because only the id is stored in state not the full object*/}
        const canConfirm = Boolean(SelectedUnit) && usageMinutes!=='';

        {/*handleConfirm is a function that handles the booking confirmation button click. it basically saves the id of the confirmed resource to state so that the UI can briefly show booked*/}
        const handleConfirm = () => {
        
        // Safety check: if nothing is selected, there's nothing to confirm.
        if (!canConfirm) {
            return;
        }

        // Mark this unit as confirmed so the UI can show "Booked".
        setConfirmedId(SelectedUnit.id);
        

        // Let the parent component know a booking happened,
        // but only if an onBook function was actually provided.
        /*if (onBook) {
            onBook(selectedUnit);
        }*/

        // Wait 2000ms (so the user can see the "Booked" confirmation),
        // then reset everything back to its starting state.
        setTimeout(() => {
            setSelectedId(null);
            setConfirmedId(null);

            if (onClose) {
            onClose();
            }
        }, 2000);
        };

        //The unit IDs the user asked to be notified about in localStorage
        const[notifyIds, setNotifyIds] = useState(()=> {
            try{return JSON.parse(localStorage.getItem('rbd-notify')) || [];}
            catch{return [];}
        });
        
        //Holds the app popup images
        const [toasts, setToasts] = useState([]);

        useEffect(() => {
            try{localStorage.setItem('rbd-notify', JSON.stringify(notifyIds));}
            catch{}}, [notifyIds]);

        const fireNotification = (unit) => {
        //In-app toast
        const toastId= Date.now() + unit.id;
        setToasts((t)=> [...t, {id: toastId, text: `${unit.label} is now available!`}]);
        setTimeout(()=> setToasts((t)=> t.filter((x)=> x.id !== toastId)), 6000);

        //Browser notification, but requires user to grant permission
        if('Notification' in window && Notification.permission === 'granted'){
            new Notification('Unit Available!', {body: `${unit.label} is now available to book.`})
        }

        //Stop watching this unit
        setNotifyIds((ids) => ids.filter((id) => id !== unit.id));
        };

        // Schedule a timer for every unit the user is watching
        useEffect(() => {
        const timers = notifyIds.map((id) => {
            const unit = units.find((u) => u.id === id);
            if (!unit) return null;
            if (unit.available) { fireNotification(unit); return null; }
            if (!unit.reservedUntil) return null;

            const delay = Math.max(0, new Date(unit.reservedUntil).getTime() - Date.now());
            return setTimeout(() => fireNotification(unit), delay);
        });
        return () => timers.forEach((t) => t && clearTimeout(t));
        }, [notifyIds, units]);

        const toggleNotify = async (unit) => {
        if (notifyIds.includes(unit.id)) {
            setNotifyIds((ids) => ids.filter((id) => id !== unit.id));
            return;
        }
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
        setNotifyIds((ids) => [...ids, unit.id]);
        };
    return(
        <div className="rbd-dropdown" style={{ maxHeight: isOpen ? 'max-content' : '0px' }}>
            <div className="rbd-inner">
                <p className="rbd-label">Select a unit to reserve</p>

                <ul className="rbd-unit-list">
                {units.map((unit) => {
                    // Is this the unit the user just clicked on?
                    const isSelected = SelectedId === unit.id;

                    // Has this unit already been successfully booked?
                    const isConfirmed = ConfirmedId === unit.id;

                    // Build the button's class name based on its state.
                    // We start with the base class, then add extra classes
                    // depending on whether the unit is disabled or selected.
                    let buttonClass = 'rbd-unit';
                    if (!unit.available) {
                    buttonClass += ' rbd-unit--disabled';
                    }
                    if (isSelected) {
                    buttonClass += ' rbd-unit--selected';
                    }

                    return (
                    <li key={unit.id} className="rbd-unit-row">
                        <button
                        className={buttonClass}
                        onClick={() => HandleSelect(unit)}
                        disabled={!unit.available}
                        >
                        <span className="rbd-unit-label">{unit.label}</span>

                        {/* Show one of three possible status messages,
                            depending on the unit's current state */}
                        {!unit.available ? (
                            <span className="rbd-unit-status">
                            <Lock size={13} /> In use {unit.reservedUntil? <RemainingTime endTime={new Date(unit.reservedUntil).getTime()} />: ""}
                            </span> 
                        ) : isConfirmed ? (
                            <span className="rbd-unit-status rbd-unit-status--ok">
                            <Check size={13} /> Booked
                            </span>
                        ) : (
                            <span className="rbd-unit-status rbd-unit-status--free">
                            Available
                            </span>
                        )}
                        </button>

                        {unit.available? null: <button className="rbd-notify-btn" type="button" onClick={()=>toggleNotify(unit)}>{notifyIds.includes(unit.id)? 'Notifying': 'Notify'}</button>}
                    </li>
                    );
                })}
                </ul>

                {Boolean(SelectedUnit) ? <div className="rbd-time-input">
                                    <label htmlFor="usage-duration">
                                    <Clock size={13} /> Estimated usage time
                                    </label>
                                    <select id="usage-duration" value={usageMinutes} onChange={(e) => setUsageMinutes(e.target.value)}>
                                        <option value="" disabled> Select duration </option>
                                        {DurationOptions.map((minutes) => (
                                            <option key={minutes} value={minutes}> {FormatDuration(minutes)} </option>
                                        ))}
                                    </select>
                                </div>
                                : null}

                <button className="rbd-confirm-btn" disabled={!canConfirm || isBooking} onClick={handleConfirm}>
                    {SelectedId? `Confirm booking — ${units.find((u) => u.id === SelectedId)?.label}`: 'Select a unit above'}
                </button>
                <div className="rbd-toasts">{toasts.map((t) => <div key={t.id} className="rbd-toast">{t.text}</div>)}</div>
            </div>

      </div>
    )
}