import { useState } from 'react'
import { IoAddOutline } from 'react-icons/io5'
import { IoTrashOutline } from 'react-icons/io5'
import { IoCreateOutline, IoCheckmark, IoClose } from 'react-icons/io5'
import { IoSettingsOutline } from 'react-icons/io5'
import '../styles/Sidebar.css'

function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onOpenSettings,
  isOpen,
  onUpdateConversation
}) {
  const [editingId, setEditingId] = useState(null)
  const [editedTitle, setEditedTitle] = useState('')

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const handleStartEdit = (conv, e) => {
    e.stopPropagation()
    setEditingId(conv.id)
    setEditedTitle(conv.title)
  }

  const handleSaveEdit = (convId, e) => {
    e.stopPropagation()
    if (editedTitle.trim()) {
      onUpdateConversation(convId, { title: editedTitle.trim() })
      setEditingId(null)
      setEditedTitle('')
    }
  }

  const handleCancelEdit = (e) => {
    e.stopPropagation()
    setEditingId(null)
    setEditedTitle('')
  }

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewConversation}>
          <IoAddOutline className="icon" size={18} />
          New Chat
        </button>
      </div>

      <div className="conversations-list">
        {conversations.map(conv => (
          <div
            key={conv.id}
            className={`conversation-item ${conv.id === currentConversationId ? 'active' : ''}`}
            onClick={() => onSelectConversation(conv.id)}
          >
            <div className="conversation-content">
              {editingId === conv.id ? (
                <div className="conversation-edit-wrapper" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit(conv.id, e)
                      if (e.key === 'Escape') handleCancelEdit(e)
                    }}
                    className="conversation-edit-input"
                    autoFocus
                  />
                  <div className="conversation-edit-actions">
                    <button
                      onClick={(e) => handleSaveEdit(conv.id, e)}
                      className="save-btn"
                      title="Save"
                    >
                      <IoCheckmark size={14} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="cancel-btn"
                      title="Cancel"
                    >
                      <IoClose size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="conversation-title">{conv.title}</div>
                  <div className="conversation-date">{formatDate(conv.createdAt)}</div>
                </>
              )}
            </div>
            <div className="conversation-actions">
              {editingId !== conv.id && (
                <>
                  <button
                    className="edit-btn"
                    onClick={(e) => handleStartEdit(conv, e)}
                    title="Edit title"
                  >
                    <IoCreateOutline size={14} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conv.id)
                    }}
                    title="Delete conversation"
                  >
                    <IoTrashOutline size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="settings-btn" onClick={onOpenSettings}>
          <IoSettingsOutline className="icon" size={18} />
          Settings
        </button>
      </div>
    </div>
  )
}

export default Sidebar

