export default function Sidebar() {
  const navigation = [
    { name: 'Dashboard', href: '#', current: true },
    { name: 'Pipeline', href: '#', current: false },
    { name: 'Analytics', href: '#', current: false },
    { name: 'Reports', href: '#', current: false },
    { name: 'Settings', href: '#', current: false },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-gray-50 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
        </div>
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`${
                  item.current
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div>
                <div className="text-sm font-medium text-gray-700">Admin User</div>
                <div className="text-xs text-gray-500">admin@company.com</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
