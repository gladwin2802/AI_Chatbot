import { useState, useRef, useEffect } from 'react'
import Message from './Message'
import { sendMessageToOpenAI } from '../utils/openai'
import '../styles/ChatArea.css'

function ChatArea({ conversation, onUpdateConversation, settings, sidebarOpen, onToggleSidebar }) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation?.messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const handleSend = async () => {
    if (!input.trim() || !conversation || isLoading) return
    
    if (!settings.apiKey) {
      alert('Please set your OpenAI API key in settings')
      return
    }

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...conversation.messages, userMessage]
    
    const title = conversation.messages.length === 0 
      ? input.trim().slice(0, 50) 
      : conversation.title
    
    onUpdateConversation(conversation.id, {
      messages: updatedMessages,
      title
    })

    setInput('')
    setIsLoading(true)

    try {
      const response = await sendMessageToOpenAI(updatedMessages, settings)
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }

      onUpdateConversation(conversation.id, {
        messages: [...updatedMessages, assistantMessage]
      })
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        isError: true
      }

      onUpdateConversation(conversation.id, {
        messages: [...updatedMessages, errorMessage]
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!conversation) {
    return <div className="chat-area">Loading...</div>
  }

  return (
    <div className="chat-area">
      <div className="chat-header">
        <button className="toggle-sidebar-btn" onClick={onToggleSidebar} title="Toggle sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h2>{conversation.title}</h2>
      </div>

      <div className="messages-container">
        {conversation.messages.length === 0 ? (
          <div className="empty-state">
            <h1>AI Chatbot</h1>
            <p>Start a conversation</p>
          </div>
        ) : (
          conversation.messages.map(msg => (
            <Message key={msg.id} message={msg} />
          ))
        )}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message..."
            rows={1}
            disabled={isLoading}
          />
          <button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="send-btn"
            title="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatArea

