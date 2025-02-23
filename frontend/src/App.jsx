import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignupcomponent from "./components/login/LoginSignupcomponent";
import LandingPage from "./pages/LandingPage";
import KitPage from './pages/KitPage';
function App() {
  

  return (
    <Router>
    <div className="App">
      <Routes>
        <Route path="/loginsignup" element={<LoginSignupcomponent/>} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/a" element={<LandingPage />} />
        <Route path="/b" element={<LandingPage />} />
        <Route path="/kit" element={<KitPage />} />
      </Routes>
    </div>
    
    
      
  </Router>
  )
}

export default App
