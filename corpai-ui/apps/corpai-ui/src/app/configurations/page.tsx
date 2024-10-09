"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../styles/Configurations.module.css'; // Updated stylesheet
import { FaSave, FaTrash } from 'react-icons/fa'; // Import save and delete icons
import config from '../config';
import VerticalNavbar from '../components/VerticalNavbar';
import axiosInstance from '../utils/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthWrapper from '../utils/authWrapper';
import Head from 'next/head';
import { AgGridReact } from 'ag-grid-react'; // Import AG Grid
import 'ag-grid-community/styles/ag-grid.css'; // Core grid CSS
import 'ag-grid-community/styles/ag-theme-alpine.css'; // Theme CSS

const Configurations = () => {
  const [configurations, setConfigurations] = useState<any[]>([]);
  const [configName, setConfigName] = useState<string>('');
  const [providerSpecificData, setProviderSpecificData] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('s3');
  const router = useRouter();

  useEffect(() => {
    document.title = 'Configurations - Corp.AI';
  }, []);

  useEffect(() => {
    const fetchConfigurations = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }
      try {
        const response = await axiosInstance.get(`${config.backendHost}/configurations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConfigurations(response.data);
      } catch (err) {
        setError('Failed to fetch configurations');
      }
    };
    fetchConfigurations();
  }, [router]);

  const addConfiguration = async () => {
    const token = localStorage.getItem('token');
    const configData: any = {
      provider: selectedProvider,
      config_name: configName,
      ...providerSpecificData,
    };

    try {
      const response = await axiosInstance.post(`${config.backendHost}/configurations`, configData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfigurations([...configurations, response.data]);
      setConfigName('');
      setProviderSpecificData({});
      setError(null);
    } catch (err) {
      setError('Failed to add configuration');
    }
  };

  const deleteConfiguration = async (config: any) => {
    const token = localStorage.getItem('token');
    const confirmDelete = window.confirm(`Are you sure you want to delete ${config.config_name}?`);
    if (!confirmDelete) return;
    try {
      await axiosInstance.delete(`${config.backendHost}/configurations/${config.provider}/${config.config_name}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfigurations(configurations.filter((c) => c.config_name !== config.config_name));
    } catch (err) {
      setError('Failed to delete configuration');
    }
  };

  const saveConfiguration = async (config: any) => {
    const token = localStorage.getItem('token');
    try {
      await axiosInstance.put(`${config.backendHost}/configurations/${config.provider}/${config.config_name}`, config, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      setError('Failed to update configuration');
    }
  };

  const getColumnDefs = () => {
    if (configurations.length === 0) return [];

    const keys = Object.keys(configurations[0]);
    const columns = keys.map((key) => {
      if (key === 'config_name' || key === 'provider') {
        return { headerName: key.replace('_', ' ').toUpperCase(), field: key, editable: false, flex: 1 };
      } else if (key.toLowerCase().includes('secret') || key.toLowerCase().includes('key')) {
        return {
          headerName: key.replace('_', ' ').toUpperCase(),
          field: key,
          editable: false,
          flex: 1,
          cellRendererFramework: (params: any) => (
            <div
              className={styles.hiddenSecret}
              onClick={() => {
                params.eGridCell.querySelector('.secretText').style.display = 'none';
                params.eGridCell.querySelector('.secretReveal').style.display = 'inline';
              }}
              onMouseLeave={() => {
                params.eGridCell.querySelector('.secretText').style.display = 'inline';
                params.eGridCell.querySelector('.secretReveal').style.display = 'none';
              }}
            >
              <span className="secretText">{'******'}</span>
              <span className="secretReveal" style={{ display: 'none' }}>{params.value}</span>
            </div>
          ),
        };
      } else {
        return { headerName: key.replace('_', ' ').toUpperCase(), field: key, editable: true, flex: 1 };
      }
    });

    // Add Actions column, testing
    columns.push({
      headerName: 'Actions',
      cellRendererFramework: (params: any) => (
        <div className={styles.configActions}>
          <FaSave className={styles.iconSave} onClick={() => saveConfiguration(params.data)} />
          <FaTrash className={styles.iconDelete} onClick={() => deleteConfiguration(params.data)} />
        </div>
      ),
      flex: 1,
      field: '',
      editable: false
    });

    return columns;
  };

  return (
    <AuthWrapper>
      <Head>
        <title>Configurations - Corp.AI</title>
      </Head>
      <div className={styles.gridContainer}>
        <LoadingSpinner />
        <VerticalNavbar />
        <div className={styles.lhs}>
          <h2 className={styles.formTitle}>Add New Configuration</h2>
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
                    value={providerSpecificData.s3Bucket || ''}
                    onChange={(e) =>
                      setProviderSpecificData((prev: any) => ({ ...prev, s3Bucket: e.target.value }))
                    }
                    className={styles.inputField}
                    placeholder="Enter your S3 bucket name"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Region:</label>
                  <input
                    type="text"
                    value={providerSpecificData.region || ''}
                    onChange={(e) =>
                      setProviderSpecificData((prev: any) => ({ ...prev, region: e.target.value }))
                    }
                    className={styles.inputField}
                    placeholder="Enter AWS region"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Access Key ID:</label>
                  <input
                    type="text"
                    value={providerSpecificData.accessKeyId || ''}
                    onChange={(e) =>
                      setProviderSpecificData((prev: any) => ({ ...prev, accessKeyId: e.target.value }))
                    }
                    className={styles.inputField}
                    placeholder="Enter AWS Access Key ID"
                    required
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label>Secret Access Key:</label>
                  <input
                    type="password"
                    value={providerSpecificData.secretAccessKey || ''}
                    onChange={(e) =>
                      setProviderSpecificData((prev: any) => ({ ...prev, secretAccessKey: e.target.value }))
                    }
                    className={styles.inputField}
                    placeholder="Enter AWS Secret Access Key"
                    required
                  />
                </div>
              </>
            )}
            {/* Render other provider-specific fields similarly */}
            <button type="submit" className={styles.submitButton}>
              Add Configuration
            </button>
          </form>
        </div>

        <div className={styles.rhs}>
          <h2 className={styles.formTitle}>Manage Your Configurations</h2>
          <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
            <AgGridReact
              rowData={configurations}
              columnDefs={getColumnDefs()}
              defaultColDef={{
                sortable: true,
                filter: true,
                flex: 1,
                resizable: true,
              }}
            />
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default Configurations;

