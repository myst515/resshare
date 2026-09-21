import './index.css'
import { useState } from 'react';
import { ChevronDown, Check, Lock, WashingMachine } from 'lucide-react';

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

export default function BookDropDown({units=[{ id: 1, label: "Machine 1", available: true }, { id: 2, label: "Machine 2", available: true },
                                    { id: 3, label: "Machine 3", available: false },{ id: 4, label: "Machine 4", available: false }], isOpen}){
                                
        const [selectedId, setSelectedId] = useState(null);
        const [confirmedId, setConfirmedId] = useState(null);

        const handleSelect = (unit) => {
            if (!unit.available) {

            }
            else{
                setSelectedId(unit.id);
            }
            return;
        };

        const handleConfirm = () => {
        const selectedUnit = units.find((unit) => unit.id === selectedId);
        // Safety check: if nothing is selected, there's nothing to confirm.
        if (!selectedUnit) {
            return;
        }

        // Mark this unit as confirmed so the UI can show "Booked".
        setConfirmedId(selectedUnit.id);
        

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
        <div className="rbd-dropdown" style={{ maxHeight: isOpen ? `${units.length * 60 + 90}px` : '0px' }}>
            <div className="rbd-inner">
                <p className="rbd-label">Select a unit to reserve</p>

                <ul className="rbd-unit-list">
                {units.map((unit) => {
                    // Is this the unit the user just clicked on?
                    const isSelected = selectedId === unit.id;

                    // Has this unit already been successfully booked?
                    const isConfirmed = confirmedId === unit.id;

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
                            <Lock size={13} /> In use
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
                <button className="rbd-confirm-btn" disabled={!selectedId} onClick={handleConfirm}>
                    {selectedId? `Confirm booking — ${units.find((u) => u.id === selectedId)?.label}`: 'Select a unit above'}
                </button>
            </div>

      </div>
    )
}