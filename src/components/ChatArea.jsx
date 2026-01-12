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
import {
    IoChevronUp,
    IoChevronDown,
    IoWarning,
} from "react-icons/io5";
import Message from "./Message";
import ContextSettingsModal from "./ContextSettingsModal";
import MessageSelector from "./MessageSelector";
import { sendMessageToOpenAI, fetchAvailableModels } from "../utils/openai";
import {
    saveSettings,
    loadContextStrategy,
    saveContextStrategy,
    loadConversationSummaries,
    saveConversationSummaries,
    loadWindowSize,
    saveWindowSize,
    loadSummarizationMode,
    saveSummarizationMode,
} from "../utils/storage";
import {
    CONTEXT_STRATEGIES,
    estimateMessageTokens,
    calculateTotalTokens,
    getTokenPercentage,
    getTokenColor,
    selectRecentMessagesWithinLimit,
    prepareMessagesForAPI,
    createSimpleSummary,
} from "../utils/contextManager";
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
    const maxContextTokens = settings.maxContextTokens || 100000;
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
    const [systemMessageTokens, setSystemMessageTokens] = useState(0);
    const [showFilePreview, setShowFilePreview] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [copiedFile, setCopiedFile] = useState(false);
    const [contextStrategy, setContextStrategy] = useState(
        loadContextStrategy()
    );
    const [selectedMessageIds, setSelectedMessageIds] = useState([]);
    const [showMessageSelector, setShowMessageSelector] = useState(false);
    const [conversationSummaries, setConversationSummaries] = useState(
        loadConversationSummaries()
    );
    const [showContextWarning, setShowContextWarning] = useState(false);
    const [historyTokenCount, setHistoryTokenCount] = useState(0);
    const [windowSize, setWindowSize] = useState(loadWindowSize());
    const [showContextSettings, setShowContextSettings] = useState(false);
    const [summarizationMode, setSummarizationMode] = useState(
        loadSummarizationMode()
    );
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
        if (conversation && conversation.messages.length > 0) {
            let totalHistoryTokens;

            if (contextStrategy === CONTEXT_STRATEGIES.LAST_MESSAGE) {
                totalHistoryTokens = systemMessageTokens + tokenCount;
            } else if (contextStrategy === CONTEXT_STRATEGIES.SLIDING_WINDOW) {
                const recentMessages = conversation.messages.slice(-windowSize);
                totalHistoryTokens = calculateTotalTokens(recentMessages);
            } else if (
                contextStrategy === CONTEXT_STRATEGIES.FULL_HISTORY &&
                selectedMessageIds.length > 0
            ) {
                const selectedMessages = conversation.messages.filter((msg) =>
                    selectedMessageIds.includes(msg.id)
                );
                totalHistoryTokens = calculateTotalTokens(selectedMessages);
            } else {
                totalHistoryTokens = calculateTotalTokens(
                    conversation.messages
                );
            }

            setHistoryTokenCount(totalHistoryTokens);

            const percentage = getTokenPercentage(
                totalHistoryTokens,
                maxContextTokens
            );
            setShowContextWarning(percentage >= 80);

            if (contextStrategy === CONTEXT_STRATEGIES.FULL_HISTORY) {
                const recentIds = selectRecentMessagesWithinLimit(
                    conversation.messages,
                    maxContextTokens
                );
                setSelectedMessageIds(recentIds);
            }
        }
    }, [
        conversation?.messages,
        maxContextTokens,
        contextStrategy,
        windowSize,
        selectedMessageIds.length,
        systemMessageTokens,
        tokenCount
    ]);

    useEffect(() => {
        saveContextStrategy(contextStrategy);
    }, [contextStrategy]);

    useEffect(() => {
        saveWindowSize(windowSize);
    }, [windowSize]);

    useEffect(() => {
        saveSummarizationMode(summarizationMode);
    }, [summarizationMode]);

    const handleWindowSizeChange = (newSize) => {
        setWindowSize(newSize);
    };

    const handleSummarizationModeChange = (mode) => {
        setSummarizationMode(mode);
    };

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

    const handleStrategyChange = (newStrategy) => {
        setContextStrategy(newStrategy);

        if (newStrategy === CONTEXT_STRATEGIES.FULL_HISTORY && conversation) {
            const recentIds = selectRecentMessagesWithinLimit(
                conversation.messages,
                maxContextTokens
            );
            setSelectedMessageIds(recentIds);
        }
    };

    const handleSummarizeConversation = () => {
        if (!conversation || conversation.messages.length === 0) return;

        const currentSummary = conversationSummaries[conversation.id] || {};
        const lastIndex = currentSummary.lastSummarizedIndex || -1;

        const messagesToSummarize = conversation.messages.slice(
            0,
            lastIndex + 1
        );
        const newMessages = conversation.messages.slice(lastIndex + 1);

        let summary = "";
        if (currentSummary.summary) {
            summary = currentSummary.summary + "\n\n";
        }

        if (newMessages.length > 0) {
            summary += createSimpleSummary(newMessages);
        } else {
            summary += createSimpleSummary(messagesToSummarize);
        }

        const updatedSummaries = {
            ...conversationSummaries,
            [conversation.id]: {
                summary,
                lastSummarizedIndex: conversation.messages.length - 1,
                createdAt: new Date().toISOString(),
            },
        };

        setConversationSummaries(updatedSummaries);
        saveConversationSummaries(updatedSummaries);
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

    useEffect(() => {
        const systemMsg = settings.systemMessage || "";
        setSystemMessageTokens(estimateTokenCount(systemMsg));
    }, [settings.systemMessage]);

    const getMaxContextTokens = () => {
        const model = availableModels.find((m) => m.id === settings.model);
        return model?.context_length || 128000;
    };

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);

        const usableTokens = maxContextTokens - systemMessageTokens;
        if (tokenCount >= usableTokens) {
            alert(
                `Cannot attach files: Input token limit reached.\n\n` +
                    `Current input: ${tokenCount.toLocaleString()} tokens\n` +
                    `Available: ${usableTokens.toLocaleString()} tokens (after ${systemMessageTokens.toLocaleString()} system message tokens)\n\n` +
                    `Please remove some files or increase Max Context Tokens in settings.`
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

                if (currentTokens + fileTokens > maxContextTokens) {
                    alert(
                        `Adding "${
                            file.name
                        }" would exceed token limit (${maxContextTokens.toLocaleString()} tokens). Cannot attach more files.`
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

        const usableTokens = maxContextTokens - systemMessageTokens;
        if (tokenCount > usableTokens) {
            alert(
                `Cannot send message: Input token limit exceeded.\n\n` +
                    `Your input: ${tokenCount.toLocaleString()} tokens\n` +
                    `Available: ${usableTokens.toLocaleString()} tokens (after ${systemMessageTokens.toLocaleString()} system message tokens)\n\n` +
                    `Please remove some files, reduce message length, or increase Max Context Tokens in settings.`
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

        let apiMessages;
        const summaryData = conversationSummaries[conversation.id];

        if (contextStrategy === CONTEXT_STRATEGIES.LAST_MESSAGE) {
            apiMessages = [];
            if (settings.systemMessage && settings.systemMessage.trim()) {
                apiMessages.push({
                    role: "system",
                    content: settings.systemMessage.trim(),
                });
            }
            apiMessages.push({
                role: "user",
                content: messageContent + fileContentsForAPI,
            });
        } else if (contextStrategy === CONTEXT_STRATEGIES.FULL_HISTORY) {
            apiMessages = prepareMessagesForAPI(
                updatedMessages,
                contextStrategy,
                selectedMessageIds.length > 0 ? selectedMessageIds : undefined,
                null,
                5,
                settings.systemMessage || ""
            );
        } else if (contextStrategy === CONTEXT_STRATEGIES.SUMMARIZATION) {
            apiMessages = prepareMessagesForAPI(
                updatedMessages,
                contextStrategy,
                [],
                summaryData,
                5,
                settings.systemMessage || ""
            );
        } else if (contextStrategy === CONTEXT_STRATEGIES.SLIDING_WINDOW) {
            apiMessages = prepareMessagesForAPI(
                updatedMessages,
                contextStrategy,
                [],
                null,
                windowSize,
                settings.systemMessage || ""
            );
        } else {
            apiMessages = prepareMessagesForAPI(
                updatedMessages,
                contextStrategy,
                [],
                null,
                5,
                settings.systemMessage || ""
            );
        }

        const totalApiTokens = apiMessages.reduce((total, msg) => {
            return total + Math.ceil(msg.content.length / 4);
        }, 0);

        if (totalApiTokens > maxContextTokens) {
            alert(
                `Cannot send message: Total context (${totalApiTokens.toLocaleString()} tokens) exceeds limit (${maxContextTokens.toLocaleString()} tokens).\n\n` +
                    `Please try:\n` +
                    `• Switch to a different context strategy (e.g., Sliding Window or Summarization)\n` +
                    `• Reduce window size or deselect some messages\n` +
                    `• Increase Max Context Tokens in settings\n` +
                    `• Shorten your message or remove attachments`
            );
            return;
        }

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

        if (
            contextStrategy === CONTEXT_STRATEGIES.SUMMARIZATION &&
            summarizationMode === "auto"
        ) {
            handleSummarizeConversation();
        }

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

            {showContextWarning && (
                <div className="context-warning-banner">
                    <IoWarning size={20} />
                    <span>
                        Context limit approaching (
                        {getTokenPercentage(
                            historyTokenCount,
                            maxContextTokens
                        )}
                        %). Consider using a different context strategy.
                    </span>
                    <button
                        className="dismiss-warning-btn"
                        onClick={() => setShowContextWarning(false)}
                    >
                        <IoClose size={18} />
                    </button>
                </div>
            )}

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
                        <div className="selectors-group">
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

                            {contextStrategy ===
                                CONTEXT_STRATEGIES.SUMMARIZATION &&
                                summarizationMode === "manual" &&
                                conversation.messages.length > 0 && (
                                    <button
                                        className="summarize-quick-btn"
                                        onClick={handleSummarizeConversation}
                                        title="Summarize conversation"
                                    >
                                        ✨
                                    </button>
                                )}

                            <button
                                className="context-settings-btn"
                                onClick={() => setShowContextSettings(true)}
                                title="Context management settings"
                            >
                                <IoDocumentTextOutline size={18} />
                            </button>
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
                                isLoading || tokenCount >= maxContextTokens
                            }
                            title={
                                tokenCount >= maxContextTokens
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
                                tokenCount >= maxContextTokens
                                    ? "Token limit exceeded..."
                                    : "Send a message..."
                            }
                            rows={1}
                            disabled={
                                isLoading || tokenCount > maxContextTokens
                            }
                        />
                        <button
                            onClick={handleSend}
                            disabled={
                                !input.trim() ||
                                isLoading ||
                                tokenCount > maxContextTokens
                            }
                            className="send-btn"
                            title={
                                tokenCount > maxContextTokens
                                    ? "Token limit exceeded"
                                    : "Send message"
                            }
                        >
                            <IoSend size={20} />
                        </button>
                    </div>
                </div>

                <div className="token-counter">
                    {tokenCount >
                        (maxContextTokens - systemMessageTokens) * 0.8 && (
                        <span className="token-warning">⚠️</span>
                    )}
                    {systemMessageTokens > 0 && (
                        <>
                            <span
                                className={`token-count token-${getTokenColor(
                                    getTokenPercentage(
                                        systemMessageTokens,
                                        maxContextTokens
                                    )
                                )}`}
                                title="System message token count (configured in Settings)"
                            >
                                System: {systemMessageTokens.toLocaleString()} /{" "}
                                {maxContextTokens.toLocaleString()} tokens (
                                {getTokenPercentage(
                                    systemMessageTokens,
                                    maxContextTokens
                                )}
                                %)
                            </span>
                            <span className="token-separator">|</span>
                        </>
                    )}
                    <span
                        className={`token-count token-${getTokenColor(
                            getTokenPercentage(
                                tokenCount,
                                maxContextTokens
                            )
                        )}`}
                        title="Current message and attachments token count"
                    >
                        Input: {tokenCount.toLocaleString()} /{" "}
                        {maxContextTokens.toLocaleString()}{" "}
                        tokens (
                        {getTokenPercentage(
                            tokenCount,
                            maxContextTokens
                        )}
                        %)
                    </span>
                    <span className="token-separator">|</span>
                    <span
                        className={`token-count token-${getTokenColor(
                            getTokenPercentage(
                                historyTokenCount,
                                maxContextTokens
                            )
                        )}`}
                        title="Conversation history token limit (configured in Settings)"
                    >
                        Context: {historyTokenCount.toLocaleString()} /{" "}
                        {maxContextTokens.toLocaleString()} tokens (
                        {getTokenPercentage(
                            historyTokenCount,
                            maxContextTokens
                        )}
                        %)
                    </span>
                    <span className="token-separator">|</span>
                    <span className="token-info">
                        Max: {getMaxContextTokens().toLocaleString()} tokens
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

            <ContextSettingsModal
                show={showContextSettings}
                onClose={() => setShowContextSettings(false)}
                contextStrategy={contextStrategy}
                onStrategyChange={handleStrategyChange}
                windowSize={windowSize}
                onWindowSizeChange={handleWindowSizeChange}
                totalMessages={conversation?.messages.length || 0}
                onOpenMessageSelector={() => setShowMessageSelector(true)}
                selectedMessageCount={selectedMessageIds.length}
                onSummarize={handleSummarizeConversation}
                summarizationMode={summarizationMode}
                onSummarizationModeChange={handleSummarizationModeChange}
                historyTokenCount={historyTokenCount}
                maxContextTokens={maxContextTokens}
                getTokenPercentage={getTokenPercentage}
                getTokenColor={getTokenColor}
            />

            {showMessageSelector && conversation && (
                <MessageSelector
                    messages={conversation.messages}
                    maxTokens={maxContextTokens}
                    selectedMessageIds={selectedMessageIds}
                    onSelectionChange={setSelectedMessageIds}
                    onClose={() => setShowMessageSelector(false)}
                    onApply={() => setShowMessageSelector(false)}
                />
            )}
        </div>
    );
}

export default ChatArea;
