/* eslint-disable @next/next/no-img-element */
"use client"; // Ensure client-side rendering for this component
import { useState } from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation'; // Import Next.js router
import styles from './styles/Login.module.css';
const GOOGLE_CLIENT_ID='273493204931-tqki4k6970n561cvmphnagj2cq0kkcov.apps.googleusercontent.com'

export default function Login() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter(); // Initialize the useRouter hook

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', {
        username,
        password,
      });
      console.log('Login successful:', response.data.token);
      const token = response.data.token;
      localStorage.setItem('token', token);
      router.push('/chat'); // Use Next.js router for navigation
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  const responseGoogle = async (credentialResponse: any) => {
    try {
      const result = await axios.post('http://localhost:5000/auth/google-login', {
        token: credentialResponse.credential,
      });
      const token = result.data.token;
      localStorage.setItem('token', token);
      router.push('/chat'); // Use Next.js router for navigation
      console.log('Google Login successful:', result.data.token);
    } catch (err) {
      setError('Google login failed');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className={styles.container}>
        <div className={styles.leftPane}>
          <div className={styles.logo}>CORP.AI</div>
          <div className={styles.welcomeText}>
            <p>Unlock the Enterprise Data potential with AI!</p>
          </div>
        </div>
        <div className={styles.rightPane}>
          <div className={styles.formWrapper}>
            <h2 className={styles.formTitle}>Login to your account</h2>

            <form onSubmit={handleLogin}>
              <div className={styles.inputGroup}>
                <label>Email</label>
                <input
                  type="text"
                  placeholder="yourmail@gmail.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={styles.inputField}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.inputField}
                  />
                  <span
                    className={styles.showPasswordIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>
                <a href="/forgot-password" className={styles.forgotPassword}>Forgot?</a>
              </div>

              {error && <p className={styles.errorMessage}>{error}</p>}

              <button type="submit" className={styles.loginButton}>Login now</button>
            </form>
    <br/>
            <GoogleLogin
              onSuccess={responseGoogle}
              onError={() => setError('Google login failed')}
              render={(renderProps) => (
                <button
                  onClick={renderProps.onClick}
                  className={styles.googleButton}
                >
                  <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    alt="Google logo"
                    className={styles.googleIcon}
                  />
                  Continue with Google
                </button>
              )}
            />

          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
