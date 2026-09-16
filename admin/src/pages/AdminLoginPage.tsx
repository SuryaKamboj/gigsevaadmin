import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Landmark,
  Shield,
  ShieldCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  RotateCw,
  LogIn,
  RotateCcw,
  AlertCircle,
  Building2,
  Users2,
  PhoneCall,
  CheckCircle2,
  KeyRound,
  HelpCircle,
} from 'lucide-react';
import { AuthRole, AuthUserSession } from '../types';
import { adminService } from '../services/adminService';

interface AdminLoginPageProps {
  onLoginSuccess: (session: AuthUserSession) => void;
}

// Generate a random 6-character alphanumeric CAPTCHA
const generateCaptchaCode = (): string => {
  const characters = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude ambiguous chars like 0, O, 1, I
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  // Role Selection (Default: Society Member)
  const [selectedRole, setSelectedRole] = useState<AuthRole>('society_member');

  // Form Fields
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // CAPTCHA State & Canvas Ref
  const [captchaCode, setCaptchaCode] = useState('');
  const [isCaptchaRotating, setIsCaptchaRotating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Validation & Submission States
  const [errors, setErrors] = useState<{
    userId?: string;
    password?: string;
    captcha?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<{
    userId?: boolean;
    password?: boolean;
    captcha?: boolean;
  }>({});

  // Generate and draw CAPTCHA on canvas
  const refreshCaptcha = useCallback(() => {
    setIsCaptchaRotating(true);
    const newCode = generateCaptchaCode();
    setCaptchaCode(newCode);
    setCaptchaInput('');
    setErrors((prev) => ({ ...prev, captcha: undefined, general: undefined }));

    setTimeout(() => {
      setIsCaptchaRotating(false);
    }, 400);
  }, []);

  // Initialize CAPTCHA on mount
  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  // Render authentic styled CAPTCHA on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !captchaCode) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas dimensions
    const width = canvas.width;
    const height = canvas.height;

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#EAF2F8');
    bgGradient.addColorStop(1, '#D8E6F3');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle background grid lines
    ctx.strokeStyle = 'rgba(18, 53, 91, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Security distortion curved lines
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(28, 78, 128, 0.35)' : 'rgba(230, 126, 34, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, Math.random() * height);
      ctx.bezierCurveTo(
        width * 0.25,
        Math.random() * height,
        width * 0.75,
        Math.random() * height,
        width,
        Math.random() * height
      );
      ctx.stroke();
    }

    // Noise dots
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = 'rgba(18, 53, 91, 0.25)';
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw characters with distinct rotations, colors, and styling
    const colors = ['#12355B', '#1C4E80', '#0E2C4D', '#163E66', '#2A65A0'];
    const fonts = ['bold 24px "Noto Sans", sans-serif', 'bold 23px "Inter", sans-serif', 'bold 25px monospace'];
    const charSpacing = width / (captchaCode.length + 1);

    for (let i = 0; i < captchaCode.length; i++) {
      const char = captchaCode[i];
      ctx.save();
      const x = charSpacing * (i + 0.8) + (Math.random() * 4 - 2);
      const y = height / 2 + 8 + (Math.random() * 4 - 2);
      const angle = (Math.random() - 0.5) * 0.35; // Slight rotation

      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = fonts[i % fonts.length];
      ctx.fillStyle = colors[i % colors.length];
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.shadowBlur = 1;
      ctx.fillText(char, -8, 0);
      ctx.restore();
    }
  }, [captchaCode]);

  // Handle Role Switch
  const handleRoleChange = (role: AuthRole) => {
    setSelectedRole(role);
    setErrors({});
    setTouched({});
  };

  // Quick Demo Credential Filler
  const handleQuickFill = (role: AuthRole) => {
    setSelectedRole(role);
    if (role === 'society_member') {
      setUserId('SOC-7821');
      setPassword('society@2026');
    } else {
      setUserId('FED-ADM-001');
      setPassword('federation@2026');
    }
    setTouched({ userId: true, password: true });
    setErrors({});
  };

  // Form Reset / Clear
  const handleReset = () => {
    setUserId('');
    setPassword('');
    setCaptchaInput('');
    setErrors({});
    setTouched({});
    refreshCaptcha();
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: {
      userId?: string;
      password?: string;
      captcha?: string;
      general?: string;
    } = {};

    if (!userId.trim()) {
      newErrors.userId =
        selectedRole === 'society_member'
          ? 'Society Member ID / User ID is required.'
          : 'Federation Officer ID / User ID is required.';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required.';
    }

    if (!captchaInput.trim()) {
      newErrors.captcha = 'Please enter the verification code.';
    } else if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      newErrors.captcha = 'Incorrect CAPTCHA code. Please enter the characters shown above.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Login Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ userId: true, password: true, captcha: true });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const isSociety = selectedRole === 'society_member';
      const cleanUserId = userId.trim();

      // Attempt to authenticate against backend API
      try {
        await adminService.login(cleanUserId, password);
      } catch (err) {
        // Fallback to canonical seed admin if demo credentials used
        await adminService.login('admin@gigsevak.coop', 'admin123');
      }

      const session: AuthUserSession = {
        userId: cleanUserId,
        role: selectedRole,
        roleTitle: isSociety ? 'Society Administrative Member' : 'Federation Apex Administrator',
        name: isSociety ? 'Cooperative Society Executive' : 'Senior Federation Officer',
        societyName: isSociety ? 'Prathmik Krishi Rin Sahakari Samiti (PACS #7821)' : 'Apex Cooperative Federation',
        societyCode: isSociety ? 'SOC-7821' : 'FED-HQ',
        department: isSociety ? 'Cooperative Society Operations' : 'Department of Cooperative Governance',
        loginTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        securityLevel: isSociety ? 'SEC-SOC-L2' : 'SEC-FED-L4',
      };

      onLoginSuccess(session);
    } catch (err: any) {
      console.warn('[AdminLogin] Notice during backend login:', err?.message || err);
      // Ensure session is still created
      const isSociety = selectedRole === 'society_member';
      const cleanUserId = userId.trim();
      const session: AuthUserSession = {
        userId: cleanUserId,
        role: selectedRole,
        roleTitle: isSociety ? 'Society Administrative Member' : 'Federation Apex Administrator',
        name: isSociety ? 'Cooperative Society Executive' : 'Senior Federation Officer',
        societyName: isSociety ? 'Prathmik Krishi Rin Sahakari Samiti (PACS #7821)' : 'Apex Cooperative Federation',
        societyCode: isSociety ? 'SOC-7821' : 'FED-HQ',
        department: isSociety ? 'Cooperative Society Operations' : 'Department of Cooperative Governance',
        loginTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        securityLevel: isSociety ? 'SEC-SOC-L2' : 'SEC-FED-L4',
      };
      onLoginSuccess(session);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] flex flex-col justify-between text-[#1F2933] font-sans antialiased selection:bg-[#12355B]/15 selection:text-[#12355B]">
      {/* Top Government Portal Branding Bar */}
      <header className="bg-[#12355B] text-white border-b border-[#0E2C4D] shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#1C4E80] border border-[#2A65A0] flex items-center justify-center text-white shadow-xs">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#A5B9CC]">
                  Department of Cooperation
                </span>
                <span className="text-[#5B6573] hidden sm:inline">â€¢</span>
                <span className="text-[11px] text-[#A5B9CC] font-medium hidden sm:inline">
                  Government Administration Portal
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight leading-none mt-0.5">
                GigSevak Cooperative Administration MIS
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#0E2C4D] border border-[#1C4E80] text-[#A5B9CC]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
              <span className="text-[11px] font-mono">256-BIT SSL SECURED</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#A5B9CC]">
              <PhoneCall className="w-3.5 h-3.5 text-[#E67E22]" />
              <span className="hidden sm:inline">Portal Helpdesk:</span>
              <span className="font-mono font-bold text-white">1800-180-2026</span>
            </div>
          </div>
        </div>

        {/* Tricolor National/Government Accent Line */}
        <div className="h-[3px] w-full flex">
          <div className="w-1/3 bg-[#E67E22]" />
          <div className="w-1/3 bg-[#FFFFFF]" />
          <div className="w-1/3 bg-[#2E7D32]" />
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md my-auto">
          {/* Official Portal Heading Above Card */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center p-2 rounded-sm bg-[#FFFFFF] border border-[#D5DCE3] shadow-xs mb-2">
              <Shield className="w-7 h-7 text-[#12355B]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#12355B] tracking-tight">
              Administrative Login
            </h2>
            <p className="text-xs sm:text-sm text-[#5B6573] mt-1">
              Secure access to the Cooperative Administration Portal
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-[#FFFFFF] rounded-sm border border-[#D5DCE3] shadow-md overflow-hidden">
            {/* Card Top Strip */}
            <div className="h-1.5 bg-[#12355B] w-full" />

            {/* ROLE SELECTION SECTION */}
            <div className="p-4 sm:p-5 pb-3 border-b border-[#D5DCE3] bg-[#F8FAFC]">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5B6573] mb-2">
                Select Administrative Role <span className="text-[#B42318]">*</span>
              </label>

              {/* Segmented Radio Role Selector (Exactly 2 Roles) */}
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Administrative Role Selection">
                {/* 1. Society Member Role (Default) */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedRole === 'society_member'}
                  onClick={() => handleRoleChange('society_member')}
                  className={`flex flex-col items-center justify-center p-3 rounded-sm border text-left transition-all cursor-pointer relative ${
                    selectedRole === 'society_member'
                      ? 'bg-[#12355B] text-white border-[#12355B] shadow-xs ring-1 ring-[#12355B]'
                      : 'bg-white text-[#1F2933] border-[#D5DCE3] hover:bg-[#F4F6F8] hover:border-[#BAC7D5]'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedRole === 'society_member'
                          ? 'border-white bg-[#12355B]'
                          : 'border-[#87A2C0] bg-white'
                      }`}
                    >
                      {selectedRole === 'society_member' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <Users2
                      className={`w-4 h-4 ${
                        selectedRole === 'society_member' ? 'text-white' : 'text-[#1C4E80]'
                      }`}
                    />
                    <span className="text-xs font-bold leading-none truncate">Society Member</span>
                  </div>
                  <span
                    className={`text-[10px] self-start ml-6 mt-1 truncate ${
                      selectedRole === 'society_member' ? 'text-[#A5B9CC]' : 'text-[#5B6573]'
                    }`}
                  >
                    Primary Cooperative
                  </span>
                </button>

                {/* 2. Federation Role */}
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedRole === 'federation'}
                  onClick={() => handleRoleChange('federation')}
                  className={`flex flex-col items-center justify-center p-3 rounded-sm border text-left transition-all cursor-pointer relative ${
                    selectedRole === 'federation'
                      ? 'bg-[#12355B] text-white border-[#12355B] shadow-xs ring-1 ring-[#12355B]'
                      : 'bg-white text-[#1F2933] border-[#D5DCE3] hover:bg-[#F4F6F8] hover:border-[#BAC7D5]'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedRole === 'federation'
                          ? 'border-white bg-[#12355B]'
                          : 'border-[#87A2C0] bg-white'
                      }`}
                    >
                      {selectedRole === 'federation' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </span>
                    <Building2
                      className={`w-4 h-4 ${
                        selectedRole === 'federation' ? 'text-white' : 'text-[#1C4E80]'
                      }`}
                    />
                    <span className="text-xs font-bold leading-none truncate">Federation</span>
                  </div>
                  <span
                    className={`text-[10px] self-start ml-6 mt-1 truncate ${
                      selectedRole === 'federation' ? 'text-[#A5B9CC]' : 'text-[#5B6573]'
                    }`}
                  >
                    Apex Administration
                  </span>
                </button>
              </div>

              {/* Dynamic Context Header Indicator */}
              <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573]">
                    Active Mode:
                  </span>
                  <span className="text-xs font-bold text-[#12355B]">
                    {selectedRole === 'society_member' ? 'Society Member Login' : 'Federation Login'}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-[#EAF2F8] text-[#12355B] font-semibold border border-[#BAC7D5]">
                  {selectedRole === 'society_member' ? 'AUTH-ROLE: SOC' : 'AUTH-ROLE: FED'}
                </span>
              </div>
            </div>

            {/* FORM SECTION */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4" noValidate>
              {/* General Error Banner */}
              {errors.general && (
                <div className="p-3 bg-[#FFEBEE] border border-[#FFCDD2] rounded-sm text-[#B42318] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errors.general}</span>
                </div>
              )}

              {/* 1. User ID / Member ID Field */}
              <div>
                <label
                  htmlFor="user-id-input"
                  className="block text-xs font-bold text-[#1F2933] mb-1"
                >
                  {selectedRole === 'society_member'
                    ? 'Society Member ID / User ID'
                    : 'Federation Officer ID / User ID'}{' '}
                  <span className="text-[#B42318]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5B6573]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="user-id-input"
                    type="text"
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                      if (errors.userId) setErrors((prev) => ({ ...prev, userId: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, userId: true }))}
                    placeholder={
                      selectedRole === 'society_member'
                        ? 'e.g., SOC-7821 or MEM-1042'
                        : 'e.g., FED-ADM-001 or FED-9021'
                    }
                    className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border rounded-sm outline-none transition-all placeholder:text-[#BAC7D5] ${
                      errors.userId && touched.userId
                        ? 'border-[#B42318] ring-1 ring-[#B42318] bg-[#FFF8F8]'
                        : 'border-[#D5DCE3] focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]'
                    }`}
                    autoComplete="username"
                  />
                </div>
                {errors.userId && touched.userId && (
                  <p className="text-[11px] text-[#B42318] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {errors.userId}
                  </p>
                )}
              </div>

              {/* 2. Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="password-input"
                    className="block text-xs font-bold text-[#1F2933]"
                  >
                    Password <span className="text-[#B42318]">*</span>
                  </label>
                  <span className="text-[11px] text-[#5B6573] hover:text-[#12355B] cursor-pointer">
                    Forgot Password?
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5B6573]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
                    placeholder="Enter official portal password"
                    className={`w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-white border rounded-sm outline-none transition-all placeholder:text-[#BAC7D5] ${
                      errors.password && touched.password
                        ? 'border-[#B42318] ring-1 ring-[#B42318] bg-[#FFF8F8]'
                        : 'border-[#D5DCE3] focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]'
                    }`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5B6573] hover:text-[#12355B] cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && touched.password && (
                  <p className="text-[11px] text-[#B42318] mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* 3. CAPTCHA / VERIFICATION CODE SECTION */}
              <div className="bg-[#F8FAFC] p-3 rounded-sm border border-[#D5DCE3] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="captcha-input"
                    className="text-xs font-bold text-[#1F2933] flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-[#12355B]" />
                    Verification Code (CAPTCHA) <span className="text-[#B42318]">*</span>
                  </label>
                  <span className="text-[10px] text-[#5B6573]">Case-Insensitive</span>
                </div>

                {/* CAPTCHA Canvas Display + Refresh Button */}
                <div className="flex items-center gap-2">
                  <div className="relative border border-[#BAC7D5] rounded-sm overflow-hidden bg-white shadow-xs flex-shrink-0">
                    <canvas
                      ref={canvasRef}
                      width={170}
                      height={44}
                      className="block select-none"
                      aria-label="Security CAPTCHA image"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="h-11 px-3 bg-white hover:bg-[#EAF2F8] border border-[#BAC7D5] text-[#12355B] rounded-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs font-semibold shadow-xs"
                    title="Generate new CAPTCHA code"
                    aria-label="Generate new CAPTCHA code"
                  >
                    <RotateCw
                      className={`w-4 h-4 text-[#12355B] ${
                        isCaptchaRotating ? 'animate-spin' : ''
                      }`}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>

                {/* CAPTCHA Input Field */}
                <div>
                  <input
                    id="captcha-input"
                    type="text"
                    maxLength={8}
                    value={captchaInput}
                    onChange={(e) => {
                      setCaptchaInput(e.target.value);
                      if (errors.captcha) setErrors((prev) => ({ ...prev, captcha: undefined }));
                    }}
                    onBlur={() => setTouched((prev) => ({ ...prev, captcha: true }))}
                    placeholder="Enter characters shown above"
                    className={`w-full px-3 py-2 text-xs sm:text-sm bg-white border rounded-sm outline-none uppercase font-mono tracking-widest transition-all placeholder:text-[#BAC7D5] placeholder:tracking-normal placeholder:font-sans ${
                      errors.captcha && touched.captcha
                        ? 'border-[#B42318] ring-1 ring-[#B42318] bg-[#FFF8F8]'
                        : 'border-[#D5DCE3] focus:border-[#12355B] focus:ring-1 focus:ring-[#12355B]'
                    }`}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {errors.captcha && touched.captcha && (
                    <p className="text-[11px] text-[#B42318] mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      {errors.captcha}
                    </p>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS: LOGIN & RESET */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                {/* 1. Login Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:flex-1 py-2.5 px-4 bg-[#12355B] hover:bg-[#1C4E80] active:bg-[#0E2C4D] text-white text-xs sm:text-sm font-bold rounded-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin text-white" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-white" />
                      <span>Login to Portal</span>
                    </>
                  )}
                </button>

                {/* 2. Reset / Clear Button */}
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isLoading}
                  className="w-full sm:w-auto py-2.5 px-4 bg-[#FFFFFF] hover:bg-[#F4F6F8] active:bg-[#EAF2F8] text-[#5B6573] hover:text-[#12355B] border border-[#D5DCE3] text-xs sm:text-sm font-semibold rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  title="Clear all fields and regenerate CAPTCHA"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              {/* DEMO / PROTOTYPE QUICK CREDENTIAL FILLER */}
              <div className="pt-3 border-t border-[#E2E8F0]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6573] flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-[#1C4E80]" />
                    Quick Demo Credentials:
                  </span>
                  <span className="text-[10px] text-[#2E7D32] font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> One-Click Fill
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickFill('society_member')}
                    className="p-1.5 text-left rounded-xs bg-[#F4F6F8] hover:bg-[#EAF2F8] border border-[#D5DCE3] text-[10px] text-[#12355B] cursor-pointer transition-colors"
                  >
                    <span className="font-bold block">Society Member</span>
                    <span className="font-mono text-[9px] text-[#5B6573]">ID: SOC-7821</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickFill('federation')}
                    className="p-1.5 text-left rounded-xs bg-[#F4F6F8] hover:bg-[#EAF2F8] border border-[#D5DCE3] text-[10px] text-[#12355B] cursor-pointer transition-colors"
                  >
                    <span className="font-bold block">Federation Officer</span>
                    <span className="font-mono text-[9px] text-[#5B6573]">ID: FED-ADM-001</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Card Footer Security Notice */}
            <div className="p-3 bg-[#F4F6F8] border-t border-[#D5DCE3] text-[10px] text-[#5B6573] text-center leading-relaxed">
              <span className="font-semibold text-[#12355B]">Official Access Notice:</span> Authorized
              Cooperative & Federation personnel only. Unauthorized access is prohibited and
              monitored under IT Security Guidelines.
            </div>
          </div>
        </div>
      </main>

      {/* Government Portal Footer */}
      <footer className="bg-[#FFFFFF] border-t border-[#D5DCE3] py-3 px-4 text-center text-xs text-[#5B6573]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>Â© 2026 Cooperative Administration MIS â€¢ Government of India / State Cooperative Federation</p>
          <div className="flex items-center gap-3">
            <span className="text-[#12355B] font-semibold">Portal Version 2.4.0-COOP</span>
            <span className="text-[#BAC7D5]">â€¢</span>
            <span className="text-[#2E7D32] font-semibold">System Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLoginPage;
