import './index.css'

import MyReact
    from './assets/ResShare.drawio.svg'

import {LogOut}
    from 'lucide-react';

import avatarUrl
    from "./assets/User-Avatar.png"

import {useNavigate}
    from 'react-router'


/*
 * DashboardHeader renders the header shown on the
 * resident dashboard.
 *
 * NEW INTEGRATION:
 * The user information now comes from the authenticated
 * user returned by the backend rather than being hard-coded.
 */
export default function DashboardHeader({
    user = {
        name: "Kagiso",
        floor_number: 1
    }
}) {


    let navigate =
        useNavigate();


    function onLogout(){

        /*
         * NEW INTEGRATION:
         *
         * Remove the JWT and stored user information.
         *
         * This prevents the previous user from remaining
         * authenticated after logging out.
         */
        localStorage.removeItem(
            'token'
        );

        localStorage.removeItem(
            'user'
        );


        /*
         * Return the user to the login page.
         */
        navigate('/');
    }


    return(

        <>

            {/*This is a header component which renders a header for the app. The header contains a logo and the name ResShare */}

            <header className="MyHeaderDashboard">

                <div className="MyHeaderLogo">

                    <img
                        src={MyReact}
                        alt="ResShare logo"
                    />

                    <span>
                        ResShare
                    </span>

                </div>


                <div className="MyHeaderDashboardActions">


                    <button

                        type="button"

                        className=
                            "MyHeaderDashboardLogout"

                        onClick={
                            onLogout
                        }
                    >

                        <LogOut
                            size={18}
                            strokeWidth={2}
                        />

                        <span>
                            Log out
                        </span>

                    </button>


                    <div
                        className=
                            "MyHeaderDashboardDivider"
                    />


                    <div
                        className=
                            "MyHeaderDashboardUser"
                    >

                        <span
                            className=
                                "MyHeaderDashboardUserName"
                        >
                            {user.name}
                        </span>


                        <span
                            className=
                                "MyHeaderDashboardUserFloor"
                        >
                            Floor {user.floor_number}
                        </span>

                    </div>


                    <img

                        className=
                            "MyHeaderDashboardAvatar"

                        src={avatarUrl}

                        alt="user avatar"

                    />

                </div>

            </header>

        </>
    )
}