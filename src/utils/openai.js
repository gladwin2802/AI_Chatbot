const needsProxy = (baseUrl) => {
    const isDevelopment = import.meta.env.DEV;
    if (!isDevelopment) return false;
    
    const corsBlockedDomains = ['lightning.ai'];
    return corsBlockedDomains.some(domain => baseUrl.includes(domain));
};

export const sendMessageToOpenAI = async (apiMessages, settings) => {
    const { baseUrl, apiKey, model, temperature, maxTokens } = settings;

    if (!baseUrl) {
        throw new Error(
            "Base URL is not configured. Please set it in settings."
        );
    }

    let apiEndpoint;
    if (needsProxy(baseUrl)) {
        apiEndpoint = "/api/v1/chat/completions";
    } else {
        apiEndpoint = baseUrl.endsWith("/")
            ? `${baseUrl}chat/completions`
            : `${baseUrl}/chat/completions`;
    }

    const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: apiMessages,
            temperature: temperature,
            max_tokens: maxTokens,
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(
            error.error?.message || "Failed to get response from API"
        );
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

export const fetchAvailableModels = async (baseUrl, apiKey) => {
    if (!baseUrl) {
        throw new Error("Base URL is required to fetch models");
    }

    let apiEndpoint;
    if (needsProxy(baseUrl)) {
        apiEndpoint = "/api/v1/models";
    } else {
        apiEndpoint = baseUrl.endsWith("/")
            ? `${baseUrl}models`
            : `${baseUrl}/models`;
    }

    const response = await fetch(apiEndpoint, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch models from API");
    }

    const data = await response.json();
    return data.data || [];
};
