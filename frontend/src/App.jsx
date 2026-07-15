import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Trainers from './pages/Trainers';
import Secretary from './pages/Secretary';
import Categories from './pages/Categories';
import Subscriptions from './pages/Subscriptions';
import ProtectedLogin from './components/ProtectedLogin';
import ActivityEntry from './pages/ActivityEntry';
import ActivityLog from './pages/ActivityEntry';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={ <ProtectedLogin> <Login /> </ProtectedLogin>} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/trainers" element={<Trainers />} />
            <Route path="/secretary" element={<ProtectedRoute adminOnly={true}> <Secretary /> </ProtectedRoute> } />
            <Route path="/categories" element={<Categories />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/activity" element={<ActivityLog />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
