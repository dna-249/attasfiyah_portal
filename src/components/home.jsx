import axios from "axios";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// 🚀 Professional Style & Best Practices: Login/Auth Component

/**
 * @typedef {object} LoginCredentials
 * @property {string} studentName - The username/school ID.
 * @property {string} password - The password.
 */

const StudentSignIn = () => {
    // State Management
    const [token, setToken] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // State for structured error display
    const [success, setSuccess] = useState(false); // New state for success indicator
    const nav = useNavigate();

    /**
     * Handles the sign-in attempt, managing state for loading, success, and errors.
     * @async
     */
    const handleSignIn = async (e) => {
        e.preventDefault(); // Prevents default form submission behavior

        // 1. Clear previous status
        setError(null);
        setSuccess(false);

        // Basic validation before API call
        if (!username.trim() || !password.trim()) {
            setError("Please enter both username and password.");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(
                `https://portal-database-seven.vercel.app/student/login`,
                {
                    studentName: username.trim(),
                    password: password.trim(),
                }
            );
            // 2. SUCCESS: Token received
            setToken(res.data.token);
            console.log('Login successful, token:', res.data);
            
            // NOTE: We don't set success here because the verification step follows immediately.

        } catch (err) {
            // 3. ERROR: Login failed
            console.error('Login error:', err.response?.data || err.message);
            const errorMessage = err.response?.data?.message || "Login failed. Check your credentials.";
            setError(errorMessage);
            setLoading(false); // Stop loading on failure
        }
        // NOTE: The 'finally' is not needed here because loading state is managed by success/error outcomes
        // or the start of the next phase (handleVerify)
    };

    // --- Separator for distinct logic ---

    useEffect(() => {
        // Only run when a token is successfully set after login
        if (token) {
            handleVerify();
        }
    }, [token]); // Dependency on token ensures it runs after successful login

    /**
     * Handles the token verification and navigates to the portal.
     * @async
     */
    const handleVerify = async () => {
        // Verification uses the token from the login response
        try {
            const res = await axios.post(
                `https://portal-database-seven.vercel.app/student/verify`,
                {
                    studentName: username.trim(),
                    password: password.trim(),
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}` // Assuming the API expects a Bearer token
                    }
                }
            );

            // 4. VERIFY SUCCESS: Navigate and show indicator
            setSuccess(true);
            // Optional: A brief delay for the user to see the success message before redirecting
           nav(`/option/${res.data._id}`);
                

        } catch (err) {
            // 5. VERIFY ERROR: This happens if the token is invalid or API fails after login
            console.error('Verification error:', err.response?.data || err.message);
            const errorMessage = "Verification failed. Please try logging in again.";
            setError(errorMessage);
            setToken(''); // Clear token to force re-login
        } finally {
            // 6. FINALLY: Reset loading state regardless of outcome
            setLoading(false);
        }
    };

    return (
        <div className="portal-container">
            <div className="sign-in-box">
                <header>
                   <img src="/aiiflogo.png"  style={{margin:'auto'}}  width={100} height={100 } alt="Attasfiyah Logo"/>
                    <h3>Welcome to Attasfiyah Portal</h3>
                    <p className="subtitle">Sign in to Continue</p>
                </header>

                <form onSubmit={handleSignIn}> 
                    {/* Input fields */}
                    <input
                        type="text"
                        placeholder="Enter Username/School ID"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />

                    {/* Checkbox and Reset Password Button - MODIFIED BLOCK */}
                    <div className="controls-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* 1. Remember Me Checkbox */}
                        <label className="remember-me">
                            <input type="checkbox" disabled={loading} /> Remember Me
                        </label>
                        
                        {/* 2. Reset Password Button/Link */}
                        <button 
                            type="button" // Important: use type="button" to prevent form submission
                            onClick={() => nav("/test")} // Assuming a reset password route
                            disabled={loading || success}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#007bff', // Typical link color
                                cursor: 'pointer',
                                padding: 0, // Remove padding from button
                                textDecoration: 'underline', // Make it look like a link
                                fontSize: 'inherit' // Inherit font size from container
                            }}
                        >
                            Reset Password
                        </button>
                    </div>
                    
                    {/* --- Success/Error Indicator --- */}
                    {error && (
                        <p className="error-message" style={{ color: 'red', fontWeight: 'bold' }}>
                            ❌ {error}
                        </p>
                    )}
                    
                    {success && !loading && (
                        <p className="success-message" style={{ color: 'green', fontWeight: 'bold' }}>
                            ✅ Login Successful! Redirecting...
                        </p>
                    )}
                    {/* --- End Status Indicator --- */}

                    {/* The button is a submit button */}
                    <button type="submit" disabled={loading || success}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <footer>
                    <p onClick={()=>nav("/pin")} className="footer-note">Powered by **dnaTech@2025**</p>
                </footer>
            </div>
        </div>
    );
}

export default StudentSignIn;