import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaSignInAlt, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await toast.promise(
        login(email, password),
        {
          loading: 'Authenticating...',
          success: 'Login successful! Redirecting...',
          error: (err) => err.response?.data?.message || 'Login failed. Please check your credentials.'
        }
      );
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
        <div className="bg-gradient-to-r from-teal-800 to-teal-600 p-6 text-center">
          <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
            <FaLock className="text-teal-300" />
            Admin Portal
          </h2>
          <p className="text-teal-200 mt-1">Secure access to your dashboard</p>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-rose-900/20 text-rose-200 rounded-lg border-l-4 border-rose-500 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FaEnvelope className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-slate-200 placeholder-slate-400"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FaLock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition text-slate-200 placeholder-slate-400"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-teal-400 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5" />
                  ) : (
                    <FaEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-slate-600 rounded bg-slate-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-teal-400 hover:text-teal-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 px-4 rounded-lg font-medium text-white transition flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-teal-600/70 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800'
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin h-4 w-4" />
                  Signing in...
                </>
              ) : (
                <>
                  <FaSignInAlt className="h-4 w-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        <div className="px-6 py-4 bg-slate-700/30 text-center border-t border-slate-700">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Your Company. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;