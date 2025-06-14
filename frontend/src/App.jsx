import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignupcomponent from "./components/login/LoginSignupcomponent";
import LandingPage from "./pages/LandingPage";
import KitPage from './pages/KitPage';
import CompilerPage from './pages/CompilerPage';
import ConsolePage from './pages/ConsolePage.jsx';
import { AuthProvider } from "./auth/AuthContext.jsx";
import ProtectedRoute from './auth/ProtectedRoutes.jsx';
import { CartProvider } from './auth/CartContext.jsx';
import CartPages from './pages/CartPages.jsx';
import ConsoleProject from './components/console/ConsoleProject.jsx';
import ClientCodePage from './pages/ClientCodePage.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
          <Router>
            <div className="App">
              <Routes>
                <Route path="/loginsignup" element={<LoginSignupcomponent />} />
                {/* Protected Routes */}
                <Route path="/" element={<LandingPage />} />
                {/* <Route path="/compiler" element={<ProtectedRoute><CompilerPage /></ProtectedRoute>} /> */}
                <Route path="/compiler" element={<ProtectedRoute><ClientCodePage /></ProtectedRoute>} />
                <Route path="/console" element={<ProtectedRoute><ConsolePage /></ProtectedRoute>} />
                {/* <Route path="/console/project" element={<ProtectedRoute><ConsoleProject /></ProtectedRoute>} /> */}
                <Route path="/kit" element={<ProtectedRoute><KitPage /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><CartPages /></ProtectedRoute>} />
              </Routes>
            </div>
          </Router>
        </CartProvider>
    </AuthProvider>
  );
}

export default App;
