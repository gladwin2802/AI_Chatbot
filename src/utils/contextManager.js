export const CONTEXT_STRATEGIES = {
    LAST_MESSAGE: "lastMessage",
    FULL_HISTORY: "fullHistory",
    SUMMARIZATION: "summarization",
    SLIDING_WINDOW: "slidingWindow",
};

export const estimateMessageTokens = (message) => {
    let tokens = Math.ceil(message.content.length / 4);
    
    if (message.attachedFiles && message.attachedFiles.length > 0) {
        message.attachedFiles.forEach((file) => {
            tokens += Math.ceil(file.content.length / 4);
        });
    }
    
    return tokens;
};

export const calculateTotalTokens = (messages) => {
    return messages.reduce((total, msg) => total + estimateMessageTokens(msg), 0);
};

export const getTokenPercentage = (current, max) => {
    return Math.round((current / max) * 100);
};

export const getTokenColor = (percentage) => {
    if (percentage < 50) return "green";
    if (percentage < 80) return "yellow";
    return "red";
};

export const selectRecentMessagesWithinLimit = (messages, maxTokens) => {
    const selected = [];
    let totalTokens = 0;
    
    for (let i = messages.length - 1; i >= 0; i--) {
        const msgTokens = estimateMessageTokens(messages[i]);
        if (totalTokens + msgTokens <= maxTokens) {
            selected.unshift(messages[i].id);
            totalTokens += msgTokens;
        } else {
            break;
        }
    }
    
    return selected;
};

export const generateMessagePreview = (message) => {
    const words = message.content.trim().split(/\s+/);
    return words.slice(0, 5).join(" ") + (words.length > 5 ? "..." : "");
};

export const createSimpleSummary = (messages) => {
    const userMessages = messages.filter(m => m.role === "user");
    const topics = userMessages.map(m => generateMessagePreview(m)).join("; ");
    return `Previous conversation topics: ${topics}`;
};

export const prepareMessagesForAPI = (
    messages,
    strategy,
    selectedMessageIds = [],
    summaryData = null,
    windowSize = 5,
    systemMessage = ""
) => {
    const apiMessages = [];
    
    if (systemMessage && systemMessage.trim()) {
        apiMessages.push({
            role: "system",
            content: systemMessage.trim(),
        });
    }
    
    switch (strategy) {
        case CONTEXT_STRATEGIES.LAST_MESSAGE: {
            const lastMessage = messages[messages.length - 1];
            apiMessages.push({
                role: lastMessage.role,
                content: lastMessage.content,
            });
            return apiMessages;
        }
        
        case CONTEXT_STRATEGIES.FULL_HISTORY: {
            if (selectedMessageIds.length > 0) {
                const selectedMessages = messages.filter(msg => 
                    selectedMessageIds.includes(msg.id)
                );
                selectedMessages.forEach(msg => {
                    apiMessages.push({
                        role: msg.role,
                        content: msg.content + (msg.attachedFiles?.length > 0
                            ? "\n\n--- Attached Files ---\n" +
                              msg.attachedFiles.map(f => `\n[File: ${f.name}]\n${f.content}\n`).join("")
                            : ""),
                    });
                });
                return apiMessages;
            }
            
            messages.forEach(msg => {
                apiMessages.push({
                    role: msg.role,
                    content: msg.content + (msg.attachedFiles?.length > 0
                        ? "\n\n--- Attached Files ---\n" +
                          msg.attachedFiles.map(f => `\n[File: ${f.name}]\n${f.content}\n`).join("")
                        : ""),
                });
            });
            return apiMessages;
        }
        
        case CONTEXT_STRATEGIES.SLIDING_WINDOW: {
            const recentMessages = messages.slice(-windowSize);
            recentMessages.forEach(msg => {
                apiMessages.push({
                    role: msg.role,
                    content: msg.content + (msg.attachedFiles?.length > 0
                        ? "\n\n--- Attached Files ---\n" +
                          msg.attachedFiles.map(f => `\n[File: ${f.name}]\n${f.content}\n`).join("")
                        : ""),
                });
            });
            return apiMessages;
        }
        
        case CONTEXT_STRATEGIES.SUMMARIZATION: {
            if (summaryData && summaryData.summary) {
                if (systemMessage && systemMessage.trim()) {
                    apiMessages[0].content = systemMessage.trim() + "\n\n" + summaryData.summary;
                } else {
                    apiMessages.push({
                        role: "system",
                        content: summaryData.summary,
                    });
                }
                
                const messagesAfterSummary = messages.slice(summaryData.lastSummarizedIndex + 1);
                messagesAfterSummary.forEach(msg => {
                    apiMessages.push({
                        role: msg.role,
                        content: msg.content + (msg.attachedFiles?.length > 0
                            ? "\n\n--- Attached Files ---\n" +
                              msg.attachedFiles.map(f => `\n[File: ${f.name}]\n${f.content}\n`).join("")
                            : ""),
                    });
                });
            } else {
                messages.forEach(msg => {
                    apiMessages.push({
                        role: msg.role,
                        content: msg.content + (msg.attachedFiles?.length > 0
                            ? "\n\n--- Attached Files ---\n" +
                              msg.attachedFiles.map(f => `\n[File: ${f.name}]\n${f.content}\n`).join("")
                            : ""),
                    });
                });
            }
            
            return apiMessages;
        }
        
        default:
            messages.forEach(msg => {
                apiMessages.push({
                    role: msg.role,
                    content: msg.content,
                });
            });
            return apiMessages;
    }
};
