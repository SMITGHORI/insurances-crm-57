
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Shield, Users, TrendingUp, Award } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast.success('Login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);

    try {
      const result = await login(demoEmail, demoPassword);
      
      if (result.success) {
        toast.success('Demo login successful!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Demo login failed');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      toast.error('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Column - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amba-blue via-amba-lightblue to-amba-blue relative overflow-hidden">
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
            <h1 className="text-3xl font-bold text-amba-blue mb-2">AMBA INSURANCE</h1>
            <p className="text-gray-600">Professional CRM Platform</p>
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
                  className="w-full h-11 bg-amba-blue hover:bg-amba-blue/90 text-white font-medium"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Demo Credentials</span>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Super Admin:</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('admin@ambainsurance.com', 'admin123')}
                      disabled={loading}
                      className="text-xs"
                    >
                      Login as Admin
                    </Button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Email: admin@ambainsurance.com</div>
                    <div>Password: admin123</div>
                  </div>
                </div>
                <div className="border-t border-blue-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Agent:</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoLogin('agent@ambainsurance.com', 'agent123')}
                      disabled={loading}
                      className="text-xs"
                    >
                      Login as Agent
                    </Button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>Email: agent@ambainsurance.com</div>
                    <div>Password: agent123</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Features */}
          <div className="lg:hidden mt-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-amba-blue/10 rounded-lg flex items-center justify-center mx-auto">
                  <Shield className="w-5 h-5 text-amba-blue" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Secure</h3>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-amba-blue/10 rounded-lg flex items-center justify-center mx-auto">
                  <Users className="w-5 h-5 text-amba-blue" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Comprehensive</h3>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-amba-blue/10 rounded-lg flex items-center justify-center mx-auto">
                  <TrendingUp className="w-5 h-5 text-amba-blue" />
                </div>
                <h3 className="text-sm font-semibold text-gray-700">Analytics</h3>
              </div>
              <div className="space-y-2">
                <div className="w-10 h-10 bg-amba-blue/10 rounded-lg flex items-center justify-center mx-auto">
                  <Award className="w-5 h-5 text-amba-blue" />
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
