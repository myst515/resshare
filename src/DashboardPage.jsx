import './index.css'
import React from 'react'

import ResourceCard
    from './ResourceCard.jsx'

import Header
    from './DashboardHeader.jsx'

import WashingMachineImage
    from './assets/Washing_machines.jpg'

import DryerImage
    from './assets/Dryer.jpg'

import StoveImage
    from './assets/Stove.jpg'

import BookDropDown
    from './BookDropDown.jsx'

/*
 * NEW INTEGRATION:
 * ApiService fetches real-time facility data from the PostgreSQL database
 * based on the resident's floor.
 */
import ApiService
    from './services/ApiService.js'


/*
 * DashboardPage displays the resources available to the
 * authenticated resident.
 *
 * NEW INTEGRATION:
 * The authenticated user is passed into this page from App.jsx.
 * The user information comes from the backend after login.
 */
export default function DashboardPage({
    user = {
        name: "Kagiso",
        floor_number: 1
    }
}) {

    /*
     * Safely resolve the active user from props or localStorage
     * so that a newly logged-in resident's floor is always current.
     */
    const storedUser = localStorage.getItem('user');
    const activeUser = user || (storedUser ? JSON.parse(storedUser) : { name: "Resident", floor_number: 1 });


    const [
        dropDownWasher,
        setDropDownWasher
    ] =
        React.useState(false);


    const [
        dropDownDryer,
        setDropDownDryer
    ] =
        React.useState(false);


    const [
        dropDownStove,
        setDropDownStove
    ] =
        React.useState(false);


    /*
     * DYNAMIC INTEGRATION STATE:
     * Stores facility units retrieved from the PostgreSQL backend
     * for the resident's floor.
     */
    const [
        washingMachines,
        setWashingMachines
    ] =
        React.useState([]);

    const [
        dryers,
        setDryers
    ] =
        React.useState([]);

    const [
        stoves,
        setStoves
    ] =
        React.useState([]);

    const [
        isLoading,
        setIsLoading
    ] =
        React.useState(true);

    const [
        error,
        setError
    ] =
        React.useState(null);


    /*
     * DYNAMIC INTEGRATION EFFECT:
     * Loads live facilities from PostgreSQL for the resident's floor.
     */
    React.useEffect(() => {
        async function fetchFloorResources() {
            try {
                setIsLoading(true);
                setError(null);

                const floorNumber = activeUser.floor_number || 1;

                // 1. Fetch facilities on the resident's specific floor
                let data = await ApiService.get(`/facilities/floor/${floorNumber}`);

                // 2. If the current floor has no registered machines, fall back to all building facilities
                if (!data || data.length === 0) {
                    data = await ApiService.get('/facilities');
                }

                /*
                 * Helper function to map PostgreSQL facility rows to the unit structure
                 * required by BookDropDown and ResourceCard.
                 */
                const formatUnits = (rawList) =>
                    rawList.map((f) => ({
                        id: f.id,
                        label: f.name,
                        available: f.status === 'available',
                        status: f.status,
                        location: f.location,
                        floor_number: f.floor_number
                    }));

                // 3. Categorize dynamic units by facility type
                const washersList = data.filter((f) =>
                    f.type.toLowerCase().includes('wash')
                );

                const dryersList = data.filter((f) =>
                    f.type.toLowerCase().includes('dry')
                );

                const stovesList = data.filter((f) =>
                    f.type.toLowerCase().includes('stove') ||
                    f.type.toLowerCase().includes('kitchen')
                );

                setWashingMachines(formatUnits(washersList));
                setDryers(formatUnits(dryersList));
                setStoves(formatUnits(stovesList));

            } catch (err) {
                console.error("Failed to load floor resources:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchFloorResources();
    }, [activeUser.floor_number]);


    /*
     * The handleDropDown... functions handle the dropdown
     * of each individual resource card, so that one dropdown
     * doesn't cause all the resource cards to dropdown.
     */
    function handleDropDownWasher(){

        setDropDownWasher(
            x => !x
        );
    }


    function handleDropDownDryer(){

        setDropDownDryer(
            x => !x
        );
    }


    function handleDropDownStove(){

        setDropDownStove(
            x => !x
        );
    }


    /*
     * checkAvailability iterates over the units object array
     * to determine the number of available resources so that
     * the availability can be displayed correctly.
     */
    function checkAvailability(units = []){

        let countAvailable = 0;


        for(
            let x = 0;
            x < units.length;
            x++
        ){

            if(
                units[x].available === true
            ){

                countAvailable++;
            }
        }


        return countAvailable;
    }


    return(

        <>

            {/*
             * NEW INTEGRATION:
             *
             * Pass the authenticated user to the dashboard
             * header so that the header can display the
             * actual user's name and floor.
             */}
            <Header user={activeUser} />


            <div className="BodyDashboard">

                <div className="dashboard-content">


                    <div className="resources-section">


                        <h1>
                            Hello, {activeUser.name}
                        </h1>


                        <p>
                            Welcome back to your dashboard.
                            Viewing shared facilities on <strong>Floor {activeUser.floor_number}</strong>.
                        </p>


                        <br />


                        <h2>
                            Bookable Resources
                        </h2>


                        <p>
                            Below are the resources
                            you can book.
                        </p>


                        {/* Loading and Error Feedback */}
                        {isLoading && (
                            <p className="text-gray-600 text-sm">
                                Loading live facilities for Floor {activeUser.floor_number}...
                            </p>
                        )}

                        {error && (
                            <p className="text-red-500 text-sm">
                                Error connecting to database: {error}
                            </p>
                        )}


                        <div className="resource-grid">


                            <ResourceCard

                                title="Washing Machines"

                                availability={
                                    checkAvailability(
                                        washingMachines
                                    )
                                }

                                total={
                                    washingMachines.length
                                }

                                link={
                                    WashingMachineImage
                                }

                                handleDropDown={
                                    handleDropDownWasher
                                }

                            />


                            <ResourceCard

                                title="Dryers"

                                availability={
                                    checkAvailability(
                                        dryers
                                    )
                                }

                                total={
                                    dryers.length
                                }

                                link={
                                    DryerImage
                                }

                                handleDropDown={
                                    handleDropDownDryer
                                }

                            />


                            <ResourceCard

                                title="Stoves"

                                availability={
                                    checkAvailability(
                                        stoves
                                    )
                                }

                                total={
                                    stoves.length
                                }

                                link={
                                    StoveImage
                                }

                                handleDropDown={
                                    handleDropDownStove
                                }

                            />

                        </div>


                        <div className="resource-grid">


                            <BookDropDown

                                units={
                                    washingMachines
                                }

                                isOpen={
                                    dropDownWasher
                                }

                            />


                            <BookDropDown

                                units={
                                    dryers
                                }

                                isOpen={
                                    dropDownDryer
                                }

                            />


                            <BookDropDown

                                units={
                                    stoves
                                }

                                isOpen={
                                    dropDownStove
                                }

                            />

                        </div>

                    </div>


                    <div className="activity-section">


                        <h2>
                            Your Total Reservations:
                        </h2>


                        <div className="activity-card">

                            {
                                <span>
                                    10 This Month
                                </span>
                            }

                        </div>


                        <br />

                        <br />


                        <h2>
                            Your Space Activity
                        </h2>


                        <div className="building-news">


                            <h3>
                                🔔 Building News
                            </h3>


                            {
                                <p>
                                    Dryer #2 is scheduled
                                    for monthly filter
                                    maintenance tomorrow
                                    between 09:00 - 11:00 AM.
                                </p>
                            }


                            <p>
                                Please book other available
                                Dryers during this time.
                            </p>


                        </div>

                    </div>

                </div>

            </div>

        </>
    )
}