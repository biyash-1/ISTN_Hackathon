'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, FileText, PlusCircle, BarChart, User, Menu, X, Bell, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { useAuthStore } from '@/app/store/useAuthStore';
import { useRouter } from 'next/navigation';
const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const [openDropdown, setOpenDropdown] = useState(false);
  const router = useRouter();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Reports', href: '/admin/dashboard', icon: FileText },
    { name: 'Analytics', href: '/admin/analytics', icon: PlusCircle },
    { name: 'Ambulance', href: '/ambulance', icon: BarChart },
   
  ];

  const handleLogout = async () => {
  try {
    await logout(); // wait for store + API to finish
    router.push("/login"); // then navigate
  } catch (err) {
    console.error("Logout failed", err);
  }
};


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              Accident<span className="text-red-600">Report</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                    ${isActive ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Notification */}
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-600"></span>
            </button>

            {/* Login/Logout (Desktop) */}
            <div className="hidden md:flex items-center space-x-3">
              {!isAuthenticated ? (
                <Link href="/login">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    Login
                  </Button>
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(!openDropdown)}
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-red-600 text-white"
                  >
                    <User className="h-5 w-5" />
                  </button>

                  {openDropdown && (
                    <div className="absolute right-0 mt-2 w-40 rounded-md bg-white shadow-lg border">
                      <button
                        onClick={() => {
                         handleLogout();
                          setOpenDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-md p-2 text-gray-700 md:hidden"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="border-t md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 rounded-lg px-3 py-3 text-base font-medium
                      ${isActive ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Login/Logout Button */}
            {!isAuthenticated ? (
  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
    <Button className="w-full bg-red-600 hover:bg-red-700 text-white mt-4">
      Login
    </Button>
  </Link>
) : (
  <Button 
    onClick={() => {
      handleLogout();
      setIsMenuOpen(false);
    }}
    className="w-full bg-red-600 hover:bg-red-700 text-white mt-4 flex items-center justify-center gap-2"
  >
    <LogOut className="h-4 w-4" />
    Logout
  </Button>
)}

            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;