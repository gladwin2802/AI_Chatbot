import { IoClose, IoSettings } from "react-icons/io5";
import { CONTEXT_STRATEGIES } from "../utils/contextManager";
import ContextStrategySelector from "./ContextStrategySelector";
import WindowSizeSelector from "./WindowSizeSelector";
import "../styles/ContextSettingsModal.css";

function ContextSettingsModal({
    show,
    onClose,
    contextStrategy,
    onStrategyChange,
    windowSize,
    onWindowSizeChange,
    totalMessages,
    onOpenMessageSelector,
    selectedMessageCount,
    onSummarize,
    summarizationMode,
    onSummarizationModeChange,
    historyTokenCount,
    maxTokens,
    getTokenPercentage,
    getTokenColor,
}) {
    if (!show) return null;

    return (
        <div className="context-settings-overlay" onClick={onClose}>
            <div
                className="context-settings-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="context-settings-header">
                    <div className="header-title">
                        <IoSettings size={20} />
                        <h3>Context Management</h3>
                    </div>
                    <button
                        className="context-settings-close"
                        onClick={onClose}
                        title="Close"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="context-settings-body">
                    <div className="settings-section">
                        <label className="section-label">
                            Context Strategy
                        </label>
                        <ContextStrategySelector
                            currentStrategy={contextStrategy}
                            onStrategyChange={onStrategyChange}
                        />
                    </div>

                    {contextStrategy === CONTEXT_STRATEGIES.SLIDING_WINDOW &&
                        totalMessages > 0 && (
                            <div className="settings-section">
                                <label className="section-label">
                                    Window Size
                                </label>
                                <WindowSizeSelector
                                    windowSize={windowSize}
                                    onWindowSizeChange={onWindowSizeChange}
                                    totalMessages={totalMessages}
                                />
                            </div>
                        )}

                    {contextStrategy === CONTEXT_STRATEGIES.FULL_HISTORY &&
                        totalMessages > 0 && (
                            <div className="settings-section">
                                <label className="section-label">
                                    Message Selection
                                </label>
                                <button
                                    className="action-btn"
                                    onClick={() => {
                                        onOpenMessageSelector();
                                        onClose();
                                    }}
                                >
                                    📋 Select Messages ({selectedMessageCount})
                                </button>
                            </div>
                        )}

                    {contextStrategy === CONTEXT_STRATEGIES.SUMMARIZATION &&
                        totalMessages > 0 && (
                            <div className="settings-section">
                                <label className="section-label">
                                    Summarization Mode
                                </label>
                                <div className="summarization-mode-options">
                                    <label className="mode-option">
                                        <input
                                            type="radio"
                                            name="summarization-mode"
                                            value="auto"
                                            checked={
                                                summarizationMode === "auto"
                                            }
                                            onChange={(e) =>
                                                onSummarizationModeChange(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <div className="mode-info">
                                            <span className="mode-name">
                                                🤖 Auto-Summarization
                                            </span>
                                            <span className="mode-description">
                                                Automatically summarize when
                                                sending messages
                                            </span>
                                        </div>
                                    </label>
                                    <label className="mode-option">
                                        <input
                                            type="radio"
                                            name="summarization-mode"
                                            value="manual"
                                            checked={
                                                summarizationMode === "manual"
                                            }
                                            onChange={(e) =>
                                                onSummarizationModeChange(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <div className="mode-info">
                                            <span className="mode-name">
                                                ✋ Manual Summarization
                                            </span>
                                            <span className="mode-description">
                                                Click the ✨ button in the
                                                messaging area to manually
                                                summarize
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                    <div className="settings-section context-info-section">
                        <label className="section-label">Context Status</label>
                        <div className="context-status-card">
                            <div className="status-item">
                                <span className="status-label">
                                    History Tokens:
                                </span>
                                <span
                                    className={`status-value token-${getTokenColor(
                                        getTokenPercentage(
                                            historyTokenCount,
                                            maxTokens
                                        )
                                    )}`}
                                >
                                    {historyTokenCount.toLocaleString()} /{" "}
                                    {maxTokens.toLocaleString()}
                                </span>
                            </div>
                            <div className="status-item">
                                <span className="status-label">Usage:</span>
                                <span
                                    className={`status-value token-${getTokenColor(
                                        getTokenPercentage(
                                            historyTokenCount,
                                            maxTokens
                                        )
                                    )}`}
                                >
                                    {getTokenPercentage(
                                        historyTokenCount,
                                        maxTokens
                                    )}
                                    %
                                </span>
                            </div>
                            {totalMessages > 0 && (
                                <div className="status-item">
                                    <span className="status-label">
                                        Total Messages:
                                    </span>
                                    <span className="status-value">
                                        {totalMessages}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContextSettingsModal;
