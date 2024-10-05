'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/VerticalNavbar.module.css'; // Import the external CSS
import { FaBars } from 'react-icons/fa'; // Import an icon for the collapse button

const VerticalNavbar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // const toggleNavbar = () => {
  //   setIsCollapsed(!isCollapsed);
  // };

  const handleLogout = () => {
    // Removing the JWT token from localStorage
    localStorage.removeItem('token');
  };

  return (
    <>
      <div
        className={`${styles['navbar']} ${
          isCollapsed ? styles['collapsed'] : ''
        }`}
      >
        <h1 className={styles['logo']}>
          <i>CORP.AI</i>
        </h1>
        {/* <button onClick={toggleNavbar} className={styles['collapse-button']}>
          <FaBars />
        </button> */}
        <ul className={styles['nav-list']}>
          <li>
            <Link href="/configurations" className={styles['nav-link']}>
              Configurations
            </Link>
          </li>
          <li>
            <Link href="/chat" className={styles['nav-link']}>
              Chat
            </Link>
          </li>
          <li>
            <Link
              href="/"
              className={styles['nav-link']}
              onClick={handleLogout}
            >
              Logout
            </Link>
          </li>
          {/* Add more routes as needed */}
        </ul>
      </div>
    </>
  );
};

export default VerticalNavbar;
