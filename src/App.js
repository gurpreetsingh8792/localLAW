import { BrowserRouter, Routes, Route} from "react-router-dom";
import Navbar from "./component/utilities/Navbar/Navbar"
import About from "./component/pages/About/About"
import Home from "./component/pages/Home/Home"
import DashBoard from "./component/pages/Dashboard/DashBoard"
import Services from "./component/pages/Services/Services"
import LogIn from "./component/pages/Login-Logout/LogIn"
import Register from "./component/pages/Login-Logout/Register"
import Contact from './component/pages/Contact/Contact';
import Forgot from './component/pages/Login-Logout/Forgot';
import "./App.css"


function App() {
  return (
    <BrowserRouter >
    <div className="App">
      <Navbar/>
      <Routes>
        <Route index element={<Home/>}/>
        <Route path="about" element={<About/>}/>
        <Route path="dashboard" element={<DashBoard/>}/>
        <Route path="services" element={<Services/>}/>
        <Route path="contact" element={<Contact/>}/>
        <Route path="login" element={<LogIn/>}/>
        <Route path="register" element={<Register/>}/>
        <Route path="forgot" element={<Forgot/>}/>
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
