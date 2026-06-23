import { useState, FC } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Package, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Navbar: FC = () => {
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [userMenuOpen, setUserMenuOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-700 transition-colors">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Shopify<span className="text-indigo-600">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium"
                >
                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-700 text-xs font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block">{user?.name.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                      <Link
                        to="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-indigo-600 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              Products
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;