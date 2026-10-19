/**
 * ProtectedRoute
 *
 * Prevents unauthenticated users from directly accessing protected pages,
 * and enforces strict role separation so admins cannot access resident pages
 * and residents cannot access administrator pages.
 */

import { Navigate } from 'react-router';

export default function ProtectedRoute({ children, roleRequired }) {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    // 1. If not logged in, bounce to Login (/)
    if (!token) {
        return <Navigate to="/" replace />;
    }

    let user = null;
    try {
        if (storedUser) {
            user = JSON.parse(storedUser);
        }
    } catch (e) {
        return <Navigate to="/" replace />;
    }

    // 2. Strict Role Verification
    if (roleRequired) {
        // If this page requires 'admin', but user is a resident -> bounce to Dashboard
        if (roleRequired === 'admin' && user?.role !== 'admin') {
            return <Navigate to="/DashboardPage" replace />;
        }

        // If this page requires 'resident', but user is an admin -> bounce to Admin Panel
        if (roleRequired === 'resident' && user?.role === 'admin') {
            return <Navigate to="/AdminPage" replace />;
        }
    }

    // 3. User is authenticated and has the correct role -> render page
    return children;
}