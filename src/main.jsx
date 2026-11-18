import { BrowserRouter } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LoggedinContext from './context/LoggedinContext.jsx'
import ItemsContext from './context/ItemsContext.jsx'
import CartIdContext from './context/CartIdContext.jsx' 
import { RoleProvider } from './context/RoleContext.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';




createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <LoggedinContext>
      <ItemsContext>
        <CartIdContext>  
          <RoleProvider>
            <App />
          </RoleProvider>
        </CartIdContext>
      </ItemsContext>
    </LoggedinContext>
  </BrowserRouter>
)
