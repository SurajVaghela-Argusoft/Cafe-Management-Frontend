import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { isLoggedInContext } from "../../context/LoggedinContext";
import { RoleContext } from "../../context/RoleContext";
import { ROLE_LINKS } from "../../constants/navLinks";
import axios from "axios";
const linkClass = "text-white-50 text-decoration-none p-1 link-light";
import Cookies from 'js-cookie'

const Navbar = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useContext(isLoggedInContext);
    const [role, setRole] = useContext(RoleContext);

    // useEffect(() => {
    //     const token = localStorage.getItem("token");
    //     setIsLoggedIn(!!token);
    //     if(!isLoggedIn){
    //         setRole(null); 
    //     }
        
    // }, [isLoggedIn]);

    // const handleLogout = () => {
    //     localStorage.removeItem("token");
    //     localStorage.removeItem("role");
    //     setIsLoggedIn(false);
    //     setRole(null);
    //     alert("Logged out successfully.");
    //     navigate("/login");
    // };

    const handleLogout = async () => {
    const refresh = Cookies.get("refresh_token");
    try {
        if (refresh) {
            await axios.post("http://127.0.0.1:8000/user/logout", { refresh_token: refresh });
        }
    } catch (err) {
        console.error(err); // log out locally even if this fails
    }
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
    alert("Logged out successfully.");
    navigate("/login");
};

    const links = isLoggedIn ? ROLE_LINKS[role] || [] : [];

    return (
        <nav className="navbar bg-dark p-3 text-white sticky-top">
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <Link to="/" className="navbar-brand text-white fw-bold text-decoration-none m-0">
                    Cafe Website
                </Link>

                <div id="navpart1" className="d-flex align-items-center">
                    <ul className="d-flex align-items-center list-unstyled m-0 p-0 me-3">
                        <li className="mx-2">
                            <Link to="/" className={linkClass}>Home</Link>
                        </li>
                        {links.map((link) => (
                            <li className="mx-2" key={link.to}>
                                <Link to={link.to} className={linkClass}>{link.label}</Link>
                            </li>
                        ))} 
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
