import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignupcomponent from "./components/login/LoginSignupcomponent";
import LandingPage from "./pages/LandingPage";
import KitPage from './pages/KitPage';
import CompilerPage from './pages/CompilerPage';
import ConsolePage from './pages/ConsolePage.jsx';
import { AuthProvider } from "./auth/AuthContext.jsx";

function App() {
  
  return (
    <AuthProvider>
          <Router>
    <div className="App">
      <Routes>
        <Route path="/loginsignup" element={<LoginSignupcomponent/>} />
        <Route path="/dashboard" element={<LandingPage />} />
        <Route path="/compiler" element={<CompilerPage />} />
        <Route path="/console" element={<ConsolePage />} />
        <Route path="/kit" element={<KitPage />} />
      </Routes>
      
    </div>
      
  </Router>

    </AuthProvider>

  )
}

export default App
