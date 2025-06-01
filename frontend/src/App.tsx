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
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: 'user', text: input }]);
    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages((msgs) => [...msgs, { sender: 'broski', text: data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((msgs) => [...msgs, { sender: 'broski', text: 'Sorry, something went wrong.' }]);
    }
    setInput('');
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
          placeholder="Type your message..."
          autoFocus
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default App;
