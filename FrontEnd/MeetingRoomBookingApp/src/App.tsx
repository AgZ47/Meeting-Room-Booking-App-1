import { LoginPage } from "./components/pages/loginPage"  
import {Routes, Route} from "react-router-dom"
import { RegisterPage } from "./components/pages/registerPage"

function App() {
  return(
    <div>
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='register' element={<RegisterPage/>}/>
      </Routes>
    </div>
  )
}

export default App
