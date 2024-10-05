'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/'); 
    }
  }, [router]);

  return <>{children}</>;
};

export default AuthWrapper;
