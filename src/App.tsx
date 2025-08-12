import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Find from './pages/Find';
import CreateRequest from './pages/CreateRequest';
import MyRequests from './pages/MyRequests';
import BecomeHelper from './pages/BecomeHelper';
import Assignments from './pages/Assignments';
import Login from './pages/Login';
import About from './pages/About';
import UserProfile from './pages/UserProfile';
import Payment from './pages/Payment';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find" element={<Find />} />
            <Route path="/create" element={<CreateRequest />} />
            <Route path="/my-requests" element={<MyRequests />} />
            <Route path="/become-helper" element={<BecomeHelper />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/payment/:userId" element={<Payment />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
