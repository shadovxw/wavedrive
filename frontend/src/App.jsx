import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignupcomponent from "./components/login/LoginSignupcomponent";
import LandingPage from "./pages/LandingPage";
import KitPage from './pages/KitPage';
import CompilerPage from './pages/CompilerPage';

function App() {
  

  return (
    <Router>
    <div className="App">
      <Routes>
        <Route path="/loginsignup" element={<LoginSignupcomponent/>} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/compiler" element={<CompilerPage />} />
        <Route path="/b" element={<LandingPage />} />
        <Route path="/kit" element={<KitPage />} />
      </Routes>
    </div>
    
    
      
  </Router>
  )
}

export default App
