const CONVERSATIONS_KEY = 'ai_chatbot_conversations'
const SETTINGS_KEY = 'ai_chatbot_settings'
const THEME_KEY = 'ai_chatbot_theme'

export const loadConversations = () => {
  try {
    const data = localStorage.getItem(CONVERSATIONS_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error loading conversations:', error)
    return []
  }
}

export const saveConversations = (conversations) => {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
  } catch (error) {
    console.error('Error saving conversations:', error)
  }
}

export const loadSettings = () => {
  try {
    const data = localStorage.getItem(SETTINGS_KEY)
    return data ? JSON.parse(data) : {
      apiKey: '',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000
    }
  } catch (error) {
    console.error('Error loading settings:', error)
    return {
      apiKey: '',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000
    }
  }
}

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error('Error saving settings:', error)
  }
}

export const loadTheme = () => {
  try {
    const theme = localStorage.getItem(THEME_KEY)
    return theme || 'dark'
  } catch (error) {
    console.error('Error loading theme:', error)
    return 'dark'
  }
}

export const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch (error) {
    console.error('Error saving theme:', error)
  }
}

