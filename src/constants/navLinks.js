export const ROLE_LINKS = {
  customer: [
    { to: "/menu", label: "Our Menu" },
    { to: "/tables", label: "Book a Table" },
    { to: "/myorders", label: "My Orders" },
    { to: "/cart", label: "Carts" }
  ],
  employee: [{ to: "/pendingorder", label: "Pending Orders" },
        { to: "/myattendance", label: "My Attendance" },
         { to: "/applyleave", label: "Leaves" },

  ],
  
  admin: [
    { to: "/allcustomer", label: "All Customer" },
    { to: "/allemployee", label: "All employee" },
    { to: "/createcategory", label: "Create Category" },
    { to: "/createitem", label: "Create Item" },
    { to: "/allorders", label: "All Orders" },
    { to: "/addtable", label: "Add Table" },
    { to: "/empattendance", label: "Add Attendance" },
    { to: "/allreservations", label: "Reservations" },
        { to: "/attendancereport", label: "Attendance Report" },   
        {to:'/manageleaves', label:"Manage Leaves"}   
  ],
};
