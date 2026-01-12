const CONVERSATIONS_KEY = "ai_chatbot_conversations";
const SETTINGS_KEY = "ai_chatbot_settings";
const THEME_KEY = "ai_chatbot_theme";
const CONTEXT_STRATEGY_KEY = "ai_chatbot_context_strategy";
const CONVERSATION_SUMMARIES_KEY = "ai_chatbot_conversation_summaries";
const WINDOW_SIZE_KEY = "ai_chatbot_window_size";
const SUMMARIZATION_MODE_KEY = "ai_chatbot_summarization_mode";
const SYSTEM_MESSAGE_KEY = "ai_chatbot_system_message";

export const loadConversations = () => {
    try {
        const data = localStorage.getItem(CONVERSATIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading conversations:", error);
        return [];
    }
};

export const saveConversations = (conversations) => {
    try {
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch (error) {
        console.error("Error saving conversations:", error);
    }
};

export const loadSettings = () => {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            const systemMsg = localStorage.getItem(SYSTEM_MESSAGE_KEY);
            return {
                ...parsed,
                systemMessage: systemMsg || parsed.systemMessage || "",
            };
        }
        return {
            baseUrl: "",
            apiKey: "",
            model: "",
            temperature: 0.7,
            maxTokens: 2000,
            maxContextTokens: 100000,
            systemMessage: "",
        };
    } catch (error) {
        console.error("Error loading settings:", error);
        return {
            baseUrl: "",
            apiKey: "",
            model: "",
            temperature: 0.7,
            maxTokens: 2000,
            maxContextTokens: 100000,
            systemMessage: "",
        };
    }
};

export const saveSettings = (settings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        if (settings.systemMessage !== undefined) {
            localStorage.setItem(SYSTEM_MESSAGE_KEY, settings.systemMessage);
        }
    } catch (error) {
        console.error("Error saving settings:", error);
    }
};

export const loadTheme = () => {
    try {
        const theme = localStorage.getItem(THEME_KEY);
        return theme || "dark";
    } catch (error) {
        console.error("Error loading theme:", error);
        return "dark";
    }
};

export const saveTheme = (theme) => {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        console.error("Error saving theme:", error);
    }
};

export const loadContextStrategy = () => {
    try {
        const strategy = localStorage.getItem(CONTEXT_STRATEGY_KEY);
        return strategy || "lastMessage";
    } catch (error) {
        console.error("Error loading context strategy:", error);
        return "lastMessage";
    }
};

export const saveContextStrategy = (strategy) => {
    try {
        localStorage.setItem(CONTEXT_STRATEGY_KEY, strategy);
    } catch (error) {
        console.error("Error saving context strategy:", error);
    }
};

export const loadConversationSummaries = () => {
    try {
        const data = localStorage.getItem(CONVERSATION_SUMMARIES_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error("Error loading conversation summaries:", error);
        return {};
    }
};

export const saveConversationSummaries = (summaries) => {
    try {
        localStorage.setItem(
            CONVERSATION_SUMMARIES_KEY,
            JSON.stringify(summaries)
        );
    } catch (error) {
        console.error("Error saving conversation summaries:", error);
    }
};

export const loadWindowSize = () => {
    try {
        const size = localStorage.getItem(WINDOW_SIZE_KEY);
        return size ? parseInt(size, 10) : 5;
    } catch (error) {
        console.error("Error loading window size:", error);
        return 5;
    }
};

export const saveWindowSize = (size) => {
    try {
        localStorage.setItem(WINDOW_SIZE_KEY, size.toString());
    } catch (error) {
        console.error("Error saving window size:", error);
    }
};

export const loadSummarizationMode = () => {
    try {
        const mode = localStorage.getItem(SUMMARIZATION_MODE_KEY);
        return mode || "manual";
    } catch (error) {
        console.error("Error loading summarization mode:", error);
        return "manual";
    }
};

export const saveSummarizationMode = (mode) => {
    try {
        localStorage.setItem(SUMMARIZATION_MODE_KEY, mode);
    } catch (error) {
        console.error("Error saving summarization mode:", error);
    }
};

export const loadSystemMessage = () => {
    try {
        const message = localStorage.getItem(SYSTEM_MESSAGE_KEY);
        return message || "";
    } catch (error) {
        console.error("Error loading system message:", error);
        return "";
    }
};

export const saveSystemMessage = (message) => {
    try {
        localStorage.setItem(SYSTEM_MESSAGE_KEY, message);
    } catch (error) {
        console.error("Error saving system message:", error);
    }
};
