"use client";

import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import styles from '../styles/chat.module.css';  // Import the external CSS

interface Message {
  user: string;
  bot: string;
}

const ChatPage: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [bucketName, setBucketName] = useState<string>('');
  const [fileKeys, setFileKeys] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!inputText || !bucketName || !fileKeys) {
      setError('Please fill in all fields!');
      return;
    }

    const fileKeysArray = fileKeys.split(',').map((key) => key.trim());

    try {
      const response = await axios.post('http://localhost:5000/bedrock/query_with_multiple_files', {
        input_text: inputText,
        bucket_name: bucketName,
        file_keys: fileKeysArray,
      });

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
    <div className={styles['chat-container']}>
      <h2>Bedrock Chat Interface</h2>

      {/* Corrected Link without <a> tag */}
      <Link href="/configurations" className={styles.link}>
        Go to Configurations
      </Link>

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
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your query..."
            className={styles['input-text']}
          />
          <input
            type="text"
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            placeholder="Enter S3 bucket name..."
            className={styles['input-text']}
          />
          <input
            type="text"
            value={fileKeys}
            onChange={(e) => setFileKeys(e.target.value)}
            placeholder="Enter file keys (comma-separated)..."
            className={styles['input-text']}
          />
          <button type="submit" className={styles['submit-button']}>
            Send
          </button>
        </form>
        {error && <p className={styles['error-message']}>{error}</p>}
      </div>
    </div>
  );
};

export default ChatPage;
