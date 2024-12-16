'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Settings, LogOut, User, Sun, Moon, Menu, Image as ImageIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTitle, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ImageUploader from '@/components/Drag&Drop';
import Cookies from 'js-cookie';


const Header = () => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
  ];

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (window.innerWidth >= 768) {
        setShowUploader(true);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (window.innerWidth >= 768) {
        setShowUploader(true);
      }
    };
    

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);
    setMounted(true);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowUploader(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    router.push('/login');
  }

  return (
<header className={`
  transition-all duration-300 pt-2 bg-background/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50`}>
      <div className="container mx-auto px-4 py-2">
        <nav className="flex items-center">
          {/* Left section */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold">Logo</Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    text-sm hover:text-primary 
                    ${pathname === item.href ? 'text-primary font-semibold' : ''}
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center section */}
          <div className="flex-1 flex justify-center relative">
            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex w-full max-w-md relative">
              <div className="relative flex w-full">
                {/* Icon */}
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                {/* Input */}
                <input
                  type="search"
                  placeholder="Search..."
                  className="
                    w-full pr-12 pl-10 py-2 rounded-md 
                    border border-input bg-background
                    focus:outline-none focus:ring-2 focus:ring-primary
                  "
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* Image Upload Icon */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowUploader(!showUploader)}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            {mounted ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            )
              :
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="h-5 w-5" />
              </Button>
            }

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <button onClick={handleLogout} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top">
                <SheetTitle>Menu</SheetTitle>

                <div className="flex flex-col gap-4 pt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        text-lg hover:text-primary 
                        ${pathname === item.href ? 'text-primary font-semibold' : ''}
                      `}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <form onSubmit={handleSearch} className="mt-4">
                    <div className="relative">
                      <input
                        type="search"
                        placeholder="Search..."
                        className="w-full px-3 py-2 rounded-md border border-input bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>

      {/* ImageUploader Overlay */}
      {showUploader && (
          <ImageUploader onClose={() => setShowUploader(false)} />
      )}
    </header>
  );
};

export default Header;