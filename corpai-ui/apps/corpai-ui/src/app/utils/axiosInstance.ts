import axios from 'axios';
import config from '../config';

let isLoading = false;
const setLoading = (value: boolean) => {
  isLoading = value;
  if (typeof window !== 'undefined' && window.setLoadingSpinner) {
    window.setLoadingSpinner(value);
  }
};

const axiosInstance = axios.create({
  baseURL: config.backendHost, // Getting host from the config file making it centralised
});

// Add a request interceptor to show the loading spinner
axiosInstance.interceptors.request.use(
  (config: any) => {
    setLoading(true);
    return config;
  },
  (error: any) => {
    setLoading(false);
    return Promise.reject(error);
  }
);

// Add a response interceptor to hide the loading spinner
axiosInstance.interceptors.response.use(
  (response: any) => {
    setLoading(false);
    return response;
  },
  (error: { response: { status: number; }; }) => {
    setLoading(false);
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
