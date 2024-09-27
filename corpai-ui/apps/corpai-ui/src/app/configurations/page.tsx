"use client"; // Ensure this is a client-side component

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from '../styles/Login.module.css';

const Configurations = () => {
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [s3Bucket, setS3Bucket] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [accessKeyId, setAccessKeyId] = useState<string>('');
  const [secretAccessKey, setSecretAccessKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Use Next.js router for navigation

  useEffect(() => {
    const fetchConfigurations = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/'); // Redirect to login if no token is found
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/configurations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConfigurations(response.data);
      } catch (err) {
        setError('Failed to fetch configurations');
      } finally {
        setLoading(false);
      }
    };
    fetchConfigurations();
  }, [router]);

  const addConfiguration = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        'http://localhost:5000/configurations',
        { s3Bucket, region, accessKeyId, secretAccessKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConfigurations([...configurations, response.data]);
      setS3Bucket('');
      setRegion('');
      setAccessKeyId('');
      setSecretAccessKey('');
    } catch (err) {
      setError('Failed to add configuration');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h2 className={styles.formTitle}>Manage Your Configurations</h2>

        {configurations.length > 0 ? (
          <ul className={styles.configList}>
            {configurations.map((config, index) => (
              <li key={index} className={styles.configItem}>
                <p><strong>S3 Bucket:</strong> {config.s3Bucket}</p>
                <p><strong>Region:</strong> {config.region}</p>
                <p><strong>Access Key ID:</strong> {config.accessKeyId}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No configurations found.</p>
        )}

        <h3 className={styles.formTitle}>Add New Configuration</h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addConfiguration();
          }}
        >
          <div className={styles.inputGroup}>
            <label>S3 Bucket:</label>
            <input
              type="text"
              value={s3Bucket}
              onChange={(e) => setS3Bucket(e.target.value)}
              className={styles.inputField}
              placeholder="Enter your S3 bucket name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Region:</label>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={styles.inputField}
              placeholder="Enter AWS region"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Access Key ID:</label>
            <input
              type="text"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              className={styles.inputField}
              placeholder="Enter AWS Access Key ID"
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Secret Access Key:</label>
            <input
              type="password"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              className={styles.inputField}
              placeholder="Enter AWS Secret Access Key"
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.loginButton}>
            Add Configuration
          </button>
        </form>
      </div>
    </div>
  );
};

export default Configurations;
