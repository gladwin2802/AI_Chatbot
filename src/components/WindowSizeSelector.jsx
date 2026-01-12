import { useState, useEffect, useRef } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import "../styles/WindowSizeSelector.css";

function WindowSizeSelector({ windowSize, onWindowSizeChange, totalMessages }) {
    const [showDropdown, setShowDropdown] = useState(false);
    const [customValue, setCustomValue] = useState(windowSize);
    const dropdownRef = useRef(null);

    useEffect(() => {
        setCustomValue(windowSize);
    }, [windowSize]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const presetSizes = [3, 5, 10, 15, 20, 30, 50];

    const handleIncrement = () => {
        const newSize = Math.min(windowSize + 1, totalMessages || 100);
        onWindowSizeChange(newSize);
    };

    const handleDecrement = () => {
        const newSize = Math.max(windowSize - 1, 1);
        onWindowSizeChange(newSize);
    };

    const handlePresetSelect = (size) => {
        onWindowSizeChange(size);
        setShowDropdown(false);
    };

    const handleCustomChange = (e) => {
        const value = e.target.value;
        if (value === "" || /^\d+$/.test(value)) {
            setCustomValue(value);
        }
    };

    const handleCustomApply = () => {
        const numValue = parseInt(customValue, 10);
        if (!isNaN(numValue) && numValue > 0) {
            const finalValue = Math.min(numValue, totalMessages || 100);
            onWindowSizeChange(finalValue);
            setCustomValue(finalValue);
        } else {
            setCustomValue(windowSize);
        }
        setShowDropdown(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleCustomApply();
        } else if (e.key === "Escape") {
            setCustomValue(windowSize);
            setShowDropdown(false);
        }
    };

    return (
        <div className="window-size-selector" ref={dropdownRef}>
            <div className="window-size-display">
                <button
                    className="window-size-btn decrement"
                    onClick={handleDecrement}
                    disabled={windowSize <= 1}
                    title="Decrease window size"
                >
                    <IoChevronDown size={14} />
                </button>
                
                <button
                    className="window-size-value"
                    onClick={() => setShowDropdown(!showDropdown)}
                    title={`Last ${windowSize} message${windowSize !== 1 ? 's' : ''}`}
                >
                    <span className="window-number">{windowSize}</span>
                </button>

                <button
                    className="window-size-btn increment"
                    onClick={handleIncrement}
                    disabled={totalMessages && windowSize >= totalMessages}
                    title="Increase window size"
                >
                    <IoChevronUp size={14} />
                </button>
            </div>

            {showDropdown && (
                <div className="window-size-dropdown">
                    <div className="dropdown-header">
                        Window Size
                    </div>
                    
                    <div className="preset-sizes">
                        {presetSizes.map((size) => (
                            <button
                                key={size}
                                className={`preset-btn ${size === windowSize ? "active" : ""}`}
                                onClick={() => handlePresetSelect(size)}
                                disabled={totalMessages && size > totalMessages}
                            >
                                {size}
                            </button>
                        ))}
                    </div>

                    <div className="custom-size">
                        <label>Custom:</label>
                        <input
                            type="text"
                            value={customValue}
                            onChange={handleCustomChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter size"
                            className="custom-input"
                        />
                        <button
                            className="apply-custom-btn"
                            onClick={handleCustomApply}
                        >
                            Apply
                        </button>
                    </div>

                    {totalMessages && (
                        <div className="window-info">
                            Total messages: {totalMessages}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default WindowSizeSelector;
