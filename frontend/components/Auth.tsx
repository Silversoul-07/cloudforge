'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, Image, Moon, Sun, AtSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Cookies from 'js-cookie';
import { useTheme } from 'next-themes'
import { autheticateUser, createUser } from '@/lib/api';

interface AuthPageProps {
  mode: 'login' | 'signup';
}

interface FormData {
  name: string;
  username: string;
  password: string;
  image: File | null;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode = 'login' }) => {
  const isLogin = mode === 'login';
  const [formData, setFormData] = useState<FormData>({
    name: '',
    username: '',
    password: '',
    image: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, image: file }));
  };


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

      if (isLogin) {
        try{
        const { access_token, user } = await autheticateUser(formData.username, formData.password);
        // localStorage.setItem('user', JSON.stringify(user));
        Cookies.set('token', `${access_token}`, { expires: 30 });
        Cookies.set('username', user.username, { expires: 30 });
        setSuccess('Login successful!');
        setTimeout(() => router.push('/'), 2000);
        } catch (err) {
          setError('Login failed. Please try again.');
        } finally {
          setIsLoading(false);
        }
      } else {
        try{
          const data = new FormData();
          Object.keys(formData).forEach((key) => {
            if (formData[key as keyof FormData] !== null) {
              data.append(key, formData[key as keyof FormData]);
            }
          });
          await createUser(data);
          setSuccess('Signup successful!');
          setTimeout(() => router.push('/login'), 2000);
        }catch (err) {
          setError('Signup failed. Please try again.');
        }finally {
          setIsLoading(false);
        }
    } 
    
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6 text-gray-900 dark:text-white"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="font-bold text-xl text-gray-900 dark:text-white">Artverse</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="rounded-full"
        >
          <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 sm:my-10">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                    Name
                  </Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      className="pl-10 w-full"
                      placeholder="john doe"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">
                  Username
                </Label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AtSign className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="pl-10 w-full"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Rest of the form fields with similar dark mode classes */}
              <div>
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                  Password
                </Label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    className="pl-10 pr-10 block w-full sm:text-sm"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              {!isLogin && (
                <div>
                  <Label htmlFor="profile-picture" className="text-gray-700 dark:text-gray-300">
                    Profile Picture
                  </Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Image className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          id="profile-picture"
                          name="image"
                          type="file"
                          accept="image/*"
                          className="pl-10 block w-full sm:text-sm"
                          onChange={handleImageChange}
                        />
                      </div>
                    </div>
                    {formData.image && (
                      <div className="mt-2">
                        <p className="text-gray-700 dark:text-gray-300">
                          Selected: {formData.image.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <a href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Sign up
                    </a>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Login here
                    </a>
                  </>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (isLogin ? 'Signing in...' : 'Signing up...') : isLogin ? 'Sign in' : 'Sign up'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;