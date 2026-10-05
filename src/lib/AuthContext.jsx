import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  // 프로필 정보 조회 및 없을 시 기본 생성
  const fetchOrCreateProfile = async (authUser) => {
    if (!authUser) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (data) {
        setProfile(data);
        return data;
      }

      // 프로필이 없는 경우 기본 생성
      const defaultName =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        (authUser.email ? authUser.email.split('@')[0] : 'zeni 메이커');
      const defaultHandle = (authUser.email ? authUser.email.split('@')[0] : `user_${authUser.id.slice(0, 6)}`);

      const newProfile = {
        id: authUser.id,
        email: authUser.email,
        full_name: defaultName,
        handle: defaultHandle,
        avatar_url: authUser.user_metadata?.avatar_url || '',
      };

      const { data: createdData } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      setProfile(createdData || newProfile);
      return createdData || newProfile;
    } catch (err) {
      console.warn('Profile fetch/create fallback:', err);
      return null;
    }
  };

  useEffect(() => {
    // 1. 현재 세션 확인
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          setUser(currentSession.user);
          setIsAuthenticated(true);
          await fetchOrCreateProfile(currentSession.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();

    // 2. 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setUser(newSession.user);
        setIsAuthenticated(true);
        await fetchOrCreateProfile(newSession.user);
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 구글 로그인
  const loginWithGoogle = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  // 카카오 로그인
  const loginWithKakao = async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  // 이메일 로그인
  const loginWithEmail = async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  // 이메일 회원가입
  const signUpWithEmail = async (email, password, metadata = {}) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
  };

  // 로그아웃
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  // 프로필 정보 업데이트
  const updateProfile = async (updates) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  };

  // 기존 컴포넌트 호환용 user 객체 (full_name, handle 등이 바로 조회되도록 병합)
  const mergedUser = user
    ? {
        ...user,
        full_name: profile?.full_name || user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'zeni'),
        handle: profile?.handle || (user.email ? user.email.split('@')[0] : 'zeni'),
        bio: profile?.bio || '',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || '',
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user: mergedUser,
        rawUser: user,
        session,
        profile,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        loginWithGoogle,
        loginWithKakao,
        loginWithEmail,
        signUpWithEmail,
        logout,
        updateProfile,
        checkUserAuth: async () => {
          if (user) await fetchOrCreateProfile(user);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

