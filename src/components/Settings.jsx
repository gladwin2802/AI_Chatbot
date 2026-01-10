import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { saveSettings } from "../utils/storage";
import { fetchAvailableModels } from "../utils/openai";
import "../styles/Settings.css";

function Settings({ settings, onClose, onSave }) {
    const [formData, setFormData] = useState({
        baseUrl: settings.baseUrl || "",
        apiKey: settings.apiKey || "",
        model: settings.model || "",
        temperature: settings.temperature || 0.7,
        maxTokens: settings.maxTokens || 2000,
    });

    const [availableModels, setAvailableModels] = useState([]);
    const [loadingModels, setLoadingModels] = useState(false);
    const [modelsError, setModelsError] = useState(null);

    const currentModel = availableModels.find((m) => m.id === formData.model);

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

    const handleModelChange = (e) => {
        const newModelId = e.target.value;
        const model = availableModels.find((m) => m.id === newModelId);
        const maxOutput = getMaxOutputTokens(model);

        setFormData({
            ...formData,
            model: newModelId,
            maxTokens: Math.min(formData.maxTokens, maxOutput),
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveSettings(formData);
        onSave(formData);
    };

    return (
        <div className="settings-overlay" onClick={onClose}>
            <div
                className="settings-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button
                        className="close-btn"
                        onClick={onClose}
                        title="Close settings"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="settings-content">
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
                            <select
                                value={formData.model}
                                onChange={handleModelChange}
                                disabled={
                                    loadingModels ||
                                    availableModels.length === 0
                                }
                            >
                                {loadingModels && (
                                    <option value="">Loading models...</option>
                                )}
                                {!loadingModels &&
                                    availableModels.length === 0 && (
                                        <option value="">
                                            {modelsError
                                                ? "Failed to load models"
                                                : "Enter Base URL first"}
                                        </option>
                                    )}
                                {availableModels.map((model) => (
                                    <option key={model.id} value={model.id}>
                                        {model.id}
                                    </option>
                                ))}
                            </select>
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
                    </div>

                    <div className="settings-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="cancel-btn"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="save-btn">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Settings;
