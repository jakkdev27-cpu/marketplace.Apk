import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Followers from './pages/Followers';
import Following from './pages/Following';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="profile" element={<Profile />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="followers" element={<Followers />} />
          <Route path="following" element={<Following />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;