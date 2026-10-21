import { LoginPage } from "./components/pages/auth/loginPage"  
import {Routes, Route} from "react-router-dom"
import { RegisterPage } from "./components/pages/auth/registerPage"
import { AdminRooms } from "./components/pages/admin/adminRooms"
import { AdminBookings } from "./components/pages/admin/adminBookings"

function App() {
  return(
    <div>
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
        <Route path='/admin/rooms' element={<AdminRooms/>}/>
        <Route path="/admin/bookings" element={<AdminBookings/>}/>
      </Routes>
    </div>
  )
}

export default App
