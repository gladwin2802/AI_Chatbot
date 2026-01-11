import { useState, useEffect } from "react";
import { IoClose, IoCheckmark } from "react-icons/io5";
import {
    estimateMessageTokens,
    generateMessagePreview,
    getTokenPercentage,
    getTokenColor,
    selectRecentMessagesWithinLimit,
} from "../utils/contextManager";
import "../styles/MessageSelector.css";

function MessageSelector({
    messages,
    maxTokens,
    selectedMessageIds,
    onSelectionChange,
    onClose,
    onApply,
}) {
    const [localSelected, setLocalSelected] = useState(selectedMessageIds);
    const [totalTokens, setTotalTokens] = useState(0);

    useEffect(() => {
        const total = messages
            .filter(msg => localSelected.includes(msg.id))
            .reduce((sum, msg) => sum + estimateMessageTokens(msg), 0);
        setTotalTokens(total);
    }, [localSelected, messages]);

    const handleToggleMessage = (messageId) => {
        const lastMessage = messages[messages.length - 1];
        if (messageId === lastMessage.id) {
            return;
        }

        setLocalSelected(prev =>
            prev.includes(messageId)
                ? prev.filter(id => id !== messageId)
                : [...prev, messageId]
        );
    };

    const handleSelectRecent = () => {
        const recentIds = selectRecentMessagesWithinLimit(messages, maxTokens);
        setLocalSelected(recentIds);
    };

    const handleApply = () => {
        onSelectionChange(localSelected);
        onApply();
    };

    const percentage = getTokenPercentage(totalTokens, maxTokens);
    const tokenColor = getTokenColor(percentage);
    const lastMessageId = messages[messages.length - 1]?.id;

    const groupedMessages = [];
    for (let i = 0; i < messages.length; i += 2) {
        const userMsg = messages[i];
        const aiMsg = messages[i + 1];
        groupedMessages.push({ userMsg, aiMsg });
    }

    return (
        <div className="message-selector-overlay" onClick={onClose}>
            <div className="message-selector-modal" onClick={(e) => e.stopPropagation()}>
                <div className="message-selector-header">
                    <h3>Select Messages to Include</h3>
                    <button
                        className="message-selector-close"
                        onClick={onClose}
                        title="Close"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="message-selector-info">
                    <div className={`token-info token-${tokenColor}`}>
                        <span className="token-count-large">
                            {totalTokens.toLocaleString()} / {maxTokens.toLocaleString()} tokens
                        </span>
                        <span className="token-percentage">({percentage}%)</span>
                    </div>
                    <button className="select-recent-btn" onClick={handleSelectRecent}>
                        Auto-select Recent
                    </button>
                </div>

                <div className="message-selector-list">
                    {groupedMessages.map((group, index) => {
                        const { userMsg, aiMsg } = group;
                        const userTokens = estimateMessageTokens(userMsg);
                        const aiTokens = aiMsg ? estimateMessageTokens(aiMsg) : 0;
                        const pairTokens = userTokens + aiTokens;

                        const userSelected = localSelected.includes(userMsg.id);
                        const aiSelected = aiMsg ? localSelected.includes(aiMsg.id) : false;
                        const isLastPair = !aiMsg || aiMsg.id === lastMessageId;

                        const userDisabled = userMsg.id === lastMessageId;
                        const aiDisabled = aiMsg && aiMsg.id === lastMessageId;

                        return (
                            <div key={index} className="message-pair">
                                <div className="message-pair-header">
                                    Message Pair #{groupedMessages.length - index}
                                    <span className="pair-tokens">{pairTokens} tokens</span>
                                </div>

                                <div
                                    className={`message-selector-item ${
                                        userSelected ? "selected" : ""
                                    } ${userDisabled ? "disabled" : ""}`}
                                    onClick={() => !userDisabled && handleToggleMessage(userMsg.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={userSelected}
                                        disabled={userDisabled}
                                        onChange={() => {}}
                                        className="message-checkbox"
                                    />
                                    <div className="message-info">
                                        <div className="message-role user-role">You</div>
                                        <div className="message-preview">
                                            {generateMessagePreview(userMsg)}
                                        </div>
                                    </div>
                                    <div className="message-tokens">{userTokens} tokens</div>
                                </div>

                                {aiMsg && (
                                    <div
                                        className={`message-selector-item ${
                                            aiSelected ? "selected" : ""
                                        } ${aiDisabled ? "disabled" : ""}`}
                                        onClick={() => !aiDisabled && handleToggleMessage(aiMsg.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={aiSelected}
                                            disabled={aiDisabled}
                                            onChange={() => {}}
                                            className="message-checkbox"
                                        />
                                        <div className="message-info">
                                            <div className="message-role ai-role">AI</div>
                                            <div className="message-preview">
                                                {generateMessagePreview(aiMsg)}
                                            </div>
                                        </div>
                                        <div className="message-tokens">{aiTokens} tokens</div>
                                    </div>
                                )}

                                {isLastPair && userDisabled && (
                                    <div className="current-message-note">
                                        Current message (always included)
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="message-selector-footer">
                    <button className="cancel-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="apply-btn"
                        onClick={handleApply}
                        disabled={totalTokens > maxTokens}
                    >
                        <IoCheckmark size={18} />
                        Apply Selection
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MessageSelector;
