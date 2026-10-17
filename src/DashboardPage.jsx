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
 * ApiService fetches real-time facility data and floor-specific
 * announcements from the PostgreSQL database based on the resident's floor.
 */
import ApiService
    from './services/ApiService.js'


/*
 * DashboardPage displays the resources and announcements available to the
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

/*
     * ACCORDION STATE:
     * Stores which category dropdown is currently open ('washer', 'dryer', 'stove', or null).
     * Opening one category automatically closes any other open category!
     */
    const [activeCategory, setActiveCategory] = React.useState(null);

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

    /*
     * DYNAMIC ANNOUNCEMENTS STATE:
     * Stores announcements relevant to the resident's floor.
     */
    const [
        announcements,
        setAnnouncements
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

    const [
        reservationCount,
        setReservationCount
    ] = 
        React.useState(0);    


/*
     * DYNAMIC INTEGRATION FUNCTION:
     * Fetches live facilities and announcements.
     * Only shows the "Loading..." spinner on the initial load, not during background polling.
     */
    const fetchDashboardData = React.useCallback(async (isInitial = false) => {
        try {
            if (isInitial) {
                setIsLoading(true);
            }
            setError(null);

            const floorNumber = activeUser.floor_number || 1;

            // 1. Fetch facilities on the resident's specific floor
            let facilityData = await ApiService.get(`/facilities/floor/${floorNumber}`);

            if (!facilityData || facilityData.length === 0) {
                facilityData = await ApiService.get('/facilities');
            }

            const formatUnits = (rawList) =>
                rawList.map((f) => ({
                    id: f.id,
                    label: f.name,
                    available: f.status === 'available',
                    status: f.status,
                    location: f.location,
                    floor_number: f.floor_number,
                    reservedUntil: f.reservedUntil || null
                }));

            const washersList = facilityData.filter((f) =>
                f.type.toLowerCase().includes('wash')
            );

            const dryersList = facilityData.filter((f) =>
                f.type.toLowerCase().includes('dry')
            );

            const stovesList = facilityData.filter((f) =>
                f.type.toLowerCase().includes('stove') ||
                f.type.toLowerCase().includes('kitchen')
            );

            setWashingMachines(formatUnits(washersList));
            setDryers(formatUnits(dryersList));
            setStoves(formatUnits(stovesList));

            // 2. Fetch floor announcements
            const newsData = await ApiService.get(`/announcements/floor/${floorNumber}`);
            setAnnouncements(newsData);

            // 3. Fetch real reservation count for this resident
            const countData = await ApiService.get('/facilities/my-reservations/count');
            setReservationCount(countData.count);

        } catch (err) {
            console.error("Failed to load dashboard data:", err);
            setError(err.message);
        } finally {
            if (isInitial) {
                setIsLoading(false);
            }
        }
    }, [activeUser.floor_number]);

    /*
     * REAL-TIME AUTO-POLLING:
     * Runs once on mount, then silently synchronizes with PostgreSQL every 4 seconds.
     * When any machine is freed, the dashboard updates automatically without refreshing!
     */
    React.useEffect(() => {
        // Initial fetch with loading spinner
        fetchDashboardData(true);

        // Silent heartbeat sync every 2 seconds
        const pollInterval = setInterval(() => {
            fetchDashboardData(false);
        }, 2000);

        return () => clearInterval(pollInterval);
    }, [fetchDashboardData]);
    /*
     * Handles booking a machine for the selected duration (e.g. 15, 30, 45 minutes).
     * Calculates the real reservedUntil timestamp and synchronizes to PostgreSQL.
     */
    async function handleBookUnit(unit, durationMinutes) {
        try {
            const response = await ApiService.post('/facilities/book', {
                facilityId: unit.id,
                durationMinutes: durationMinutes
            });

            const reservedUntil = response.reservedUntil;

            const updateList = (list) =>
                list.map((u) =>
                    u.id === unit.id
                        ? { ...u, available: false, status: 'in_use', reservedUntil: reservedUntil }
                        : u
                );

            setWashingMachines((prev) => updateList(prev));
            setDryers((prev) => updateList(prev));
            setStoves((prev) => updateList(prev));
            setReservationCount((prev) => prev + 1);

        } catch (err) {
            console.error('Failed to book facility:', err);
            alert(`Booking Error: ${err.message}`);
        }
    }


    /*
     * The handleDropDown... functions handle the dropdown
     * of each individual resource card, so that one dropdown
     * doesn't cause all the resource cards to dropdown.
     */
    
    function toggleCategory(category) {
        setActiveCategory((prev) => (prev === category ? null : category));
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
                                    () => toggleCategory('washer')
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
                                    () => toggleCategory('dryer')
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
                                    () => toggleCategory('stove')
                                }

                            />

                        </div>


                        {/*
                         * BookDropDown components receiving onBook={handleBookUnit}
                         * and onExpire={fetchDashboardData} to auto-refresh when timers finish!
                         */}
                        <div className="resource-grid">


                            <BookDropDown

                                units={
                                    washingMachines
                                }

                                isOpen={
                                    activeCategory === 'washer'
                                }

                                onBook={
                                    handleBookUnit
                                }

                                onExpire={
                                    fetchDashboardData
                                }

                                onClose={
                                    () => setActiveCategory(null)
                                }


                            />


                            <BookDropDown

                                units={
                                    dryers
                                }

                                isOpen={
                                    activeCategory === 'dryer'
                                }

                                onBook={
                                    handleBookUnit
                                }

                                onExpire={
                                    fetchDashboardData
                                }

                                onClose={
                                    () => setActiveCategory(null)
                                }

                            />


                            <BookDropDown

                                units={
                                    stoves
                                }

                                isOpen={
                                    activeCategory === 'stove'
                                }

                                onBook={
                                    handleBookUnit
                                }

                                onExpire={
                                    fetchDashboardData
                                }

                                onClose={
                                    () => setActiveCategory(null)
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
                                    {reservationCount} This Month
                                </span>
                            }

                        </div>


                        <br />

                        <br />


                        <h2>
                            Your Space Activity
                        </h2>


                        {/*
                         * Building News dynamically populated from PostgreSQL
                         * filtered by the resident's floor.
                         */}
                        <div className="building-news">

                            <h3>
                                🔔 Building News
                            </h3>

                            {announcements.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                    No active announcements for Floor {activeUser.floor_number}.
                                </p>
                            ) : (
                                announcements.map((a) => (
                                    <div key={a.id} className="mb-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-center">
                                            <strong className="text-base text-gray-800">
                                                {a.title}
                                            </strong>
                                            <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-semibold">
                                                {a.floor_number ? `Floor ${a.floor_number}` : 'General'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {a.body}
                                        </p>
                                    </div>
                                ))
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </>
    )
}