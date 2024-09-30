'use client'; // Ensure this is a client-side component

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import styles from '../styles/Configurations.module.css'; // Updated stylesheet
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'; // Import icons

const Configurations = () => {
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [configName, setConfigName] = useState<string>(''); // Config name
  const [s3Bucket, setS3Bucket] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [accessKeyId, setAccessKeyId] = useState<string>('');
  const [secretAccessKey, setSecretAccessKey] = useState<string>('');
  const [gcpProjectId, setGcpProjectId] = useState<string>('');
  const [gcpCredentials, setGcpCredentials] = useState<string>('');
  const [oneDriveClientId, setOneDriveClientId] = useState<string>('');
  const [oneDriveClientSecret, setOneDriveClientSecret] = useState<string>('');
  const [boxClientId, setBoxClientId] = useState<string>('');
  const [boxClientSecret, setBoxClientSecret] = useState<string>('');
  const [dropboxAccessToken, setDropboxAccessToken] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('s3'); // Default to s3 bucket
  const [showSecret, setShowSecret] = useState<{ [key: number]: boolean }>({});
  const [editIndex, setEditIndex] = useState<number | null>(null); // Index of the configuration being edited
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
        const response = await axios.get(
          'http://localhost:5000/configurations',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
    const configData: any = {
      provider: selectedProvider,
      config_name: configName,
    };

    // Collect data based on selected provider
    if (selectedProvider === 's3') {
      configData.s3Bucket = s3Bucket;
      configData.region = region;
      configData.accessKeyId = accessKeyId;
      configData.secretAccessKey = secretAccessKey;
    } else if (selectedProvider === 'gcp') {
      configData.gcpProjectId = gcpProjectId;
      configData.gcpCredentials = gcpCredentials;
    } else if (selectedProvider === 'onedrive') {
      configData.oneDriveClientId = oneDriveClientId;
      configData.oneDriveClientSecret = oneDriveClientSecret;
    } else if (selectedProvider === 'box') {
      configData.boxClientId = boxClientId;
      configData.boxClientSecret = boxClientSecret;
    } else if (selectedProvider === 'dropbox') {
      configData.dropboxAccessToken = dropboxAccessToken;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/configurations',
        configData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConfigurations([...configurations, configData]); // Update with the data sent
      // Clear fields after adding configuration
      setConfigName('');
      setS3Bucket('');
      setRegion('');
      setAccessKeyId('');
      setSecretAccessKey('');
      setGcpProjectId('');
      setGcpCredentials('');
      setOneDriveClientId('');
      setOneDriveClientSecret('');
      setBoxClientId('');
      setBoxClientSecret('');
      setDropboxAccessToken('');
      setError(null); // Clear any previous errors
    } catch (err) {
      setError('Failed to add configuration');
    }
  };

  const deleteConfiguration = async (config: any, index: number) => {
    const token = localStorage.getItem('token');
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${config.config_name}?`
    );
    if (!confirmDelete) return;
    try {
      await axios.delete(
        `http://localhost:5000/configurations/${config.provider}/${config.config_name}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedConfigs = configurations.filter((_, i) => i !== index);
      setConfigurations(updatedConfigs);
    } catch (err) {
      setError('Failed to delete configuration');
    }
  };

  const saveConfiguration = async (config: any, index: number) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `http://localhost:5000/configurations/${config.provider}/${config.config_name}`,
        config,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update the configurations state
      const updatedConfigs = [...configurations];
      updatedConfigs[index] = config;
      setConfigurations(updatedConfigs);
      setEditIndex(null); // Exit edit mode
    } catch (err) {
      setError('Failed to update configuration');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.gridContainer}>
      {/* Left-Hand Side (LHS) - Form to Add Configurations */}
      <div className={styles.lhs}>
        <h2 className={styles.formTitle}>Add New Configuration</h2>

        {/* Cloud Provider Switch */}
        <div className={styles.providerSwitch}>
          <label>Cloud Provider:</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className={styles.providerSelect}
          >
            <option value="s3">S3 Bucket</option>
            <option value="gcp">Google Cloud Platform</option>
            <option value="onedrive">OneDrive</option>
            <option value="box">Box</option>
            <option value="dropbox">Dropbox</option>
          </select>
        </div>

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            addConfiguration();
          }}
        >
          <div className={styles.inputGroup}>
            <label>Configuration Name:</label>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              className={styles.inputField}
              placeholder="Enter a unique configuration name"
              required
            />
          </div>

          {/* Conditionally Render Fields Based on Selected Provider */}
          {selectedProvider === 's3' && (
            <>
              <div className={styles.inputGroup}>
                <label>S3 Bucket:</label>
                <input
                  type="text"
                  value={s3Bucket}
                  onChange={(e) => setS3Bucket(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter your S3 bucket name"
                  required
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
                  required
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
                  required
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
                  required
                />
              </div>
            </>
          )}

          {selectedProvider === 'gcp' && (
            <>
              <div className={styles.inputGroup}>
                <label>GCP Project ID:</label>
                <input
                  type="text"
                  value={gcpProjectId}
                  onChange={(e) => setGcpProjectId(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter GCP Project ID"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>GCP Credentials:</label>
                <input
                  type="text"
                  value={gcpCredentials}
                  onChange={(e) => setGcpCredentials(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter GCP Credentials"
                  required
                />
              </div>
            </>
          )}

          {selectedProvider === 'onedrive' && (
            <>
              <div className={styles.inputGroup}>
                <label>OneDrive Client ID:</label>
                <input
                  type="text"
                  value={oneDriveClientId}
                  onChange={(e) => setOneDriveClientId(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter OneDrive Client ID"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>OneDrive Client Secret:</label>
                <input
                  type="password"
                  value={oneDriveClientSecret}
                  onChange={(e) => setOneDriveClientSecret(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter OneDrive Client Secret"
                  required
                />
              </div>
            </>
          )}

          {selectedProvider === 'box' && (
            <>
              <div className={styles.inputGroup}>
                <label>Box Client ID:</label>
                <input
                  type="text"
                  value={boxClientId}
                  onChange={(e) => setBoxClientId(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter Box Client ID"
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Box Client Secret:</label>
                <input
                  type="password"
                  value={boxClientSecret}
                  onChange={(e) => setBoxClientSecret(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter Box Client Secret"
                  required
                />
              </div>
            </>
          )}

          {selectedProvider === 'dropbox' && (
            <>
              <div className={styles.inputGroup}>
                <label>Dropbox Access Token:</label>
                <input
                  type="text"
                  value={dropboxAccessToken}
                  onChange={(e) => setDropboxAccessToken(e.target.value)}
                  className={styles.inputField}
                  placeholder="Enter Dropbox Access Token"
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className={styles.submitButton}>
            Add Configuration
          </button>
        </form>
      </div>

      {/* Right-Hand Side (RHS) - Display Configurations */}
      <div className={styles.rhs}>
        <h2 className={styles.formTitle}>Manage Your Configurations</h2>

        {configurations.length > 0 ? (
          <div className={styles.configGrid}>
            {configurations.map((config, index) => (
              <div key={index} className={styles.configItem}>
                <div className={styles.configHeader}>
                  <p>
                    <strong>{config.config_name}</strong>
                  </p>
                  <div className={styles.configActions}>
                    {editIndex === index ? (
                      <>
                        <FaSave
                          className={styles.icon}
                          onClick={() => saveConfiguration(config, index)}
                        />
                        <FaTimes
                          className={styles.icon}
                          onClick={() => setEditIndex(null)}
                        />
                      </>
                    ) : (
                      <>
                        <FaEdit
                          className={styles.icon}
                          onClick={() => setEditIndex(index)}
                        />
                        <FaTrash
                          className={styles.icon}
                          onClick={() => deleteConfiguration(config, index)}
                        />
                      </>
                    )}
                  </div>
                </div>
                <p>
                  <strong>Provider:</strong> {config.provider}
                </p>
                {/* Render provider-specific details */}
                {editIndex === index ? (
                  <>
                    {config.provider === 's3' && (
                      <>
                        <div className={styles.inputGroup}>
                          <label>S3 Bucket:</label>
                          <input
                            type="text"
                            value={config.s3Bucket}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].s3Bucket = e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Region:</label>
                          <input
                            type="text"
                            value={config.region}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].region = e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Access Key ID:</label>
                          <input
                            type="text"
                            value={config.accessKeyId}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].accessKeyId =
                                e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Secret Access Key:</label>
                          <input
                            type="password"
                            value={config.secretAccessKey}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].secretAccessKey =
                                e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                      </>
                    )}
                    {config.provider === 'gcp' && (
                      <>
                        <div className={styles.inputGroup}>
                          <label>GCP Project ID:</label>
                          <input
                            type="text"
                            value={config.gcpProjectId}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].gcpProjectId =
                                e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>GCP Credentials:</label>
                          <input
                            type="text"
                            value={config.gcpCredentials}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].gcpCredentials =
                                e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                      </>
                    )}
                    {config.provider === 'onedrive' && (
                      <>
                        <div className={styles.inputGroup}>
                          <label>OneDrive Client ID:</label>
                          <input
                            type="text"
                            value={config.oneDriveClientId}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].oneDriveClientId =
                                e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>OneDrive Client Secret:</label>
                          <input
                            type="password"
                            value={config.oneDriveClientSecret}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].oneDriveClientSecret =
                                e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                      </>
                    )}
                    {config.provider === 'box' && (
                      <>
                        <div className={styles.inputGroup}>
                          <label>Box Client ID:</label>
                          <input
                            type="text"
                            value={config.boxClientId}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].boxClientId =
                                e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                        <div className={styles.inputGroup}>
                          <label>Box Client Secret:</label>
                          <input
                            type="password"
                            value={config.boxClientSecret}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].boxClientSecret =
                                e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                      </>
                    )}
                    {config.provider === 'dropbox' && (
                      <>
                        <div className={styles.inputGroup}>
                          <label>Dropbox Access Token:</label>
                          <input
                            type="text"
                            value={config.dropboxAccessToken}
                            onChange={(e) => {
                              const updatedConfigs = [...configurations];
                              updatedConfigs[index].dropboxAccessToken =
                                e.target.value;
                              setConfigurations(updatedConfigs);
                            }}
                            className={styles.inputField}
                          />
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {/* Render non-editable values */}
                    {config.provider === 's3' && (
                      <>
                        <p>
                          <strong>S3 Bucket:</strong> {config.s3Bucket}
                        </p>
                        <p>
                          <strong>Region:</strong> {config.region}
                        </p>
                        <p>
                          <strong>Access Key ID:</strong> {config.accessKeyId}
                        </p>
                        <p>
                          <strong>Secret Access Key:</strong>{' '}
                          {showSecret[index]
                            ? config.secretAccessKey
                            : '******'}
                          <button
                            onClick={() =>
                              setShowSecret((prev) => ({
                                ...prev,
                                [index]: !prev[index],
                              }))
                            }
                            className={styles.eyeButton}
                          >
                            {showSecret[index] ? 'Hide' : 'Show'}
                          </button>
                        </p>
                      </>
                    )}
                    {config.provider === 'gcp' && (
                      <>
                        <p>
                          <strong>GCP Project ID:</strong> {config.gcpProjectId}
                        </p>
                        <p>
                          <strong>GCP Credentials:</strong>{' '}
                          {showSecret[index] ? config.gcpCredentials : '******'}
                          <button
                            onClick={() =>
                              setShowSecret((prev) => ({
                                ...prev,
                                [index]: !prev[index],
                              }))
                            }
                            className={styles.eyeButton}
                          >
                            {showSecret[index] ? 'Hide' : 'Show'}
                          </button>
                        </p>
                      </>
                    )}
                    {config.provider === 'onedrive' && (
                      <>
                        <p>
                          <strong>OneDrive Client ID:</strong>{' '}
                          {config.oneDriveClientId}
                        </p>
                        <p>
                          <strong>OneDrive Client Secret:</strong>{' '}
                          {showSecret[index]
                            ? config.oneDriveClientSecret
                            : '******'}
                          <button
                            onClick={() =>
                              setShowSecret((prev) => ({
                                ...prev,
                                [index]: !prev[index],
                              }))
                            }
                            className={styles.eyeButton}
                          >
                            {showSecret[index] ? 'Hide' : 'Show'}
                          </button>
                        </p>
                      </>
                    )}
                    {config.provider === 'box' && (
                      <>
                        <p>
                          <strong>Box Client ID:</strong> {config.boxClientId}
                        </p>
                        <p>
                          <strong>Box Client Secret:</strong>{' '}
                          {showSecret[index]
                            ? config.boxClientSecret
                            : '******'}
                          <button
                            onClick={() =>
                              setShowSecret((prev) => ({
                                ...prev,
                                [index]: !prev[index],
                              }))
                            }
                            className={styles.eyeButton}
                          >
                            {showSecret[index] ? 'Hide' : 'Show'}
                          </button>
                        </p>
                      </>
                    )}
                    {config.provider === 'dropbox' && (
                      <>
                        <p>
                          <strong>Dropbox Access Token:</strong>{' '}
                          {showSecret[index]
                            ? config.dropboxAccessToken
                            : '******'}
                          <button
                            onClick={() =>
                              setShowSecret((prev) => ({
                                ...prev,
                                [index]: !prev[index],
                              }))
                            }
                            className={styles.eyeButton}
                          >
                            {showSecret[index] ? 'Hide' : 'Show'}
                          </button>
                        </p>
                      </>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No configurations found.</p>
        )}
      </div>
    </div>
  );
};

export default Configurations;
