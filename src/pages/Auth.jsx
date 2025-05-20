
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  UserPlus, 
  LogIn, 
  Building, 
  Phone 
} from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    company: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      toast.success('Login successful');
      navigate('/dashboard');
    } else {
      toast.success('Account created successfully');
      setIsLogin(true);
    }
  };

  const loginAsSuperAdmin = () => {
    setFormData({
      email: 'admin@ambainsurance.com',
      password: 'admin123',
    });
    toast.success('Logging in as Super Admin');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  const loginAsAgent = () => {
    setFormData({
      email: 'agent@ambainsurance.com',
      password: 'agent123',
    });
    toast.success('Logging in as Agent');
    setTimeout(() => {
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="w-full md:w-1/2 auth-background flex flex-col justify-center items-center p-8 text-white">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="text-center">
            <img
              src="/logo.png"
              alt="Amba Insurance"
              className="h-20 mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold mb-2">Welcome to Amba Insurance CRM</h2>
            <p className="text-lg opacity-80">
              Your complete solution for managing clients, policies, claims, and more
            </p>
          </div>

          <div className="mt-10 space-y-4 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Client Management</h3>
                <p className="text-sm opacity-80">Manage individual, corporate, and group clients</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Policy Management</h3>
                <p className="text-sm opacity-80">Track all policies across different insurance types</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-2 rounded-full">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Secure Access Control</h3>
                <p className="text-sm opacity-80">Role-based access for agents and administrators</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 font-medium text-amba-blue hover:text-amba-lightblue"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 block w-full py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amba-blue focus:border-amba-blue"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      className="pl-10 block w-full py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amba-blue focus:border-amba-blue"
                      placeholder="Your Insurance Agency"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10 block w-full py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amba-blue focus:border-amba-blue"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amba-blue focus:border-amba-blue"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 block w-full py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amba-blue focus:border-amba-blue"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              {isLogin && (
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-amba-blue focus:ring-amba-blue border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
              )}

              {isLogin && (
                <div className="text-sm">
                  <a href="#" className="font-medium text-amba-blue hover:text-amba-lightblue">
                    Forgot your password?
                  </a>
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-amba-blue hover:bg-amba-lightblue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amba-blue"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {isLogin ? (
                    <LogIn className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
                  ) : (
                    <UserPlus className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
                  )}
                </span>
                {isLogin ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Quick access</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={loginAsSuperAdmin}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Login as Super Admin
              </button>
              <button
                onClick={loginAsAgent}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Login as Agent
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
