'use client';
import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import VerticalNavbar from '../components/VerticalNavbar';
import styles from '../styles/Chat.module.css';
import config from '../config';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthWrapper from '../utils/authWrapper';
import Head from 'next/head';

interface Configuration {
  config_name: string;
  provider: string;
  s3Bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

interface Message {
  user: string;
  bot: string;
}

const ChatPage: React.FC = () => {
  const [configurations, setConfigurations] = useState<Configuration[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null);
  const [inputText, setInputText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Chat - Corp.AI';
  }, []);

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const response = await axiosInstance.get(
          config.backendHost + '/configurations',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setConfigurations(response.data);
      } catch (err) {
        setError('Failed to fetch configurations.');
      }
    };

    fetchConfigurations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inputText || !selectedConfig) {
      setError('Please fill in all required fields!');
      return;
    }

    const selectedConfiguration = configurations.find(
      (config) => config.config_name === selectedConfig
    );

    if (!selectedConfiguration) {
      setError('Invalid configuration selected.');
      return;
    }

    try {
      const response = await axiosInstance.post(
        config.backendHost + '/bedrock/query_with_multiple_files',
        {
          input_text: inputText,
          bucket_name: selectedConfiguration.s3Bucket,
          file_keys: null,
        }
      );

      setMessages((prevMessages) => [
        ...prevMessages,
        { user: inputText, bot: response.data.bedrock_output },
      ]);

      setInputText('');
    } catch (error) {
      setError('Error fetching response from the server.');
      console.error('Error fetching response:', error);
    }
  };

  return (
    <AuthWrapper>
      <Head>
        <title>Chat - Corp.AI</title>
      </Head>
      <div className={styles['chat-page']}>
        <LoadingSpinner />
        <VerticalNavbar />
        <div className={styles['chat-container']}>
          <div className={styles['chat-window']}>
            <div className={styles['messages']}>
              {messages.map((msg, index) => (
                <div key={index} className={styles['message']}>
                  <div className={styles['user-message']}>
                    <strong>You:</strong> {msg.user}
                  </div>
                  <div className={styles['bot-message']}>
                    <strong>Bot:</strong> {msg.bot}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleSubmit} className={styles['chat-form']}>
              <select
                value={selectedConfig || ''}
                onChange={(e) => setSelectedConfig(e.target.value)}
                className={styles['input-select']}
                required
              >
                <option value="" disabled>
                  Select Configuration
                </option>
                {configurations.map((config, index) => (
                  <option key={index} value={config.config_name}>
                    {config.config_name} ({config.provider})
                  </option>
                ))}
              </select>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your query..."
                className={styles['input-textarea']}
                required
              />
              <button type="submit" className={styles['submit-button']}>
                Send
              </button>
            </form>
            {error && <p className={styles['error-message']}>{error}</p>}
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
};

export default ChatPage;
