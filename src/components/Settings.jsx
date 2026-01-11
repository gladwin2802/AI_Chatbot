import { useState, useEffect, useRef } from "react";
import { IoClose, IoChevronDown } from "react-icons/io5";
import { saveSettings } from "../utils/storage";
import { fetchAvailableModels } from "../utils/openai";
import "../styles/Settings.css";

function Settings({ settings, onClose, onSave, isRequired = false }) {
    const [formData, setFormData] = useState({
        baseUrl: settings.baseUrl || "",
        apiKey: settings.apiKey || "",
        model: settings.model || "",
        temperature: settings.temperature || 0.7,
        maxTokens: settings.maxTokens || 2000,
        systemMessage: settings.systemMessage || "",
    });

    const [availableModels, setAvailableModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [modelsError, setModelsError] = useState(null);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [modelSearchQuery, setModelSearchQuery] = useState("");
    const modelDropdownRef = useRef(null);

    const currentModel = availableModels.find((m) => m.id === formData.model);

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

    useEffect(() => {
        const loadModels = async () => {
            if (!formData.baseUrl) {
                setAvailableModels([]);
                return;
            }

            setLoadingModels(true);
            setModelsError(null);

            try {
                const models = await fetchAvailableModels(
                    formData.baseUrl,
                    formData.apiKey
                );

                const uniqueModels = models.filter(
                    (model, index, self) =>
                        index === self.findIndex((m) => m.id === model.id)
                );

                setAvailableModels(uniqueModels);

                if (uniqueModels.length > 0 && !formData.model) {
                    setFormData((prev) => ({
                        ...prev,
                        model: uniqueModels[0].id,
                    }));
                }
            } catch (error) {
                setModelsError(error.message);
                setAvailableModels([]);
            } finally {
                setLoadingModels(false);
            }
        };

        loadModels();
    }, [formData.baseUrl, formData.apiKey]);

    const getMaxOutputTokens = (model) => {
        if (!model) return 32000;

        const maxTokens = model.max_completion_tokens || model.max_tokens;
        if (maxTokens && maxTokens > 0) {
            return maxTokens;
        }

        if (model.context_length && model.context_length > 0) {
            return Math.min(Math.floor(model.context_length * 0.5), 128000);
        }

        return 32000;
    };

    useEffect(() => {
        if (currentModel) {
            const maxOutput = getMaxOutputTokens(currentModel);
            setFormData((prev) => ({
                ...prev,
                maxTokens: Math.min(prev.maxTokens, maxOutput),
            }));
        }
    }, [formData.model]);

    const handleModelSelect = (modelId) => {
        const model = availableModels.find((m) => m.id === modelId);
        const maxOutput = getMaxOutputTokens(model);

        setFormData({
            ...formData,
            model: modelId,
            maxTokens: Math.min(formData.maxTokens, maxOutput),
        });
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

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isRequired && (!formData.baseUrl || !formData.apiKey)) {
            alert("Please enter both Base URL and API Key to continue.");
            return;
        }
        
        saveSettings(formData);
        onSave(formData);
    };

    const handleClose = () => {
        if (!isRequired) {
            onClose();
        }
    };

    return (
        <div className="settings-overlay" onClick={handleClose}>
            <div
                className="settings-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="settings-header">
                    <h2>{isRequired ? "Setup Required" : "Settings"}</h2>
                    {!isRequired && (
                        <button
                            className="close-btn"
                            onClick={onClose}
                            title="Close settings"
                        >
                            <IoClose size={24} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="settings-content">
                        {isRequired && (
                            <div className="setup-message">
                                Please configure your Base URL and API Key to get
                                started.
                            </div>
                        )}
                        <div className="form-group">
                            <label>Base URL</label>
                            <input
                                type="url"
                                value={formData.baseUrl}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        baseUrl: e.target.value,
                                    })
                                }
                                placeholder="https://api.lightning.ai/v1"
                                required
                            />
                            <div className="form-help">
                                API endpoint base URL
                            </div>
                        </div>

                        <div className="form-group">
                            <label>API Key</label>
                            <input
                                type="password"
                                value={formData.apiKey}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        apiKey: e.target.value,
                                    })
                                }
                                placeholder="Enter your API key"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Model</label>
                            <div 
                                className="settings-model-selector"
                                ref={modelDropdownRef}
                            >
                                <button
                                    type="button"
                                    className="settings-model-trigger-btn"
                                    onClick={() =>
                                        setShowModelDropdown(!showModelDropdown)
                                    }
                                    disabled={
                                        loadingModels ||
                                        availableModels.length === 0
                                    }
                                    title={formData.model || "Select a model"}
                                >
                                    <span className="model-name">
                                        {loadingModels
                                            ? "Loading models..."
                                            : availableModels.length === 0
                                            ? modelsError
                                                ? "Failed to load models"
                                                : "Enter Base URL first"
                                            : getShortModelName(formData.model)}
                                    </span>
                                    <IoChevronDown size={16} />
                                </button>

                                {showModelDropdown && (
                                    <div className="settings-model-dropdown-menu">
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
                                                            formData.model
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
                            {modelsError && (
                                <div className="form-error">{modelsError}</div>
                            )}
                            {currentModel && (
                                <div className="model-info">
                                    {currentModel.context_length > 0 && (
                                        <div className="model-info-item">
                                            <span className="info-label">
                                                Max Context:
                                            </span>
                                            <span className="info-value">
                                                {currentModel.context_length.toLocaleString()}{" "}
                                                tokens
                                            </span>
                                        </div>
                                    )}
                                    {(currentModel.max_completion_tokens > 0 ||
                                        currentModel.max_tokens > 0) && (
                                        <div className="model-info-item">
                                            <span className="info-label">
                                                Max Output:
                                            </span>
                                            <span className="info-value">
                                                {(
                                                    currentModel.max_completion_tokens ||
                                                    currentModel.max_tokens
                                                ).toLocaleString()}{" "}
                                                tokens
                                            </span>
                                        </div>
                                    )}
                                    {currentModel.owned_by && (
                                        <div className="model-info-item">
                                            <span className="info-label">
                                                Provider:
                                            </span>
                                            <span className="info-value">
                                                {currentModel.owned_by}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Temperature: {formData.temperature}</label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={formData.temperature}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        temperature: parseFloat(e.target.value),
                                    })
                                }
                            />
                            <div className="range-labels">
                                <span>Precise</span>
                                <span>Creative</span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>
                                Max Output Tokens: {formData.maxTokens}
                            </label>
                            <input
                                type="range"
                                min="100"
                                max={getMaxOutputTokens(currentModel)}
                                step="100"
                                value={formData.maxTokens}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maxTokens: parseInt(e.target.value),
                                    })
                                }
                            />
                            <div className="range-labels">
                                <span>100</span>
                                <span>
                                    {getMaxOutputTokens(
                                        currentModel
                                    ).toLocaleString()}
                                </span>
                            </div>
                            {!currentModel?.max_completion_tokens &&
                                !currentModel?.max_tokens &&
                                currentModel && (
                                    <div className="form-help">
                                        Max output estimated as{" "}
                                        {currentModel.context_length > 0
                                            ? `${Math.floor(
                                                  currentModel.context_length *
                                                      0.5
                                              ).toLocaleString()} (50% of context)`
                                            : "32,000 (default)"}
                                    </div>
                                )}
                        </div>

                        <div className="form-group">
                            <label>System Message (Optional)</label>
                            <textarea
                                className="system-message-textarea"
                                value={formData.systemMessage}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        systemMessage: e.target.value,
                                    })
                                }
                                placeholder="Enter a system message to guide AI behavior (e.g., 'You are a helpful assistant...')"
                                rows={3}
                            />
                            <div className="form-help">
                                This message will be included in all conversations regardless of context strategy
                            </div>
                        </div>
                    </div>

                    <div className="settings-footer">
                        {!isRequired && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                        )}
                        <button type="submit" className="save-btn">
                            {isRequired ? "Get Started" : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Settings;
