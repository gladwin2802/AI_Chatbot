import { useState, useRef, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import { CONTEXT_STRATEGIES } from "../utils/contextManager";
import "../styles/ContextStrategySelector.css";

function ContextStrategySelector({ currentStrategy, onStrategyChange }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const strategies = [
        {
            id: CONTEXT_STRATEGIES.LAST_MESSAGE,
            name: "Current Message Alone",
            description: "Send only current message without history (memoryless)",
        },
        {
            id: CONTEXT_STRATEGIES.SLIDING_WINDOW,
            name: "Sliding Window",
            description: "Send last N messages (configurable window size)",
        },
        {
            id: CONTEXT_STRATEGIES.FULL_HISTORY,
            name: "Full History",
            description: "Send all messages with selective control when limit reached",
        },
        {
            id: CONTEXT_STRATEGIES.SUMMARIZATION,
            name: "Summarization",
            description: "Summarize older messages to save tokens",
        },
    ];

    const currentStrategyObj = strategies.find(s => s.id === currentStrategy);

    return (
        <div className="context-strategy-selector" ref={dropdownRef}>
            <button
                className="strategy-trigger-btn"
                onClick={() => setShowDropdown(!showDropdown)}
                title={currentStrategyObj?.description}
            >
                <span className="strategy-name">{currentStrategyObj?.name}</span>
                <IoChevronDown size={14} />
            </button>

            {showDropdown && (
                <div className="strategy-dropdown-menu">
                    <div className="strategy-dropdown-header">
                        Context Strategy
                    </div>
                    <div className="strategy-list">
                        {strategies.map((strategy) => (
                            <div
                                key={strategy.id}
                                className={`strategy-item ${
                                    strategy.id === currentStrategy ? "active" : ""
                                }`}
                                onClick={() => {
                                    onStrategyChange(strategy.id);
                                    setShowDropdown(false);
                                }}
                            >
                                <div className="strategy-item-header">
                                    <span className="strategy-item-name">
                                        {strategy.name}
                                    </span>
                                </div>
                                <div className="strategy-item-description">
                                    {strategy.description}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default ContextStrategySelector;
