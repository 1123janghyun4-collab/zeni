import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, User, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Register() {
  const { signUpWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: signUpError } = await signUpWithEmail(email, password, {
        full_name: fullName,
      });
      if (signUpError) throw signUpError;
      
      // 이메일 확인이 필요한 경우 안내
      if (data?.user && !data?.session) {
        setSuccess(true);
      } else {
        navigate(returnTo || "/");
      }
    } catch (err) {
      setError(err.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      const { data, error: googleError } = await loginWithGoogle();
      if (googleError) {
        throw googleError;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Google register error:", err);
      if (err.message?.includes("provider is not enabled")) {
        setError("Supabase 대시보드에서 Google 로그인이 아직 활성화되지 않았습니다. (아래 가이드 참고)");
      } else {
        setError(err.message || "구글 회원가입에 실패했습니다.");
      }
    }
  };

  return (
    <AuthLayout
      icon={UserPlus}
      title="회원가입"
      subtitle="zeni에서 사이드프로젝트를 시작해보세요"
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Link
            to={"/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="text-primary font-medium hover:underline"
          >
            로그인하기
          </Link>
        </>
      }
    >
      <Button
        variant="outline"
        className="w-full h-12 text-sm font-medium mb-6"
        onClick={handleGoogle}
      >
        <GoogleIcon className="w-5 h-5 mr-2" />
        구글 계정으로 계속하기
      </Button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">또는</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
          <p className="text-[15px] font-semibold text-green-800">회원가입 완료</p>
          <p className="text-[13px] text-green-700 mt-1">
            입력하신 이메일({email})로 인증 메일이 발송되었습니다. 확인 후 로그인해주세요.
          </p>
          <Link to="/login" className="mt-4 inline-block text-[13px] text-primary font-semibold underline">
            로그인 페이지로 이동
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">이름 / 닉네임</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                autoFocus
                placeholder="홍길동"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="6자 이상 입력해주세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                가입 중...
              </>
            ) : (
              "가입하기"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}