import { useState } from "react";
// import axios from 'axios';
import axios from "../../../api";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/AuthCard";
import AuthField from "../components/AuthField";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    let role = "customer"
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const submitFun = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Password and confirm password do not match.");
            return;
        }

        const registerPayload = {
            name: name,
            email: email,
            phone: phone,
            password: password,
            role: role
        };

        try {
            const response = await axios.post("/user/", registerPayload, {
                headers: {
                    "Content-Type": "application/json"
                },
            });

            alert("Registration successful!");

            navigate("/login");

        // } catch (err) {
        //     console.error(err);
        //     if (err.response && err.response.data?.error?.message) {
        //         setError(err.response.data.error.message); // Displays "Email address is already registered."
        //     } else {
        //         setError("Something went wrong. Please try again later.");
        //     }
        // }
        } catch (err) {
    console.error(err);
    const d = err.response?.data;
    setError(
        d?.error?.message ||
        (typeof d?.detail === "string" && d.detail) ||
        "Something went wrong. Please try again later."
    );
}
    };

    const passwordsMismatch = confirmPassword !== "" && password !== confirmPassword;

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
                <AuthField label="Password" id="Password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Password" required />
                <AuthField label="Confirm Password" id="ConfirmPassword" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter Password" className="mb-2" required />

                {passwordsMismatch && (
                    <p className="text-danger small mb-2">Passwords do not match.</p>
                )}

                <div className="form-check mb-4">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="showPassword"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                    />
                    <label className="form-check-label small text-muted" htmlFor="showPassword">
                        Show password
                    </label>
                </div>

                <button type="submit" className="btn btn-dark w-100 rounded-3 fw-semibold mb-4 text-white shadow-sm border-0" style={{ letterSpacing: "0.3px", fontSize: "0.95rem" }}>
                    Register Account
                </button>
            </form>
        </AuthCard>
    );
};

export default Register;