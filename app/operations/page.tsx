import Topbar from '../components/Topbar';
import { CogIcon } from '@heroicons/react/24/outline';

export default function OperationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Topbar />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto mb-6">
            <CogIcon className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Operations Dashboard</h1>
          <p className="text-xl text-gray-600 mb-8">Process optimization and efficiency</p>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              The Operations dashboard is currently under development. This will include:
            </p>
            <ul className="text-left text-gray-600 space-y-2">
              <li>• Process efficiency metrics</li>
              <li>• Resource utilization tracking</li>
              <li>• Quality control analytics</li>
              <li>• Supply chain monitoring</li>
              <li>• Performance optimization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
