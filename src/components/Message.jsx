import '../styles/Message.css'

function Message({ message }) {
  return (
    <div className={`message ${message.role} ${message.isError ? 'error' : ''}`}>
      <div className="message-header">
        <span className="message-role">
          {message.role === 'user' ? 'You' : 'Assistant'}
        </span>
        <span className="message-time">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
      <div className="message-content">
        {message.content}
      </div>
    </div>
  )
}

export default Message

