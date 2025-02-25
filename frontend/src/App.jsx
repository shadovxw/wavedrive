import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignupcomponent from "./components/login/LoginSignupcomponent";
import LandingPage from "./pages/LandingPage";
import KitPage from './pages/KitPage';
import CompilerPage from './pages/CompilerPage';
import { GlobalProvider } from "./Globalcontext.jsx";
import ConsolePage from './pages/ConsolePage.jsx';
function App() {
  

  return (
    <GlobalProvider>
          <Router>
    <div className="App">
      <Routes>
        <Route path="/loginsignup" element={<LoginSignupcomponent/>} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/compiler" element={<CompilerPage />} />
        <Route path="/console" element={<ConsolePage />} />
        <Route path="/kit" element={<KitPage />} />
      </Routes>
      
    </div>
      
  </Router>

    </GlobalProvider>

  )
}

export default App
