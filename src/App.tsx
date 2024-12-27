import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TransactionProvider } from './contexts/TransactionContext';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import Home from './pages/Home';
import CoinDetails from './pages/CoinDetails';
import Spinner from './components/Spinner';
import Login from './pages/Login';
import Register from './pages/Register';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Wallet = React.lazy(() => import('./pages/Wallet'));
const Transactions = React.lazy(() => import('./pages/Transactions'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <AuthGuard><Dashboard /></AuthGuard>
              } />
              <Route path="/wallet" element={
                <AuthGuard><Wallet /></AuthGuard>
              } />
              <Route path="/transactions" element={
                <AuthGuard><Transactions /></AuthGuard>
              } />
              <Route path="/coin/:coinSymbol" element={
                <Suspense fallback={<Spinner />}>
                  <CoinDetails />
                </Suspense>
              } />
              <Route path="/profile" element={
                <AuthGuard><Profile /></AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard><Settings /></AuthGuard>
              } />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
