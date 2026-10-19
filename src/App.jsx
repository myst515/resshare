import './index.css';
import { Navigate, BrowserRouter, Routes, Route } from 'react-router';
import LoginPage from './LoginPage.jsx';
import DashboardPage from './DashboardPage.jsx';
import AdminPage from './AdminPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import React, { useState } from 'react';


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
        useState(
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
        useState(
            parsedUser?.role === 'admin'
        )


    /*
     * FIX: Store current user in React state so when a new user logs in,
     * App re-renders and passes the new user to DashboardPage immediately.
     */

    const [
        user, setUser
    ] = 
       useState(
        parsedUser
      )

    return(

        <BrowserRouter>

            <Routes>


                {/* 
                 * Login route.
                 *
                 * LoginPage receives the functions used to
                 * update the authentication and administrator
                 * state after successful backend authentication.
                 *
                 * NEW INTEGRATION:
                 * If already logged in, automatically routes users to their portal
                 * instead of showing the login form again.
                 */}
                <Route
                    path="/"
                    element={
                        isAuthenticated ? (
                            isAdmin ? (
                                <Navigate to="/AdminPage" replace />
                            ) : (
                                <Navigate to="/DashboardPage" replace />
                            )
                        ) : (
                            <LoginPage
                                authFunc={
                                    setIsAuthenticated
                                }
                                adminFunc={
                                    setIsAdmin
                                }
                                userFunc={
                                    setUser
                                }    
                            />
                        )
                    }
                />


                {/*
                 * Dashboard route.
                 *
                 * NEW INTEGRATION:
                 *
                 * ProtectedRoute with roleRequired="resident" blocks both
                 * unauthenticated visitors and logged-in administrators from
                 * accessing the resident dashboard.
                 */}
                <Route
                    path="/DashboardPage"
                    element={

                        <ProtectedRoute roleRequired="resident">

                            <DashboardPage
                                user={user}
                            />

                        </ProtectedRoute>

                    }
                />


                {/*
                 * Admin route.
                 *
                 * NEW INTEGRATION:
                 *
                 * ProtectedRoute with roleRequired="admin" blocks both
                 * unauthenticated visitors and standard residents from
                 * accessing the administrator control panel.
                 */}
                <Route
                    path="/AdminPage"
                    element={

                        <ProtectedRoute roleRequired="admin">

                            <AdminPage />

                        </ProtectedRoute>

                    }
                />


                {/* Catch-all route to redirect invalid URLs */}
                <Route
                    path="*"
                    element={
                        <Navigate to="/" replace />
                    }
                />


            </Routes>

        </BrowserRouter>
    )
}