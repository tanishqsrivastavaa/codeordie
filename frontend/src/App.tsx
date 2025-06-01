import { useState, useRef, useEffect } from 'react';
import './App.css';
import Logo from './components/Logo';

interface Message {
  sender: 'user' | 'broski';
  text: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'broski', text: "hey, how can I help you today?" },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Add user message immediately
    setMessages((msgs) => [...msgs, { sender: 'user', text: userMessage }]);

    try {
      console.log('Sending request to /chat endpoint...');
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: userMessage }),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response:', errorData);
        throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!data.response) {
        throw new Error('No response data received');
      }

      setMessages((msgs) => [...msgs, { sender: 'broski', text: data.response }]);
    } catch (error) {
      console.error('Error details:', error);
      let errorMessage = 'Sorry, something went wrong. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('GROQ_API_KEY')) {
          errorMessage = 'API key is not configured. Please check the server configuration.';
        } else if (error.message.includes('No response from agent')) {
          errorMessage = 'The AI agent is not responding. Please try again.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setMessages((msgs) => [...msgs, { 
        sender: 'broski', 
        text: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="terminal-container">
      <div className="logo-wrapper">
        <Logo />
      </div>
      <div className="terminal-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`terminal-message ${msg.sender}`}>
            <span className="sender">{msg.sender === 'user' ? 'You' : 'broski'}:</span> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="terminal-input-bar" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isLoading ? "Broski is thinking..." : "Type your message..."}
          disabled={isLoading}
          autoFocus
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}

export default App;
