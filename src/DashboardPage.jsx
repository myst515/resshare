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
 * DashboardPage displays the resources available to the
 * authenticated resident.
 *
 * NEW INTEGRATION:
 * The authenticated user is passed into this page from App.jsx.
 * The user information comes from the backend after login.
 */
export default function DashboardPage({user}) {

    const activeUser = user || JSON.parse(localStorage.getItem('user') || '{}');


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
     * Resource unit information used by the dashboard.
     *
     * Each unit stores its identifier, display label and
     * current availability.
     */
    const Dryers = [
        {
            id: 1,
            label: "Dryer 1",
            available: true
        },

        {
            id: 2,
            label: "Dryer 2",
            available: true
        },

        {
            id: 3,
            label: "Dryer 3",
            available: false,
            reservedUntil:
                "2026-09-26T17:30:00.000"
        },

        {
            id: 4,
            label: "Dryer 4",
            available: false,
            reservedUntil:
                "2026-09-26T17:30:00.000"
        }
    ];


    const Stoves = [
        {
            id: 1,
            label: "Stove 1",
            available: true
        },

        {
            id: 2,
            label: "Stove 2",
            available: true
        },

        {
            id: 3,
            label: "Stove 3",
            available: false
        },

        {
            id: 4,
            label: "Stove 4",
            available: false
        },

        {
            id: 5,
            label: "Stove 5",
            available: false
        },

        {
            id: 6,
            label: "Stove 6",
            available: false
        }
    ];


    const WashingMachines = [
        {
            id: 1,
            label: "Washer 1",
            available: false
        },

        {
            id: 2,
            label: "Washer 2",
            available: true
        },

        {
            id: 3,
            label: "Washer 3",
            available: false
        },

        {
            id: 4,
            label: "Washer 4",
            available: false
        }
    ];


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
                            Ready to reserve a shared
                            resource today?
                        </p>


                        <br />


                        <h2>
                            Bookable Resources
                        </h2>


                        <p>
                            Below are the resources
                            you can book.
                        </p>


                        <div className="resource-grid">


                            <ResourceCard

                                title="Washing Machines"

                                availability={
                                    checkAvailability(
                                        WashingMachines
                                    )
                                }

                                total={
                                    WashingMachines.length
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
                                        Dryers
                                    )
                                }

                                total={
                                    Dryers.length
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
                                        Stoves
                                    )
                                }

                                total={
                                    Stoves.length
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
                                    WashingMachines
                                }

                                isOpen={
                                    dropDownWasher
                                }

                            />


                            <BookDropDown

                                units={
                                    Dryers
                                }

                                isOpen={
                                    dropDownDryer
                                }

                            />


                            <BookDropDown

                                units={
                                    Stoves
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