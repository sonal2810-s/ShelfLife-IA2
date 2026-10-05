import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Books } from './pages/Books';
import { IssueBook } from './pages/IssueBook';
import { Members } from './pages/Members';
import { MemberHistory } from './pages/MemberHistory';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes wrapped in Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/books" replace />} />
            <Route path="/books" element={<Books />} />
            <Route path="/issue" element={<IssueBook />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/:id/history" element={<MemberHistory />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/books" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
