import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignupcomponent from "./components/login/LoginSignupcomponent";
import LandingPage from "./pages/LandingPage";
import KitPage from './pages/KitPage';
import CompilerPage from './pages/CompilerPage';
import ConsolePage from './pages/ConsolePage.jsx';
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from './auth/ProtectedRoutes.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/loginsignup" element={<LoginSignupcomponent />} />
            {/* Protected Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/compiler" element={<ProtectedRoute><CompilerPage /></ProtectedRoute>} />
            <Route path="/console" element={<ProtectedRoute><ConsolePage /></ProtectedRoute>} />
            <Route path="/kit" element={<ProtectedRoute><KitPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
