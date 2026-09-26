import './index.css'

import { Navigate } from 'react-router'

import {
    BrowserRouter,
    Routes,
    Route
} from 'react-router'

import LoginPage from './LoginPage.jsx'
import DashboardPage from './DashboardPage.jsx'
import AdminPage from './AdminPage.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

import react from 'react'


/*
 * This is the main App component which sets up the routing
 * for the application.
 *
 * It uses React Router to define routes for the LoginPage,
 * DashboardPage, and AdminPage components.
 *
 * The isAuthenticated and isAdmin state variables are used
 * to determine if the user is logged in and if they have
 * administrator privileges.
 *
 * NEW INTEGRATION:
 *
 * Authentication information is also stored in localStorage
 * after a successful backend login.
 *
 * This allows the application to retain the user's login
 * information when the page is refreshed.
 */


export default function App() {

    /*
     * NEW INTEGRATION:
     *
     * Retrieve the JWT stored by LoginPage after a
     * successful backend login.
     */
    const storedToken =
        localStorage.getItem('token')


    /*
     * NEW INTEGRATION:
     *
     * Retrieve the authenticated user's information.
     *
     * LoginPage stores this information after receiving
     * the successful login response from the backend.
     */
    const storedUser =
        localStorage.getItem('user')


    /*
     * Convert the stored user JSON string back into
     * a JavaScript object.
     */
    let parsedUser = null


    try {

        if (storedUser) {

            parsedUser =
                JSON.parse(storedUser)

        }

    } catch (error) {

        /*
         * If the stored user information cannot be parsed,
         * remove it so that invalid data is not used.
         */
        localStorage.removeItem('user')

        parsedUser = null
    }


    /*
     * This creates the isAuthenticated state variable.
     *
     * NEW INTEGRATION:
     *
     * If a token and user are already stored, the application
     * considers the user authenticated when it starts.
     */
    const [
        isAuthenticated,
        setIsAuthenticated
    ] =
        react.useState(
            Boolean(
                storedToken &&
                parsedUser
            )
        )


    /*
     * This creates the isAdmin state variable.
     *
     * NEW INTEGRATION:
     *
     * The user's role comes from the backend response,
     * which ultimately comes from the PostgreSQL users table.
     */
    const [
        isAdmin,
        setIsAdmin
    ] =
        react.useState(
            parsedUser?.role === 'admin'
        )


    /*
     * Retrieve the current user from localStorage.
     *
     * This information is passed to DashboardPage so that
     * the dashboard can display the actual logged-in user's
     * information instead of a hard-coded user.
     */
    const currentUser =
        localStorage.getItem('user')


    let user = null


    try {

        if (currentUser) {

            user =
                JSON.parse(currentUser)

        }

    } catch (error) {

        user = null
    }


    return(

        <BrowserRouter>

            <Routes>


                {/* 
                 * Login route.
                 *
                 * LoginPage receives the functions used to
                 * update the authentication and administrator
                 * state after successful backend authentication.
                 */}
                <Route
                    path="/"
                    element={
                        <LoginPage
                            authFunc={
                                setIsAuthenticated
                            }
                            adminFunc={
                                setIsAdmin
                            }
                        />
                    }
                />


                {/*
                 * Dashboard route.
                 *
                 * NEW INTEGRATION:
                 *
                 * ProtectedRoute checks whether a JWT exists
                 * before allowing the DashboardPage to render.
                 *
                 * The actual authenticated user's information
                 * is also passed to DashboardPage.
                 */}
                <Route
                    path="/DashboardPage"
                    element={

                        <ProtectedRoute>

                            <DashboardPage
                                user={user}
                            />

                        </ProtectedRoute>

                    }
                />


                {/*
                 * Admin route.
                 *
                 * The user must be authenticated AND have
                 * the administrator role before accessing
                 * the AdminPage.
                 */}
                <Route
                    path="/AdminPage"
                    element={

                        isAuthenticated && isAdmin

                            ?

                            <AdminPage />

                            :

                            <Navigate
                                to="/"
                            />

                    }
                />


            </Routes>

        </BrowserRouter>
    )
}