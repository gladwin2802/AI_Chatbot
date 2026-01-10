import { useState, useRef, useEffect } from "react";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi2";
import {
    IoSend,
    IoAttachOutline,
    IoCloseCircle,
    IoDocumentTextOutline,
} from "react-icons/io5";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { IoCreateOutline, IoCheckmark, IoClose } from "react-icons/io5";
import { IoChatbubblesOutline, IoCopyOutline } from "react-icons/io5";
import { IoChevronUp, IoChevronDown } from "react-icons/io5";
import Message from "./Message";
import { sendMessageToOpenAI, fetchAvailableModels } from "../utils/openai";
import { saveSettings } from "../utils/storage";
import "../styles/ChatArea.css";

function ChatArea({
    conversation,
    onUpdateConversation,
    settings,
    onUpdateSettings,
    sidebarOpen,
    onToggleSidebar,
    theme,
    onToggleTheme,
}) {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [showNavigator, setShowNavigator] = useState(false);
    const [showTopArrow, setShowTopArrow] = useState(false);
    const [showBottomArrow, setShowBottomArrow] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [availableModels, setAvailableModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [modelSearchQuery, setModelSearchQuery] = useState("");
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [tokenCount, setTokenCount] = useState(0);
    const [showFilePreview, setShowFilePreview] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [copiedFile, setCopiedFile] = useState(false);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const navigatorRef = useRef(null);
    const scrollTimerRef = useRef(null);
    const isNavigatorHoveredRef = useRef(false);
    const modelDropdownRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const loadModels = async () => {
            if (!settings.baseUrl || !settings.apiKey) {
                return;
            }

            setLoadingModels(true);
            try {
                const models = await fetchAvailableModels(
                    settings.baseUrl,
                    settings.apiKey
                );

                const uniqueModels = models.filter(
                    (model, index, self) =>
                        index === self.findIndex((m) => m.id === model.id)
                );

                setAvailableModels(uniqueModels);
            } catch (error) {
                setAvailableModels([]);
            } finally {
                setLoadingModels(false);
            }
        };

        loadModels();
    }, [settings.baseUrl, settings.apiKey]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                modelDropdownRef.current &&
                !modelDropdownRef.current.contains(event.target)
            ) {
                setShowModelDropdown(false);
                setModelSearchQuery("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const navigateToMessage = (messageId) => {
        const element = document.getElementById(`message-${messageId}`);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            element.classList.add("highlight-message");
            setTimeout(() => {
                element.classList.remove("highlight-message");
            }, 2000);
        }
    };

    const handleModelSelect = (modelId) => {
        const newSettings = {
            ...settings,
            model: modelId,
            temperature: 0.2,
            maxTokens: 4096,
        };
        if (onUpdateSettings) {
            onUpdateSettings(newSettings);
            saveSettings(newSettings);
        }
        setShowModelDropdown(false);
        setModelSearchQuery("");
    };

    const filteredModels = availableModels.filter((model) =>
        model.id.toLowerCase().includes(modelSearchQuery.toLowerCase())
    );

    const getShortModelName = (modelId) => {
        if (!modelId) return "Select model";
        const parts = modelId.split("/");
        return parts[parts.length - 1];
    };

    const estimateTokenCount = (text) => {
        return Math.ceil(text.length / 4);
    };

    useEffect(() => {
        let totalTokens = estimateTokenCount(input);
        attachedFiles.forEach((file) => {
            totalTokens += estimateTokenCount(file.content);
        });
        setTokenCount(totalTokens);
    }, [input, attachedFiles]);

    const getMaxContextTokens = () => {
        const model = availableModels.find((m) => m.id === settings.model);
        return model?.context_length || 128000;
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);

        if (tokenCount >= settings.maxTokens) {
            alert(
                "Cannot attach files: Token limit exceeded. Please remove some files or increase Max Tokens in settings."
            );
            e.target.value = "";
            return;
        }

        const textFileExtensions = [
            ".txt",
            ".json",
            ".csv",
            ".md",
            ".xml",
            ".yaml",
            ".yml",
            ".log",
            ".js",
            ".jsx",
            ".ts",
            ".tsx",
            ".py",
            ".java",
            ".c",
            ".cpp",
            ".html",
            ".css",
        ];

        const maxContextTokens = getMaxContextTokens();

        for (const file of files) {
            const fileExtension = file.name
                .substring(file.name.lastIndexOf("."))
                .toLowerCase();

            if (!textFileExtensions.includes(fileExtension)) {
                alert(
                    `File "${file.name}" is not a supported text file. Only text files are allowed.`
                );
                continue;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert(`File "${file.name}" is too large. Maximum size is 5MB.`);
                continue;
            }

            try {
                const content = await file.text();
                const fileTokens = estimateTokenCount(content);
                const currentTokens = tokenCount;

                if (currentTokens + fileTokens > settings.maxTokens) {
                    alert(
                        `Adding "${
                            file.name
                        }" would exceed token limit (${settings.maxTokens.toLocaleString()} tokens). Cannot attach more files.`
                    );
                    continue;
                }

                setAttachedFiles((prev) => [
                    ...prev,
                    {
                        name: file.name,
                        content: content,
                        size: file.size,
                        tokens: fileTokens,
                    },
                ]);
            } catch (error) {
                alert(`Error reading file "${file.name}": ${error.message}`);
            }
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (index) => {
        setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const handleFilePreview = (file) => {
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation?.messages]);

    useEffect(() => {
        const handleScroll = () => {
            setShowNavigator(true);

            if (scrollTimerRef.current) {
                clearTimeout(scrollTimerRef.current);
            }

            if (!isNavigatorHoveredRef.current) {
                scrollTimerRef.current = setTimeout(() => {
                    setShowNavigator(false);
                }, 2000);
            }

            const container = messagesContainerRef.current;
            if (container) {
                const isNearBottom =
                    container.scrollHeight -
                        container.scrollTop -
                        container.clientHeight <
                    100;
                setShowScrollDown(!isNearBottom);
            }
        };

        const container = messagesContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
            return () => {
                container.removeEventListener("scroll", handleScroll);
                if (scrollTimerRef.current) {
                    clearTimeout(scrollTimerRef.current);
                }
            };
        }
    }, [conversation?.messages]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    useEffect(() => {
        const checkScrollable = () => {
            const navigator = navigatorRef.current;
            if (navigator) {
                const isScrollable =
                    navigator.scrollHeight > navigator.clientHeight;
                if (isScrollable) {
                    setShowTopArrow(navigator.scrollTop > 0);
                    setShowBottomArrow(
                        navigator.scrollTop <
                            navigator.scrollHeight - navigator.clientHeight
                    );
                } else {
                    setShowTopArrow(false);
                    setShowBottomArrow(false);
                }
            }
        };

        checkScrollable();
        const navigator = navigatorRef.current;
        if (navigator) {
            navigator.addEventListener("scroll", checkScrollable);
            return () =>
                navigator.removeEventListener("scroll", checkScrollable);
        }
    }, [conversation?.messages, showNavigator]);

    const handleSend = async () => {
        if (!input.trim() || !conversation || isLoading) return;

        if (tokenCount > settings.maxTokens) {
            alert(
                "Cannot send message: Token limit exceeded. Please remove some files, reduce message length, or increase Max Tokens in settings."
            );
            return;
        }

        if (!settings.baseUrl) {
            alert("Please set the Base URL in settings");
            return;
        }

        if (!settings.apiKey) {
            alert("Please set your API key in settings");
            return;
        }

        let messageContent = input.trim();
        let fileContentsForAPI = "";

        if (attachedFiles.length > 0) {
            fileContentsForAPI = "\n\n--- Attached Files ---\n";
            attachedFiles.forEach((file) => {
                fileContentsForAPI += `\n[File: ${file.name}]\n${file.content}\n`;
            });
        }

        const userMessage = {
            id: Date.now().toString(),
            role: "user",
            content: messageContent,
            timestamp: new Date().toISOString(),
            attachedFiles: attachedFiles.map((file) => ({
                name: file.name,
                content: file.content,
                size: file.size,
                tokens: file.tokens,
            })),
        };

        const apiMessage = {
            id: Date.now().toString(),
            role: "user",
            content: messageContent + fileContentsForAPI,
            timestamp: new Date().toISOString(),
        };

        const updatedMessages = [...conversation.messages, userMessage];
        const apiMessages = [
            ...conversation.messages.map((m) => ({
                role: m.role,
                content:
                    m.content +
                    (m.attachedFiles?.length > 0
                        ? "\n\n--- Attached Files ---\n" +
                          m.attachedFiles
                              .map((f) => `\n[File: ${f.name}]\n${f.content}\n`)
                              .join("")
                        : ""),
            })),
            {
                role: apiMessage.role,
                content: apiMessage.content,
            },
        ];

        const title =
            conversation.messages.length === 0
                ? input.trim().slice(0, 50)
                : conversation.title;

        onUpdateConversation(conversation.id, {
            messages: updatedMessages,
            title,
        });

        setInput("");
        setAttachedFiles([]);
        setIsLoading(true);

        try {
            const response = await sendMessageToOpenAI(apiMessages, settings);

            const assistantMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response,
                timestamp: new Date().toISOString(),
            };

            onUpdateConversation(conversation.id, {
                messages: [...updatedMessages, assistantMessage],
            });
        } catch (error) {
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `Error: ${error.message}`,
                timestamp: new Date().toISOString(),
                isError: true,
            };

            onUpdateConversation(conversation.id, {
                messages: [...updatedMessages, errorMessage],
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleStartEditTitle = () => {
        setEditedTitle(conversation.title);
        setIsEditingTitle(true);
    };

    const handleSaveTitle = () => {
        if (editedTitle.trim()) {
            onUpdateConversation(conversation.id, {
                title: editedTitle.trim(),
            });
            setIsEditingTitle(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditingTitle(false);
        setEditedTitle("");
    };

    const handleNavigatorMouseEnter = () => {
        isNavigatorHoveredRef.current = true;
        // Clear any existing timer when hovering
        if (scrollTimerRef.current) {
            clearTimeout(scrollTimerRef.current);
        }
    };

    const handleNavigatorMouseLeave = () => {
        isNavigatorHoveredRef.current = false;
        scrollTimerRef.current = setTimeout(() => {
            setShowNavigator(false);
        }, 2000);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    if (!conversation) {
        return <div className="chat-area">Loading...</div>;
    }

    return (
        <div className="chat-area">
            <div className="chat-header">
                <button
                    className="toggle-sidebar-btn"
                    onClick={onToggleSidebar}
                    title="Toggle sidebar"
                >
                    {sidebarOpen ? (
                        <HiChevronDoubleLeft size={20} />
                    ) : (
                        <HiChevronDoubleRight size={20} />
                    )}
                </button>
                {isEditingTitle ? (
                    <div className="title-edit-wrapper">
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveTitle();
                                if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="title-edit-input"
                            autoFocus
                        />
                        <button
                            onClick={handleSaveTitle}
                            className="title-save-btn"
                            title="Save"
                        >
                            <IoCheckmark size={18} />
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="title-cancel-btn"
                            title="Cancel"
                        >
                            <IoClose size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="title-wrapper">
                        <h2>{conversation.title}</h2>
                        <button
                            onClick={handleStartEditTitle}
                            className="title-edit-btn"
                            title="Edit title"
                        >
                            <IoCreateOutline size={18} />
                        </button>
                    </div>
                )}
                <button
                    className="theme-toggle-btn"
                    onClick={onToggleTheme}
                    title={`Switch to ${
                        theme === "dark" ? "light" : "dark"
                    } mode`}
                >
                    {theme === "dark" ? (
                        <IoSunnyOutline size={20} />
                    ) : (
                        <IoMoonOutline size={20} />
                    )}
                </button>
            </div>

            <div className="messages-container" ref={messagesContainerRef}>
                {conversation.messages.length === 0 ? (
                    <div className="empty-state">
                        <h1>AI Chatbot</h1>
                        <p>Start a conversation</p>
                    </div>
                ) : (
                    conversation.messages.map((msg, index) => (
                        <Message
                            key={msg.id}
                            message={msg}
                            messageId={msg.id}
                            attachedFiles={msg.attachedFiles || []}
                        />
                    ))
                )}
                {isLoading && (
                    <div className="message-wrapper assistant">
                        <div className="message-container">
                            <div className="message-avatar">
                                <IoChatbubblesOutline size={28} />
                            </div>
                            <div className="message-body">
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {conversation.messages.length > 0 && (
                <>
                    <div
                        className={`message-navigator ${
                            showNavigator ? "visible" : ""
                        }`}
                        onMouseEnter={handleNavigatorMouseEnter}
                        onMouseLeave={handleNavigatorMouseLeave}
                    >
                        {showTopArrow && (
                            <div className="nav-arrow nav-arrow-top">
                                <IoChevronUp size={14} />
                            </div>
                        )}
                        <div className="nav-dots" ref={navigatorRef}>
                            {conversation.messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`dot-group ${msg.role}`}
                                    onClick={() => navigateToMessage(msg.id)}
                                    title={`${
                                        msg.role === "user" ? "User" : "AI"
                                    } message`}
                                >
                                    {msg.role === "user" ? (
                                        <span className="dot"></span>
                                    ) : (
                                        <>
                                            <span className="dot"></span>
                                            <span className="dot"></span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                        {showBottomArrow && (
                            <div className="nav-arrow nav-arrow-bottom">
                                <IoChevronDown size={14} />
                            </div>
                        )}
                    </div>
                    {showScrollDown && (
                        <button
                            className="scroll-down-btn"
                            onClick={scrollToBottom}
                            title="Scroll to bottom"
                        >
                            <IoChevronDown size={20} />
                        </button>
                    )}
                </>
            )}

            <div className="input-container">
                {attachedFiles.length > 0 && (
                    <div className="attached-files-container">
                        {attachedFiles.map((file, index) => (
                            <div key={index} className="attached-file-chip">
                                <IoDocumentTextOutline
                                    size={16}
                                    className="file-icon"
                                    onClick={() => handleFilePreview(file)}
                                />
                                <span
                                    className="file-info"
                                    onClick={() => handleFilePreview(file)}
                                >
                                    <span className="file-name">
                                        {file.name}
                                    </span>
                                    <span className="file-meta">
                                        {formatFileSize(file.size)} •{" "}
                                        {file.tokens.toLocaleString()} tokens
                                    </span>
                                </span>
                                <button
                                    className="remove-file-btn"
                                    onClick={() => removeFile(index)}
                                    title="Remove file"
                                >
                                    <IoCloseCircle size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="input-wrapper">
                    <div className="input-wrapper-inner">
                        <div
                            className="inline-model-selector"
                            ref={modelDropdownRef}
                        >
                            <button
                                className="model-trigger-btn"
                                onClick={() =>
                                    setShowModelDropdown(!showModelDropdown)
                                }
                                disabled={
                                    loadingModels ||
                                    availableModels.length === 0
                                }
                                title={settings.model || "Select a model"}
                            >
                                <span className="model-name">
                                    {loadingModels
                                        ? "..."
                                        : getShortModelName(settings.model)}
                                </span>
                                <IoChevronDown size={14} />
                            </button>

                            {showModelDropdown && (
                                <div className="model-dropdown-menu">
                                    <div className="model-search-wrapper">
                                        <input
                                            type="text"
                                            className="model-search-input"
                                            placeholder="Search models..."
                                            value={modelSearchQuery}
                                            onChange={(e) =>
                                                setModelSearchQuery(
                                                    e.target.value
                                                )
                                            }
                                            autoFocus
                                        />
                                    </div>
                                    <div className="model-list">
                                        {filteredModels.length === 0 ? (
                                            <div className="model-item no-results">
                                                No models found
                                            </div>
                                        ) : (
                                            filteredModels.map((model) => (
                                                <div
                                                    key={model.id}
                                                    className={`model-item ${
                                                        model.id ===
                                                        settings.model
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        handleModelSelect(
                                                            model.id
                                                        )
                                                    }
                                                >
                                                    {model.id}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".txt,.json,.csv,.md,.xml,.yaml,.yml,.log,.js,.jsx,.ts,.tsx,.py,.java,.c,.cpp,.html,.css"
                            style={{ display: "none" }}
                            multiple
                        />
                        <button
                            className="attach-file-btn"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={
                                isLoading || tokenCount >= settings.maxTokens
                            }
                            title={
                                tokenCount >= settings.maxTokens
                                    ? "Token limit exceeded"
                                    : "Attach text files"
                            }
                        >
                            <IoAttachOutline size={20} />
                        </button>

                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                tokenCount >= settings.maxTokens
                                    ? "Token limit exceeded..."
                                    : "Send a message..."
                            }
                            rows={1}
                            disabled={
                                isLoading || tokenCount > settings.maxTokens
                            }
                        />
                        <button
                            onClick={handleSend}
                            disabled={
                                !input.trim() ||
                                isLoading ||
                                tokenCount > settings.maxTokens
                            }
                            className="send-btn"
                            title={
                                tokenCount > settings.maxTokens
                                    ? "Token limit exceeded"
                                    : "Send message"
                            }
                        >
                            <IoSend size={20} />
                        </button>
                    </div>
                </div>

                <div className="token-counter">
                    {tokenCount > settings.maxTokens * 0.8 && (
                        <span className="token-warning">⚠️</span>
                    )}
                    <span
                        className="token-count"
                        title="Go to settings to change the token limit"
                    >
                        {tokenCount.toLocaleString()} out of{" "}
                        {settings.maxTokens.toLocaleString()} tokens used (
                        {Math.round((tokenCount / settings.maxTokens) * 100)}%)
                        (Max available: {getMaxContextTokens().toLocaleString()}{" "}
                        tokens)
                    </span>
                </div>
            </div>

            {showFilePreview && previewFile && (
                <div
                    className="file-preview-overlay"
                    onClick={handleClosePreview}
                >
                    <div
                        className="file-preview-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="file-preview-header">
                            <div className="file-preview-title">
                                <IoDocumentTextOutline size={20} />
                                <span>{previewFile.name}</span>
                            </div>
                            <div className="file-preview-actions">
                                <button
                                    className="file-copy-btn"
                                    onClick={handleCopyFileContent}
                                    title={
                                        copiedFile ? "Copied!" : "Copy content"
                                    }
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
        </div>
    );
}

export default ChatArea;
