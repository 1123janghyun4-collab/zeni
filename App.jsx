import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import PageNotFound from '@/lib/zeni/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import ScrollToTop from '@/components/zeni/ScrollToTop';

// pages 경로 (zeni 폴더 구조 반영)
import Home from '@/pages/zeni/Home';
import ProjectDetail from '@/pages/zeni/ProjectDetail';
import MyPage from '@/pages/zeni/MyPage';
import MyRecords from '@/pages/zeni/MyRecords';
import ArchiveEditor from '@/pages/zeni/ArchiveEditor';
import BlogEditor from '@/pages/zeni/BlogEditor';
import WriteChoice from '@/pages/zeni/WriteChoice';
import Legal from '@/pages/zeni/Legal';
import Login from '@/pages/zeni/Login';
import Register from '@/pages/zeni/Register';
import ForgotPassword from '@/pages/zeni/ForgotPassword';
import ResetPassword from '@/pages/zeni/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<Home />} />
      <Route path="/project/:id" element={<ProjectDetail />} />
      <Route path="/legal/:slug" element={<Legal />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/records" element={<MyRecords />} />
        <Route path="/write/new" element={<WriteChoice />} />
        <Route path="/archive/new" element={<ArchiveEditor />} />
        <Route path="/archive/edit/:id" element={<ArchiveEditor />} />
        <Route path="/blog/new" element={<BlogEditor />} />
        <Route path="/blog/edit/:id" element={<BlogEditor />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
