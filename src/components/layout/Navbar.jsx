import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { isLoggedInContext } from "../../context/LoggedinContext";
import { RoleContext } from "../../context/RoleContext";
import { ROLE_LINKS } from "../../constants/navLinks";
import axios from "../../api";
import Cookies from 'js-cookie'

const linkClass = "text-white-50 text-decoration-none p-1 link-light";
const MAX_VISIBLE = 4; // links shown in the bar, the rest go under "More"

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const moreRef = useRef(null);
    const [isLoggedIn, setIsLoggedIn] = useContext(isLoggedInContext);
    const [role, setRole] = useContext(RoleContext);
    const [moreOpen, setMoreOpen] = useState(false);

    useEffect(() => {
        setMoreOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const onClick = (e) => {
            if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    const handleLogout = async () => {
        const refresh = Cookies.get("refresh_token");
        try {
            if (refresh) {
                await axios.post("/user/logout", { refresh_token: refresh });
            }
        } catch (err) {
            console.error(err); // log out locally even if this fails
        }
        Cookies.remove("token");
        Cookies.remove("refresh_token");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("role");
        setIsLoggedIn(false);
        setRole(null);
        alert("Logged out successfully.");
        navigate("/login");
    };

    const links = isLoggedIn ? ROLE_LINKS[role] || [] : [];
    const visibleLinks = links.slice(0, MAX_VISIBLE);
    const moreLinks = links.slice(MAX_VISIBLE);

    return (
        <nav className="navbar bg-dark p-3 text-white sticky-top">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <Link to="/" className="navbar-brand text-white fw-bold text-decoration-none m-0">
                    Cafe
                </Link>

                <div id="navpart1" className="d-flex align-items-center">
                    <ul className="d-flex align-items-center list-unstyled m-0 p-0 me-3">
                        <li className="mx-2">
                            <Link to="/" className={linkClass}>Home</Link>
                        </li>

                        {visibleLinks.map((link) => (
                            <li className="mx-2" key={link.to}>
                                <Link to={link.to} className={linkClass}>{link.label}</Link>
                            </li>
                        ))}

                        {moreLinks.length > 0 && (
                            <li
                                className="mx-2 position-relative py-2"
                                ref={moreRef}
                                onMouseEnter={() => setMoreOpen(true)}
                                onMouseLeave={() => setMoreOpen(false)}
                            >
                                <button
                                    type="button"
                                    className={`${linkClass} btn btn-link border-0`}
                                    aria-expanded={moreOpen}
                                    onClick={() => setMoreOpen((o) => !o)}
                                >
                                    More {moreOpen ? "▴" : "▾"}
                                </button>

                                <ul
                                    className={`dropdown-menu dropdown-menu-dark dropdown-menu-end m-0 ${moreOpen ? "show" : ""}`}
                                    style={{ top: "100%" }}
                                >
                                    {moreLinks.map((link) => (
                                        <li key={link.to}>
                                            <Link to={link.to} className="dropdown-item">
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        )}
                    </ul>

                    <div>
                        {isLoggedIn ? (
                            <button onClick={handleLogout} className="btn btn-outline-light btn-sm px-3 m-0">
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className="btn btn-light btn-sm px-3 m-0 text-decoration-none">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;