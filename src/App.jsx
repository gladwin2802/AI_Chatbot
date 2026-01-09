import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import Settings from './components/Settings'
import { loadConversations, saveConversations, loadSettings, loadTheme, saveTheme } from './utils/storage'
import './styles/App.css'

function App() {
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(loadSettings())
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState(loadTheme())

  useEffect(() => {
    const loaded = loadConversations()
    setConversations(loaded)
    if (loaded.length === 0) {
      createNewConversation()
    } else {
      setCurrentConversationId(loaded[0].id)
    }
  }, [])

  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations)
    }
  }, [conversations])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    saveTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }
  
  const createNewConversation = () => {
    const newConv = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString()
    }
    setConversations(prev => [newConv, ...prev])
    setCurrentConversationId(newConv.id)
  }

  const deleteConversation = (id) => {
    setConversations(prev => {
      const filtered = prev.filter(c => c.id !== id)
      if (currentConversationId === id) {
        if (filtered.length > 0) {
          setCurrentConversationId(filtered[0].id)
        } else {
          createNewConversation()
        }
      }
      return filtered
    })
  }

  const updateConversation = (id, updates) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, ...updates } : conv
      )
    )
  }

  const currentConversation = conversations.find(c => c.id === currentConversationId)

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={createNewConversation}
        onDeleteConversation={deleteConversation}
        onOpenSettings={() => setShowSettings(true)}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <ChatArea
        conversation={currentConversation}
        onUpdateConversation={updateConversation}
        settings={settings}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        theme={theme}
      />

      {showSettings && (
        <Settings
          settings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(newSettings) => {
            setSettings(newSettings)
            setShowSettings(false)
          }}
        />
      )}
    </div>
  )
}

export default App
