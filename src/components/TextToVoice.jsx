import { useState, useEffect } from 'react';
import { api } from '../api';
import './TextToVoice.css';

export default function TextToVoice({ user }) {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioElement, setAudioElement] = useState(null);

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
    setAudioUrl(null);

    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    try {
      // Call backend API which uses LemonFox
      const response = await api.textToVoice(text);
      
      // Check if we got audio from LemonFox API
      if (response.audio) {
        // Use LemonFox audio
        const audio = new Audio(response.audio);
        setAudioElement(audio);
        setAudioUrl(response.audio);

        audio.onplay = () => {
          setIsSpeaking(true);
        };

        audio.onended = () => {
          setIsSpeaking(false);
          loadHistory();
        };

        audio.onerror = (event) => {
          setIsSpeaking(false);
          setError('Error playing audio');
          console.error('Audio playback error:', event);
        };

        audio.play().catch((err) => {
          setIsSpeaking(false);
          setError('Failed to play audio. Please try again.');
          console.error('Audio play error:', err);
        });
      } else if (response.useFallback && response.text) {
        // Fallback to Web Speech API if LemonFox fails
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(response.text);
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
      } else {
        setError(response.error || 'Failed to convert text to voice');
      }
    } catch (err) {
      setError(err.message || 'Failed to convert text to voice. Please try again.');
      console.error('Text to voice error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stopSpeaking = () => {
    // Stop audio playback
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsSpeaking(false);
    }
    // Stop Web Speech API (fallback)
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const speakFromHistory = async (textToSpeak) => {
    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    try {
      // Try to get audio from LemonFox API
      const response = await api.textToVoice(textToSpeak);
      
      if (response.audio) {
        const audio = new Audio(response.audio);
        setAudioElement(audio);

        audio.onplay = () => setIsSpeaking(true);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = () => {
          setIsSpeaking(false);
          setError('Error playing audio');
        };

        audio.play().catch((err) => {
          setIsSpeaking(false);
          console.error('Audio play error:', err);
        });
      } else {
        // Fallback to Web Speech API
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
      }
    } catch (err) {
      // Fallback to Web Speech API on error
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
          {audioUrl && (
            <div style={{ marginTop: '15px', marginBottom: '15px' }}>
              <audio controls src={audioUrl} style={{ width: '100%' }} />
            </div>
          )}
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

