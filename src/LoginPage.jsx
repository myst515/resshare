import './index.css'

import Header
    from './Header.jsx'

import { useNavigate }
    from 'react-router'

import React
    from 'react'

import RegistrationForm
    from './RegistrationForm.jsx'


/*
 * NEW INTEGRATION:
 *
 * ApiService is responsible for communicating with the
 * Node.js backend rather than LoginPage directly using fetch.
 *
 * The login request will therefore follow:
 *
 * LoginPage
 *     ↓
 * ApiService
 *     ↓
 * Node.js backend
 *     ↓
 * AuthService
 *     ↓
 * PostgreSQL
 */
import ApiService
    from './services/ApiService.js'


export default function LoginPage(Funcs) {


    /*
     * This creates a showCreate state variable that is false
     * by default, setShowCreate is a function used to update
     * the value of showCreate.
     */
    const [
        showCreate,
        setShowCreate
    ] =
        React.useState(false)


    function CreateHandler() {

        /*
         * This function toggles the state of showCreate between
         * true and false. When showCreate is true, the
         * RegistrationForm component will be rendered, allowing
         * the user to create a new account.
         */
        setShowCreate(
            (prev) => !prev
        )
    }


    /*
     * useNavigate allows the application to change the
     * current page after a successful login.
     */
    let navigate =
        useNavigate()


    /*
     * NEW INTEGRATION:
     *
     * The login function is now asynchronous because the
     * React frontend must wait for the backend authentication
     * request to complete.
     *
     * The previous hard-coded username/password checks
     * have been removed.
     */
    async function submit(formData) {


        /*
         * Retrieve the login information entered by the user.
         *
         * The form field is currently called "username",
         * but the backend expects an email address.
         */
        const email =
            formData.get('username')


        const password =
            formData.get('password')


        /*
         * Display the submitted values in the browser console
         * while testing the integration.
         */
        console.log(email)
        console.log(password)


        try {


            /*
             * NEW INTEGRATION:
             *
             * Send the credentials to the backend through
             * ApiService.
             *
             * The request flow is:
             *
             * React
             *     ↓
             * ApiService
             *     ↓
             * POST /api/auth/login
             *     ↓
             * Node.js
             */
            const result =
                await ApiService.post(
                    '/auth/login',
                    {
                        email: email,
                        password: password
                    }
                )


            /*
             * Display the response returned by the backend
             * while testing.
             *
             * The response should contain:
             *
             * {
             *     token: "...",
             *     user: {...}
             * }
             */
            console.log(
                'Login successful:',
                result
            )


            /*
             * NEW INTEGRATION:
             *
             * Store the JWT returned by the backend.
             *
             * ApiService will automatically use this token
             * for future authenticated API requests.
             */
            localStorage.setItem(
                'token',
                result.token
            )


            /*
             * Store the authenticated user's information
             * so that the dashboard can display their name,
             * floor and role.
             */
            localStorage.setItem(
                'user',
                JSON.stringify(
                    result.user
                )
            )


            /*
             * Keep the existing App authentication state
             * working.
             *
             * This allows the existing routing logic in
             * App.jsx to recognise that the user is logged in.
             */
            if (
                Funcs &&
                Funcs.authFunc
            ) {

                Funcs.authFunc(
                    true
                )
            }


            /*
             * NEW INTEGRATION:
             *
             * Set the administrator state using the role
             * returned by the backend.
             *
             * The role comes from PostgreSQL through:
             *
             * PostgreSQL
             *     ↓
             * AuthService
             *     ↓
             * authRoutes
             *     ↓
             * ApiService
             *     ↓
             * LoginPage
             */
            if (
                Funcs &&
                Funcs.adminFunc
            ) {

                Funcs.adminFunc(
                    result.user.role === 'admin'
                )
            }

            if (Funcs.userFunc)  Funcs.userFunc(result.user);


            /*
             * Direct the authenticated user to the
             * appropriate page based on their role.
             */
            if (
                result.user.role === 'admin'
            ) {

                navigate(
                    '/AdminPage'
                )

            } else {

                navigate(
                    '/DashboardPage'
                )

            }


        } catch (error) {


            /*
             * If the backend rejects the credentials,
             * the user remains on the login page.
             */
            console.error(
                'Login failed:',
                error
            )


            /*
             * Display an error message to the user.
             */
            alert(
                'Login failed: ' +
                error.message
            )
        }
    }


    return(

        <>

            {/*
             * The login-page wrapper contains the Header and
             * the login form so that the existing background
             * styling covers the complete page.
             *
             * No changes to index.css are required.
             */}
            <div className="login-page">


                <Header />


                <div className="auth-container">


                    <div className="LoginForm">


                        <h1>
                            Welcome to ResShare
                        </h1>


                        <p>
                            Join now to monitor the
                            real-time availability of
                            shared resources in your building
                        </p>


                        {/*
                         * The form still uses React's form action
                         * mechanism. The submit function receives
                         * the FormData object.
                         *
                         * NEW INTEGRATION:
                         *
                         * When the form is submitted, submit()
                         * sends the login details to the backend.
                         */}
                        <form action={submit}>


                            <label>
                                username:

                                <input
                                    type="text"
                                    name="username"
                                    required
                                />

                            </label>


                            <br />
                            <br />


                            <label>
                                password:

                                <input
                                    type="password"
                                    name="password"
                                    required
                                />

                            </label>


                            <br />
                            <br />


                            <button
                                className="button"
                                type="submit"
                            >
                                Login
                            </button>


                        </form>


                        <br />


                        <p>
                            Don't have an account?
                            Create one below
                        </p>


                        <button
                            className="cursor-pointer hover:opacity-40"
                            padding="10px"
                            width="100%"
                            border="none"
                            onClick={
                                CreateHandler
                            }
                        >
                            Create Account
                        </button>


                    </div>


                    {/*
                     * This line uses a ternary operator to conditionally
                     * render the RegistrationForm component based on the
                     * value of showCreate.
                     *
                     * If showCreate is true, the RegistrationForm
                     * component is rendered and passed the CreateHandler
                     * function as a prop named createHandler.
                     *
                     * If showCreate is false, null is rendered, meaning
                     * that the RegistrationForm component is not displayed.
                     */}
                    {
                        showCreate
                            ? (
                                <RegistrationForm
                                    createHandler={
                                        CreateHandler
                                    }
                                />
                            )
                            : null
                    }


                </div>

            </div>

        </>
    )
}