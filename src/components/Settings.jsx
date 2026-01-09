import { useState } from 'react'
import { saveSettings } from '../utils/storage'
import '../styles/Settings.css'

function Settings({ settings, onClose, onSave }) {
  const [formData, setFormData] = useState({
    apiKey: settings.apiKey || '',
    model: settings.model || 'gpt-3.5-turbo',
    temperature: settings.temperature || 0.7,
    maxTokens: settings.maxTokens || 2000
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    saveSettings(formData)
    onSave(formData)
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose} title="Close settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="settings-content">
            <div className="form-group">
              <label>OpenAI API Key</label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="sk-..."
                required
              />
            </div>

            <div className="form-group">
              <label>Model</label>
              <select
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Temperature: {formData.temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
              />
              <div className="range-labels">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="form-group">
              <label>Max Tokens: {formData.maxTokens}</label>
              <input
                type="range"
                min="100"
                max="4000"
                step="100"
                value={formData.maxTokens}
                onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
              />
              <div className="range-labels">
                <span>100</span>
                <span>4000</span>
              </div>
            </div>
          </div>

          <div className="settings-footer">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings

