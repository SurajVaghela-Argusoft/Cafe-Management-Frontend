import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { isLoggedInContext } from '../context/LoggedinContext';
import { RoleContext } from '../context/RoleContext';
import { itemsContext } from '../context/ItemsContext';
import { ROLE_LINKS } from '../constants/navLinks';

const DESCRIPTIONS = {
  '/menu': 'Browse all categories and items',
  '/tables': 'Reserve a table for your visit',
  '/myorders': 'See your past orders',
  '/cart': 'Check items in your cart',
  '/pendingorder': 'Orders waiting in the kitchen',
  '/myattendance': 'View your check-in and check-out history',
  '/allcustomer': 'View all customers and their orders',
  '/allemployee': 'View and manage employees',
  '/createcategory': 'Add or update menu categories',
  '/createitem': 'Add, update or delete menu items',
  '/allorders': 'See every order placed',
  '/addtable': 'Add or delete dining tables',
  '/empattendance': 'Mark employee check-in and check-out',
  '/attendancereport': 'View attendance of all staff',
  '/allreservations': 'View and cancel table reservations',
  '/manageleaves' : 'Get nd update status of leave'
};

const Home = () => {
  const [isLoggedIn] = useContext(isLoggedInContext);
  const [role] = useContext(RoleContext);
  const dbitems = useContext(itemsContext) || [];

  let links = [];
  if (isLoggedIn && ROLE_LINKS[role]) {
    links = ROLE_LINKS[role];
  }
  const featured = dbitems.slice(0, 4);

  return (
    <div className="d-flex flex-column">
      <header className="bg-dark text-white text-center py-5">
        <div className="container py-4">
          <h1 className="display-4 fw-bold">Welcome to Cafe Website ☕</h1>
          <p className="lead text-white-50 mb-4">
            Great coffee, quick ordering and a table waiting for you.
          </p>

          {!isLoggedIn && (
            <div className="d-flex flex-wrap justify-content-center gap-2">
              <Link to="/login" className="btn btn-lg btn-warning">Login</Link>
              <Link to="/register" className="btn btn-lg btn-outline-light">Create Account</Link>
            </div>
          )}

          {isLoggedIn && (
            <p className="text-white-50 mb-0">
              Logged in as <strong className="text-warning text-capitalize">{role}</strong>
            </p>
          )}
        </div>
      </header>

      <section className="container py-5">
        {!isLoggedIn && (
          <p className="text-center text-muted mb-0">
            Please login to see the features available for you.
          </p>
        )}

        {isLoggedIn && links.length === 0 && (
          <p className="text-center text-muted mb-0">
            No pages are available for your role yet.
          </p>
        )}

        {isLoggedIn && links.length > 0 && (
          <>
            <h3 className="fw-bold text-center mb-4">What would you like to do?</h3>
            <div className="row g-4 text-center">
              {links.map((link) => (
                <div className="col-12 col-sm-6 col-md-4" key={link.to}>
                  <Link to={link.to} className="text-decoration-none">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body p-4">
                        <h5 className="card-title fw-semibold text-dark">{link.label}</h5>
                        <p className="card-text text-muted mb-0">
                          {DESCRIPTIONS[link.to] || ''}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {featured.length > 0 && (
        <section className="bg-light py-5">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">Popular on our menu</h3>
              <Link to="/menu" className="btn btn-outline-dark btn-sm">See full menu</Link>
            </div>
            <div className="row g-3">
              {featured.map((item) => (
                <div className="col-6 col-lg-3" key={item.item_id}>
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body">
                      <h6 className="card-title fw-semibold">{item.item_name}</h6>
                      <p className="text-muted small mb-2">Size: {item.item_size}</p>
                      <span className="badge bg-warning text-dark fs-6">Rs. {item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

     
    </div>
  );
};

export default Home;