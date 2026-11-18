import { useState, useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedInContext } from "../../../context/LoggedinContext";
import { RoleContext, getRoleFromToken } from "../../../context/RoleContext";
import AuthCard from "../components/AuthCard";
import AuthField from "../components/AuthField";
import Cookies from 'js-cookie'

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [, setIsLoggedIn] = useContext(isLoggedInContext);
    const [, setRole] = useContext(RoleContext);

    const submitFun = async (e) => {
        e.preventDefault();
        setError("");

        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        try {
            const response = await axios.post("http://127.0.0.1:8000/user/login", formData, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            // const { access_token } = response.data.data;

            // localStorage.setItem("token", access_token);
            const { access_token, refresh_token } = response.data.data;

            // localStorage.setItem("token", access_token);
            // localStorage.setItem("refresh_token", refresh_token);
            Cookies.set("token", access_token);
            Cookies.set("refresh_token", refresh_token);
            const userRole = getRoleFromToken();

            setRole(userRole);
            setIsLoggedIn(true);

            if (userRole === "admin") {
                alert("Hello Admin...");
            } else {
                alert("Login successful!");
            }
            navigate("/");
        } catch (err) {
            console.error(err);
            const d = err.response?.data;
            if (d?.error?.message) {
                setError(d.error.message);
            } else if (typeof d?.detail === "string") {
                setError(d.detail);
            } else {
                setError("Something went wrong. Please try again later.");
            }
        }
    };

    return (
        <AuthCard
            title="Welcome Back"
            subtitle="Enter your credentials to access your account"
            error={error}
            footer={
                <>
                    <span className="text-muted small">Don't have an account? </span>
                    <Link to="/register" className="text-dark text-decoration-none small fw-bold link-secondary ms-1">
                        Register
                    </Link>
                </>
            }
        >
            <form onSubmit={submitFun}>
                <AuthField label="Email Address" id="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email" required />
                <AuthField label="Password" id="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" className="mb-4" required />

                <button type="submit" className="btn btn-dark w-100 rounded-3 fw-semibold mb-4 text-white shadow-sm border-0" style={{ letterSpacing: "0.3px", fontSize: "0.95rem" }}>
                    Sign In
                </button>
            </form>
        </AuthCard>
    );
};

export default Login;