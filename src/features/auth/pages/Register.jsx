import { useState } from "react";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import AuthField from "../components/AuthField";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    let role = "customer"
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const submitFun = async (e) => {
        e.preventDefault();
        setError("");

        const registerPayload = {
            name: name,
            email: email,
            phone: phone,
            password: password,
            role: role
        };

        try {
            const response = await axios.post("http://127.0.0.1:8000/user/", registerPayload, {
                headers: {
                    "Content-Type": "application/json"
                },
            });

            alert("Registration successful!");

            navigate("/login");

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data?.error?.message) {
                setError(err.response.data.error.message); // Displays "Email address is already registered."
            } else {
                setError("Something went wrong. Please try again later.");
            }
        }
    };

    return (
        <AuthCard
            title="Create Account"
            subtitle="Welcome! Enter your details to get started"
            error={error}
            footer={
                <>
                    <span className="text-muted small">Already have an account? </span>
                    <Link to="/login" className="text-dark text-decoration-none small fw-bold link-secondary ms-1">
                        Sign In
                    </Link>
                </>
            }
        >
            <form onSubmit={submitFun}>
                <AuthField label="Full Name" id="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Full Name" required />
                <AuthField label="Email Address" id="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email" required />
                <AuthField label="Phone Number" id="Phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter Phone (e.g. +91 9898...)" required />
                <AuthField label="Password" id="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" className="mb-4" required />

                <button type="submit" className="btn btn-dark w-100 rounded-3 fw-semibold mb-4 text-white shadow-sm border-0" style={{ letterSpacing: "0.3px", fontSize: "0.95rem" }}>
                    Register Account
                </button>
            </form>
        </AuthCard>
    );
};

export default Register;
