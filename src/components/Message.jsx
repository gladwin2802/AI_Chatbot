import { useState, useEffect, useRef } from 'react'
import { IoChatbubblesOutline, IoCopyOutline, IoCheckmark, IoCloseCircle, IoClose, IoDocumentTextOutline, IoDownloadOutline } from 'react-icons/io5'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import 'highlight.js/styles/atom-one-dark.css'
import '../styles/highlight-override.css'
import '../styles/Message.css'

function Message({ message, messageId, attachedFiles = [] }) {
  const [copied, setCopied] = useState(false)
  const [copiedCode, setCopiedCode] = useState({})
  const [showFilePreview, setShowFilePreview] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const [copiedFile, setCopiedFile] = useState(false)
  const contentRef = useRef(null)

  const getFileExtension = (language) => {
    const extensionMap = {
      'json': 'json',
      'javascript': 'js',
      'typescript': 'ts',
      'python': 'py',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'html': 'html',
      'css': 'css',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'markdown': 'md',
      'md': 'md',
      'sql': 'sql',
      'bash': 'sh',
      'shell': 'sh',
      'text': 'txt',
      'plaintext': 'txt'
    }
    return extensionMap[language?.toLowerCase()] || 'txt'
  }

  const handleDownloadCode = (code, language, index) => {
    const extension = getFileExtension(language)
    const filename = `file-${Date.now()}-${index}.${extension}`
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFileClick = (file) => {
    setPreviewFile(file);
    setShowFilePreview(true);
  };

  const handleClosePreview = () => {
    setShowFilePreview(false);
    setPreviewFile(null);
    setCopiedFile(false);
  };

  const handleCopyFileContent = async () => {
    if (previewFile) {
      try {
        await navigator.clipboard.writeText(previewFile.content);
        setCopiedFile(true);
        setTimeout(() => setCopiedFile(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCodeCopy = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(prev => ({ ...prev, [id]: true }))
      setTimeout(() => {
        setCopiedCode(prev => ({ ...prev, [id]: false }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const isPureJson = (content) => {
    const trimmed = content.trim()
    return trimmed.startsWith('{') && trimmed.endsWith('}')
  }

  const handleDownloadJson = () => {
    const filename = `json-${Date.now()}.json`
    const blob = new Blob([message.content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (message.role === 'assistant' && contentRef.current) {
      const codeBlocks = contentRef.current.querySelectorAll('pre')
      const tables = contentRef.current.querySelectorAll('table')

      codeBlocks.forEach((pre, index) => {
        let buttonContainer = pre.querySelector('.code-actions-container')
        let copyBtn = pre.querySelector('.code-copy-btn')
        let downloadBtn = pre.querySelector('.code-download-btn')

        const code = pre.querySelector('code')
        if (!code) return

        const codeText = code.textContent
        const language = code.className.match(/language-(\w+)/)?.[1] || ''
        const id = `code-${messageId}-${index}`

        if (!buttonContainer) {
          buttonContainer = document.createElement('div')
          buttonContainer.className = 'code-actions-container'

          copyBtn = document.createElement('button')
          copyBtn.className = 'code-copy-btn'
          copyBtn.title = 'Copy code'

          downloadBtn = document.createElement('button')
          downloadBtn.className = 'code-download-btn'
          downloadBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>'
          downloadBtn.title = 'Download as file'
          downloadBtn.onclick = () => handleDownloadCode(codeText, language, index)

          buttonContainer.appendChild(copyBtn)
          buttonContainer.appendChild(downloadBtn)
          pre.style.position = 'relative'
          pre.appendChild(buttonContainer)
        }

        copyBtn.onclick = () => handleCodeCopy(codeText, id)

        if (copiedCode[id]) {
          copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        } else {
          copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
        }
      })

      tables.forEach((table, index) => {
        if (table.parentElement.querySelector('.table-copy-btn')) return

        const tableText = Array.from(table.querySelectorAll('tr')).map(row => {
          return Array.from(row.querySelectorAll('th, td')).map(cell => cell.textContent).join('\t')
        }).join('\n')

        const wrapper = document.createElement('div')
        wrapper.className = 'table-wrapper'
        wrapper.style.position = 'relative'
        table.parentNode.insertBefore(wrapper, table)
        wrapper.appendChild(table)

        const copyBtn = document.createElement('button')
        copyBtn.className = 'table-copy-btn'
        copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
        copyBtn.title = 'Copy table'

        const id = `table-${messageId}-${index}`
        copyBtn.onclick = () => handleCodeCopy(tableText, id)

        if (copiedCode[id]) {
          copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'
        }

        wrapper.appendChild(copyBtn)
      })
    }
  }, [message.content, message.role, messageId, copiedCode])

  return (
    <>
      <div
        id={`message-${messageId}`}
        className={`message-wrapper ${message.role} ${message.isError ? 'error' : ''}`}
      >
        <div className="message-container">
          {message.role === 'assistant' && (
            <div className="message-avatar">
              <IoChatbubblesOutline size={28} />
            </div>
          )}
          <div className="message-body">
            <div className="message-content" ref={contentRef}>
              {message.role === 'assistant' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                message.content
              )}
            </div>
            {attachedFiles.length > 0 && (
              <div className="message-attached-files">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="message-file-chip"
                    onClick={() => handleFileClick(file)}
                  >
                    <IoDocumentTextOutline size={16} />
                    <span className="file-info">
                      <span className="file-name">{file.name}</span>
                      <span className="file-meta">
                        {formatFileSize(file.size)} • {file.tokens.toLocaleString()} tokens
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="message-actions">
            {message.role === 'assistant' && isPureJson(message.content) && (
              <button
                className="download-btn"
                onClick={handleDownloadJson}
                title="Download JSON"
              >
                <IoDownloadOutline size={16} />
              </button>
            )}
            <button
              className="copy-btn"
              onClick={handleCopy}
              title={copied ? "Copied!" : "Copy message"}
            >
              {copied ? <IoCheckmark size={16} /> : <IoCopyOutline size={16} />}
            </button>
          </div>
        </div>
      </div>

      {showFilePreview && previewFile && (
        <div className="file-preview-overlay" onClick={handleClosePreview}>
          <div className="file-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="file-preview-header">
              <div className="file-preview-title">
                <IoDocumentTextOutline size={20} />
                <span>{previewFile.name}</span>
              </div>
              <div className="file-preview-actions">
                <button
                  className="file-copy-btn"
                  onClick={handleCopyFileContent}
                  title={copiedFile ? "Copied!" : "Copy content"}
                >
                  {copiedFile ? (
                    <IoCheckmark size={20} />
                  ) : (
                    <IoCopyOutline size={20} />
                  )}
                </button>
                <button
                  className="file-preview-close-btn"
                  onClick={handleClosePreview}
                  title="Close preview"
                >
                  <IoClose size={24} />
                </button>
              </div>
            </div>
            <div className="file-preview-content">
              <pre>{previewFile.content}</pre>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Message

