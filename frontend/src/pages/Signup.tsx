import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ValidationState {
  email: { valid: boolean; message: string };
  username: { valid: boolean; message: string };
  password: { valid: boolean; message: string };
  confirmPassword: { valid: boolean; message: string };
}

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validation, setValidation] = useState<ValidationState>({
    email: { valid: false, message: '' },
    username: { valid: false, message: '' },
    password: { valid: false, message: '' },
    confirmPassword: { valid: false, message: '' },
  });

  const { signup, isAuthenticated } = useAuth();

  // Email validation
  useEffect(() => {
    if (!email) {
      setValidation(prev => ({ ...prev, email: { valid: false, message: '' } }));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    setValidation(prev => ({
      ...prev,
      email: {
        valid: isValid,
        message: isValid ? 'Valid email' : 'Invalid email format',
      },
    }));
  }, [email]);

  // Username validation
  useEffect(() => {
    if (!username) {
      setValidation(prev => ({ ...prev, username: { valid: false, message: '' } }));
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
    const isValid = usernameRegex.test(username);
    setValidation(prev => ({
      ...prev,
      username: {
        valid: isValid,
        message: isValid
          ? 'Valid username'
          : 'Username must be 3-50 characters (alphanumeric & underscore)',
      },
    }));
  }, [username]);

  // Password strength validation
  useEffect(() => {
    if (!password) {
      setValidation(prev => ({ ...prev, password: { valid: false, message: '' } }));
      return;
    }
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [minLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    let message = '';
    let valid = minLength;
    
    if (strength < 2) {
      message = 'Weak password';
    } else if (strength < 4) {
      message = 'Medium password';
    } else {
      message = 'Strong password';
      valid = true;
    }

    setValidation(prev => ({ ...prev, password: { valid, message } }));
  }, [password]);

  // Confirm password validation
  useEffect(() => {
    if (!confirmPassword) {
      setValidation(prev => ({ ...prev, confirmPassword: { valid: false, message: '' } }));
      return;
    }
    const isValid = password === confirmPassword;
    setValidation(prev => ({
      ...prev,
      confirmPassword: {
        valid: isValid,
        message: isValid ? 'Passwords match' : 'Passwords do not match',
      },
    }));
  }, [password, confirmPassword]);

  const getPasswordStrength = () => {
    if (!password) return 0;
    const checks = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ].filter(Boolean).length;
    return (checks / 5) * 100;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength < 40) return 'bg-red-500';
    if (strength < 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validation.email.valid || !validation.username.valid || 
        !validation.password.valid || !validation.confirmPassword.valid) {
      setError('Please fix validation errors before submitting');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signup({
        email,
        username,
        full_name: fullName,
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const ValidationIcon: React.FC<{ valid: boolean; show: boolean }> = ({ valid, show }) => {
    if (!show) return null;
    return valid ? (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  };

  // Redirect if already authenticated (after all hooks)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="glass-card w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Sign up to get started</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pr-10"
                placeholder="Enter your email"
                disabled={loading}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ValidationIcon valid={validation.email.valid} show={email.length > 0} />
              </div>
            </div>
            {email && validation.email.message && (
              <p className={`text-xs mt-1 ${validation.email.valid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.email.message}
              </p>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field pr-10"
                placeholder="Enter your username"
                disabled={loading}
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <ValidationIcon valid={validation.username.valid} show={username.length > 0} />
              </div>
            </div>
            {username && validation.username.message && (
              <p className={`text-xs mt-1 ${validation.username.valid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.username.message}
              </p>
            )}
          </div>

          {/* Full Name Field */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Enter your password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {password && (
              <>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Password Strength</span>
                    <span className={validation.password.valid ? 'text-green-600' : 'text-red-600'}>
                      {validation.password.message}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${getPasswordStrength()}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Minimum 8 characters. Include uppercase, lowercase, numbers, and special characters.
                </p>
              </>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Confirm your password"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {confirmPassword && validation.confirmPassword.message && (
              <p className={`text-xs mt-1 ${validation.confirmPassword.valid ? 'text-green-600' : 'text-red-600'}`}>
                {validation.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-6"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="spinner w-4 h-4 mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;