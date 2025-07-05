
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Shield, Users, TrendingUp, Award, Info } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin@123');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    console.log('Auth useEffect - isAuthenticated:', isAuthenticated, 'authLoading:', authLoading);
    if (isAuthenticated && !authLoading) {
      console.log('User authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting login form...');
      const result = await login(email, password);
      
      if (result.success) {
        console.log('Login successful, showing success message');
        toast.success('Login successful! Redirecting to dashboard...');
        
        // Small delay to show the toast
        setTimeout(() => {
          console.log('Navigating to dashboard');
          navigate('/dashboard', { replace: true });
        }, 500);
      } else {
        console.error('Login failed:', result.error);
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Column - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="max-w-md text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold leading-tight">
                Welcome to AMBA Insurance CRM
              </h1>
              <p className="text-xl text-blue-100">
                Streamline your insurance business with our comprehensive management platform
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Secure Platform</h3>
                <p className="text-sm text-blue-100">Bank-grade security for your data</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Client Management</h3>
                <p className="text-sm text-blue-100">Comprehensive client tracking</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Analytics</h3>
                <p className="text-sm text-blue-100">Real-time business insights</p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-semibold">Performance</h3>
                <p className="text-sm text-blue-100">Track and optimize results</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">AMBA INSURANCE</h1>
            <p className="text-gray-600">Professional CRM Platform</p>
          </div>

          {/* Demo Mode Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">Demo Mode Available</h4>
                <p className="text-sm text-blue-700 mt-1">
                  If backend is unavailable, the system will automatically switch to demo mode with pre-filled credentials.
                </p>
              </div>
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Sign In
              </CardTitle>
              <p className="text-gray-600">Access your dashboard</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-11"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="mt-4 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Demo credentials: admin@gmail.com / admin@123
                </p>
                <p className="text-xs text-gray-500">
                  System automatically detects backend availability
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Features */}
          <div className="lg:hidden mt-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Secure</h3>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Comprehensive</h3>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Analytics</h3>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Performance</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
