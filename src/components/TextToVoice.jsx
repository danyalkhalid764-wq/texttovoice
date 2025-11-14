import { useState, useEffect } from 'react';
import { api } from '../api';
import './TextToVoice.css';

export default function TextToVoice({ user }) {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await api.getHistory();
      if (response.history) {
        setHistory(response.history);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleTextToVoice = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Save to backend
      await api.textToVoice(text);
      
      // Use Web Speech API for text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configure voice settings
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          loadHistory();
        };

        utterance.onerror = (event) => {
          setIsSpeaking(false);
          setError('Error occurred while speaking');
          console.error('Speech synthesis error:', event);
        };

        window.speechSynthesis.speak(utterance);
      } else {
        setError('Your browser does not support text-to-speech');
      }
    } catch (err) {
      setError('Failed to convert text to voice. Please try again.');
      console.error('Text to voice error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakFromHistory = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        setError('Error occurred while speaking');
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="text-to-voice-container">
      <div className="header-section">
        <h1>🎤 Text to Voice</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button 
            className="logout-btn" 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="main-card">
        <div className="input-section">
          <label htmlFor="text-input">Enter text to convert to voice:</label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your text here..."
            rows="6"
            disabled={isSpeaking}
          />
          {error && <div className="error-message">{error}</div>}
          <div className="button-group">
            <button
              className="btn-primary"
              onClick={handleTextToVoice}
              disabled={loading || isSpeaking || !text.trim()}
            >
              {loading ? 'Processing...' : isSpeaking ? 'Speaking...' : '🔊 Convert to Voice'}
            </button>
            {isSpeaking && (
              <button className="btn-stop" onClick={stopSpeaking}>
                ⏹️ Stop
              </button>
            )}
          </div>
        </div>

        {history.length > 0 && (
          <div className="history-section">
            <h3>Recent History</h3>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <p className="history-text">{item.text}</p>
                  <div className="history-actions">
                    <button
                      className="btn-small"
                      onClick={() => speakFromHistory(item.text)}
                      disabled={isSpeaking}
                    >
                      🔊 Play
                    </button>
                    <span className="history-date">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

