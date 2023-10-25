import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./component/utilities/Navbar/Navbar";
import About from "./pages/About/About";
import Home from "./pages/Home/Home";
import DashBoard from "./pages/Dashboard/DashBoard";
import Services from "./pages/Services/Services";
import LogIn from "./pages/Login-Logout/LogIn";
import Register from "./pages/Login-Logout/Register";
import Contact from "./pages/Contact/Contact";
import Forgot from "./pages/Login-Logout/Forgot";
import Explore from "./pages/Explore/Explore";
import "./App.css";
import CaseDetail from "./component/utilities/caseDetail/CaseDetail";

function App() {
  return (
    <>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Routes>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="dashboard" element={<DashBoard />} />       
            <Route path="services" element={<Services />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<LogIn />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot" element={<Forgot />} />
            <Route path="explore" element={<Explore />} />
            <Route path="case/:case_no" element={<CaseDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
