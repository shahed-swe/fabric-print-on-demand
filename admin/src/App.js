import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Customers from './pages/Customers';
import ProductForm from './pages/ProductForm';
import Categories from './pages/Categories';
// import Designs from './pages/Designs';
import StockManagement from './pages/StockManagement';

// Layout
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/products" element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/products/new" element={
            <ProtectedRoute>
              <Layout>
                <ProductForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/products/edit/:id" element={
            <ProtectedRoute>
              <Layout>
                <ProductForm />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/stock-management" element={
            <ProtectedRoute>
              <Layout>
                <StockManagement />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/orders/:orderId" element={
            <ProtectedRoute>
              <Layout>
                <OrderDetails />
              </Layout>
            </ProtectedRoute>
          } />


          <Route path="/customers" element={
            <ProtectedRoute>
              <Layout>
                <Customers />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/categories" element={
            <ProtectedRoute>
              <Layout>
                <Categories />
              </Layout>
            </ProtectedRoute>
          } />
          
          {/* <Route path="/designs" element={
            <ProtectedRoute>
              <Layout>
                <Designs />
              </Layout>
            </ProtectedRoute>
          } /> */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
