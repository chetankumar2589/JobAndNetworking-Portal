import React, { Component } from 'react';
import withRouter from '../withRouter';
import './index.css';

class Chatbot extends Component {
  state = {
    messages: [
      { sender: 'bot', text: 'Hello! I am ConnectUS Bot. How can I help you today?' }
    ],
    inputMessage: '',
    loading: false,
  };

  handleInputChange = (e) => {
    this.setState({ inputMessage: e.target.value });
  };

  handleSendMessage = async (e) => {
    e.preventDefault();
    const { inputMessage } = this.state;
    const token = localStorage.getItem('token');

    if (!inputMessage.trim()) return;

    this.setState(prevState => ({
      messages: [...prevState.messages, { sender: 'user', text: inputMessage }],
      inputMessage: '',
      loading: true,
    }));

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ message: inputMessage }),
      });

      const data = await response.json();
      
      let formattedResponse = data.response;
      // Check for numbered lists and add line breaks
      if (formattedResponse && formattedResponse.match(/\d+\./)) {
        formattedResponse = formattedResponse.replace(/\d+\./g, '\n$&');
      }

      this.setState(prevState => ({
        messages: [...prevState.messages, { sender: 'bot', text: formattedResponse }],
      }));
    } catch (error) {
      console.error('Chatbot error:', error);
      this.setState(prevState => ({
        messages: [...prevState.messages, { sender: 'bot', text: 'Sorry, I am having trouble connecting. Please try again later.' }],
      }));
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { messages, inputMessage, loading } = this.state;
    return (
      <div className="chatbot-container">
        <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-600">ConnectUS Bot</h1>
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}>
              <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
            </div>
          ))}
          {loading && <div className="message-bubble bot">Typing...</div>}
        </div>
        <form onSubmit={this.handleSendMessage} className="chat-input-form">
          <input
            type="text"
            placeholder="Ask me anything..."
            value={inputMessage}
            onChange={this.handleInputChange}
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" className="chat-send-button" disabled={loading}>
            Send
          </button>
        </form>
      </div>
    );
  }
}

export default withRouter(Chatbot);
