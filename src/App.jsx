import { Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';

import Home from './pages/Home.jsx';

import Login from './features/auth/pages/Login.jsx';
import Register from './features/auth/pages/Register.jsx';
import Item from './features/menu/pages/Items.jsx';
import Carts from './features/cart/pages/Carts.jsx';
import Order from './features/cart/pages/Order.jsx';
import OrderHistory from './features/orders/pages/OrderHistory.jsx';
import Tables from './features/tables/pages/Tables.jsx';
import PendingOrders from './features/employee/pages/PendingOrder.jsx';
import ApplyLeave from './features/employee/pages/ApplyLeave.jsx';
import Employee from './features/admin/pages/Employee.jsx';
import Customer from './features/admin/pages/Customer.jsx';
import CreateCategory from './features/admin/pages/CreateCategory.jsx';
import CreateItem from './features/admin/pages/CreateItem.jsx';
import AllOrders from './features/admin/pages/AllOrders.jsx';
import AddTable from './features/admin/pages/AddTable.jsx';
import EmpAttendance from './features/admin/pages/EmpAttendance.jsx';
import AdminReservations from './features/admin/pages/AdminReservations.jsx';
import MyAttendance from './features/employee/pages/MyAttendance.jsx';
import AdminAttendance from './features/admin/pages/AdminAttendance.jsx';
import ManageLeaves from './features/admin/pages/ManageLeaves.jsx';

import ProtectedRoute from './components/common/ProtectedRoute.jsx';

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/menu' element={<Item />} />

        {/* Any logged-in user */}
        <Route element={<ProtectedRoute />}>
          <Route path='/tables' element={<Tables />} />
        </Route>

        {/* Customer only */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path='/cart' element={<Carts />} />
          <Route path='/order' element={<Order />} />
          <Route path='/myorders' element={<OrderHistory />} />
        </Route>

        {/* Employee only */}
        <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
          <Route path='/pendingorder' element={<PendingOrders />} />
          <Route path='/myattendance' element={<MyAttendance />} />
          <Route path='/applyleave' element={<ApplyLeave />} />
        </Route>

        {/* Admin only */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path='/allEmployee' element={<Employee />} />
          <Route path='/allcustomer' element={<Customer />} />
          <Route path='/createcategory' element={<CreateCategory />} />
          <Route path='/createitem' element={<CreateItem />} />
          <Route path='/allorders' element={<AllOrders />} />
          <Route path='/addtable' element={<AddTable />} />
          <Route path='/empattendance' element={<EmpAttendance />} />
          <Route path='/allreservations' element={<AdminReservations />} />
          <Route path='/attendancereport' element={<AdminAttendance />} />
          <Route path='/manageleaves' element={<ManageLeaves />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;