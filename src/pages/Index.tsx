
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BedDouble, Users, CreditCard } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Automatically redirect after a short delay
    const timeout = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold mb-4 text-blue-900">Dorm Hub System</h1>
        <p className="text-xl text-blue-600 mb-8">
          A comprehensive boarding house management solution
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <BedDouble className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Room Management</h3>
            <p className="text-gray-600 text-sm">
              Track room availability and assign tenants to specific rooms
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Tenant Management</h3>
            <p className="text-gray-600 text-sm">
              Register and manage tenant profiles with ease
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">Payment Processing</h3>
            <p className="text-gray-600 text-sm">
              Track rental payments and payment history efficiently
            </p>
          </div>
        </div>
        
        <Button 
          size="lg" 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Get Started
        </Button>
        <p className="text-sm text-blue-500 mt-4">
          Redirecting to login page...
        </p>
      </div>
    </div>
  );
};

export default Index;
