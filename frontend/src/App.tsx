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
    
    setIsLoading(true);
    setMessages((msgs) => [...msgs, { sender: 'user', text: input }]);
    
    try {
      console.log('Sending request to /chat...');
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: input }),
      });
      
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      setMessages((msgs) => [...msgs, { sender: 'broski', text: data.response }]);
    } catch (error) {
      console.error('Error details:', error);
      setMessages((msgs) => [...msgs, { 
        sender: 'broski', 
        text: `Sorry, something went wrong. Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
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
