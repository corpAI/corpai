/* eslint-disable @next/next/no-img-element */
"use client"; // Ensure client-side rendering for this component
import { useEffect, useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useRouter } from 'next/navigation'; // Import Next.js router
import styles from './styles/Login.module.css'; // Import CSS module for styling
import config from './config';
import axiosInstance from './utils/axiosInstance';
import LoadingSpinner from './components/LoadingSpinner';
import Head from 'next/head';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const GOOGLE_CLIENT_ID = '273493204931-tqki4k6970n561cvmphnagj2cq0kkcov.apps.googleusercontent.com';

export default function Login() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter(); // Initialize the useRouter hook

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Show the spinner when the API call starts
    try {
      const response = await axiosInstance.post(`${config.backendHost}/auth/login`, {
        username,
        password,
      });
      const token = response.data.token;
      localStorage.setItem('token', token);
      router.push('/chat'); // Use Next.js router for navigation
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setLoading(false); // Hide the spinner when the API call is done
    }
  };

  useEffect(() => {
    document.title = 'Corp.AI';
  }, []);

  const responseGoogle = async (credentialResponse: any) => {
    setLoading(true); // Show the spinner when the API call starts
    try {
      const result = await axiosInstance.post(`${config.backendHost}/auth/google-login`, {
        token: credentialResponse.credential,
      });
      const token = result.data.token;
      localStorage.setItem('token', token);
      router.push('/chat'); // Use Next.js router for navigation
    } catch (err) {
      setError('Google login failed');
    } finally {
      setLoading(false); // Hide the spinner when the API call is done
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Head>
        <title>Corp.AI</title>
      </Head>
      <div className={styles.container}>
        <LoadingSpinner />
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
                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                  </span>
                </div>
                <a href="/forgot-password" className={styles.forgotPassword}>Forgot?</a>
              </div>

              {error && <p className={styles.errorMessage}>{error}</p>}

              <button type="submit" className={styles.loginButton} disabled={loading}>
                {loading ? 'Loading...' : 'Login now'}
              </button>
            </form>
            <br />
            <GoogleLogin
              onSuccess={responseGoogle}
              onError={() => setError('Google login failed')}
            />
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
