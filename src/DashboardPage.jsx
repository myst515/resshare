import './index.css'
import React from 'react'

import ResourceCard from './ResourceCard.jsx'
import Header from './DashboardHeader.jsx'

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
export default function DashboardPage({
    user = {
        name: "Kagiso",
        floor_number: 1
    }
}) {


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


    return(

        <>

            {/*
             * NEW INTEGRATION:
             *
             * Pass the authenticated user to the dashboard
             * header so that the header can display the
             * actual user's name and floor.
             */}
            <Header user={user} />


            <div className="BodyDashboard">

                <div className="dashboard-content">


                    <div className="resources-section">

                        <h1>
                            Hello, {user.name}
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
                                availability={2}
                                total={4}
                                link={WashingMachineImage}
                                handleDropDown={
                                    handleDropDownWasher
                                }
                            />


                            <ResourceCard
                                title="Dryers"
                                availability={1}
                                total={3}
                                link={DryerImage}
                                handleDropDown={
                                    handleDropDownDryer
                                }
                            />


                            <ResourceCard
                                title="Stoves"
                                availability={0}
                                total={2}
                                link={StoveImage}
                                handleDropDown={
                                    handleDropDownStove
                                }
                            />

                        </div>


                        <div className='resource-grid'>

                            <BookDropDown
                                isOpen={
                                    dropDownWasher
                                }
                            />


                            <BookDropDown

                                units={[
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
                                        available: false
                                    },

                                    {
                                        id: 4,
                                        label: "Dryer 4",
                                        available: false
                                    }
                                ]}

                                isOpen={
                                    dropDownDryer
                                }
                            />


                            <BookDropDown

                                units={[
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
                                    }
                                ]}

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