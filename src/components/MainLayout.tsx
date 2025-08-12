import { ReactNode, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  ChevronRight, 
  Map, 
  PlusCircle, 
  Search, 
  User, 
  LogOut, 
  Menu,
  Clock,
  Star,
  Home
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title = 'MoveMates' }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { 
      name: 'Home', 
      path: '/',
      icon: <Home size={20} />
    },
    { 
      name: 'Find Helpers', 
      path: '/find', 
      icon: <Map size={20} />
    },
    { 
      name: 'Create Request', 
      path: '/create', 
      icon: <PlusCircle size={20} />
    },
    { 
      name: 'My Requests', 
      path: '/my-requests', 
      icon: <Clock size={20} />
    },
    {
      name: user?.isHelper ? 'My Assignments' : 'Become a Helper',
      path: user?.isHelper ? '/assignments' : '/become-helper',
      icon: <Star size={20} />
    },
    { 
      name: 'Profile', 
      path: '/profile', 
      icon: <User size={20} />
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-primary flex items-center">
              <img src="/logo.png" alt="MoveMates logo" width={24} height={24} className="mr-2" />
              MoveMates
            </Link>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/find')} 
              className="text-muted-foreground"
            >
              Find Help
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/create')} 
              className="text-muted-foreground"
            >
              Post Job
            </Button>

            <div className="ml-4 flex items-center">
              {user ? (
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate('/profile')}>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout} 
                    className="ml-2 text-muted-foreground"
                  >
                    <LogOut size={16} className="mr-1" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Button variant="default" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
              )}
            </div>
          </nav>

          {/* Mobile menu button */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 sm:w-80 pt-10">
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <Link 
                    to="/" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-xl font-bold text-primary flex items-center"
                  >
                    <img src="/logo.png" alt="MoveMates logo" width={24} height={24} className="mr-2" />
                    MoveMates
                  </Link>
                </div>

                {user && (
                  <div className="flex items-center space-x-3 mb-6 px-2 py-4 bg-slate-50 rounded-md">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}

                <div className="flex-1">
                  <nav className="flex flex-col space-y-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center py-2 px-2 hover:bg-muted rounded-md text-muted-foreground hover:text-primary"
                      >
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.name}</span>
                        <ChevronRight size={16} className="ml-auto" />
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="py-4 mt-auto">
                  {user ? (
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center" 
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      className="w-full" 
                      onClick={() => {
                        navigate('/login');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {title && (
          <div className="bg-white border-b">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                © 2025 MoveMates. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-4">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">
                About
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}