import './index.css'
import RemainingTime from "./RemainingTime"
import { useEffect, useState } from 'react';
import { Check, Lock, Clock} from 'lucide-react';

/**
 * ResourceBookingDropdown
 *
 * A standalone dropdown panel for booking individual units of a resource.
 * It renders nothing but the panel itself — mounted directly below
 * existing resource card and control its visibility with "Book Now" button.
 *
 * ------------------------------------------------------------------
 * USAGE WITH YOUR EXISTING CARD (no changes to your card needed):
 *
 *   const [isOpen, setIsOpen] = useState(false);
 *
 *   <YourExistingResourceCard onBookClick={() => setIsOpen(o => !o)} />
 *
 *   <ResourceBookingDropdown
 *     isOpen={isOpen}
 *     units={[
 *       { id: 1, label: "Machine 1", available: true },
 *       { id: 2, label: "Machine 2", available: true },
 *       { id: 3, label: "Machine 3", available: false },
 *       { id: 4, label: "Machine 4", available: false },
 *     ]}
 *     onBook={(unit) => {
 *       console.log("Booked:", unit);
 *     }}
 *   />
 * ------------------------------------------------------------------
 *
 * Props:
 * - isOpen: boolean              whether the dropdown is expanded (you own this state)
 * - units: Array<{ id, label, available }>
 * - onBook: (unit) => void       called when the user confirms a booking
 * - onClose?: () => void         optional, called after a booking is confirmed
 *                                 (useful if you want to auto-collapse the dropdown
 *                                 from the parent's state)
 */

    

export default function BookDropDown({units=[{ id: 1, label: "Machine 1", available: true}, { id: 2, label: "Machine 2", available: true},
                                    { id: 3, label: "Machine 3", available: false,},{ id: 4, label: "Machine 4", available: false}], isOpen}){
        const DurationOptions = [];
        console.log(units)
        for (let minutes=15; minutes <= 120; minutes +=15){
            DurationOptions.push(minutes);
        }

        function formatDuration(minutes){
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

        const handleSelect = (unit) => {
            if (!unit.available) {

            }
            else{
                setSelectedId(unit.id);
                setUsageMinutes(''); // reset duration whenever selection changes
            }
            return;
        };

        const SelectedUnit = units.find((unit) => unit.id === SelectedId || null);
        const canConfirm = Boolean(SelectedUnit) && usageMinutes!=='';

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

        // Wait 900ms (so the user can see the "Booked" confirmation),
        // then reset everything back to its starting state.
        setTimeout(() => {
            setSelectedId(null);
            setConfirmedId(null);

            if (onClose) {
            onClose();
            }
        }, 2000);
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
                    <li key={unit.id}>
                        <button
                        className={buttonClass}
                        onClick={() => handleSelect(unit)}
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
                                            <option key={minutes} value={minutes}> {formatDuration(minutes)} </option>
                                        ))}
                                    </select>
                                </div>
                                : null}

                <button className="rbd-confirm-btn" disabled={!SelectedId} onClick={handleConfirm}>
                    {SelectedId? `Confirm booking — ${units.find((u) => u.id === SelectedId)?.label}`: 'Select a unit above'}
                </button>
            </div>

      </div>
    )
}