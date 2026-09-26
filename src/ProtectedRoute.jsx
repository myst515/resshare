/**
 * ProtectedRoute
 *
 * Prevents unauthenticated users from directly accessing
 * protected React pages such as the dashboard.
 *
 * This is frontend protection only.
 *
 * The backend still performs the real authentication
 * using the JWT and authMiddleware.
 */

import {Navigate}
    from 'react-router';


export default function ProtectedRoute({
    children
}) {


    /*
     * Retrieve the JWT stored after a successful login.
     */
    const token =
        localStorage.getItem('token');


    /*
     * If there is no JWT, the user is not authenticated.
     *
     * Redirect them back to the login page.
     */
    if (!token) {

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    /*
     * The user has a token, so allow the protected
     * component to be rendered.
     */
    return children;
}