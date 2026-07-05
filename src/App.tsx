import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MedicineInfo from './components/MedicineInfo';
import ClarifyMedicine from './components/ClarifyMedicine';
import Pricing from './components/Pricing';
import ComingSoonDoctor from './components/ComingSoonDoctor';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';
import { AuthProvider } from './contexts/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/medicine/:id" element={<MedicineInfo />} />
          <Route path="/clarify" element={<ClarifyMedicine />} />
          <Route path="/subscription" element={<Pricing />} />
          <Route path="/doctor" element={<ComingSoonDoctor />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}


