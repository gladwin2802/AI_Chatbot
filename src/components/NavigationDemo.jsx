import { useState, useEffect, useRef } from 'react';
import { IoClose, IoChevronForward } from 'react-icons/io5';
import '../styles/NavigationDemo.css';

function NavigationDemo({ onClose, onSkip, settingsButtonRef }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState({ top: 0, left: null });
    const demoRef = useRef(null);

    const steps = [
        {
            title: "Welcome to Your Project!",
            description: "You can access project settings from the header. Let's show you where it is.",
            action: "Next"
        },
        {
            title: "Project Settings",
            description: "Click the settings button in the header to configure system instructions and upload files for this project.",
            action: "Got it"
        }
    ];

    useEffect(() => {
        if (currentStep === 1) {
            const updatePosition = () => {
                if (!settingsButtonRef?.current) {
                    setTimeout(updatePosition, 50);
                    return;
                }

                const rect = settingsButtonRef.current.getBoundingClientRect();
                const tooltipWidth = 300;
                const spacing = 10;
                const viewportWidth = window.innerWidth;

                const buttonRightEdge = rect.right;
                const tooltipLeft = buttonRightEdge - tooltipWidth;

                let finalLeft = tooltipLeft;

                if (tooltipLeft < spacing) {
                    finalLeft = viewportWidth - tooltipWidth - spacing;
                }

                setPosition({
                    top: rect.bottom + spacing,
                    left: finalLeft
                });
            };

            updatePosition();

            const timeoutId = setTimeout(updatePosition, 100);
            const intervalId = setInterval(updatePosition, 200);

            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);

            return () => {
                clearTimeout(timeoutId);
                clearInterval(intervalId);
                window.removeEventListener('resize', updatePosition);
                window.removeEventListener('scroll', updatePosition, true);
            };
        } else {
            setPosition({ top: 0, left: null });
        }
    }, [currentStep, settingsButtonRef]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handleSkip = () => {
        onSkip();
        onClose();
    };

    if (currentStep === 0) {
        return (
            <div className="navigation-demo-overlay" onClick={handleSkip}>
                <div
                    className="navigation-demo-modal"
                    onClick={(e) => e.stopPropagation()}
                    ref={demoRef}
                >
                    <div className="navigation-demo-header">
                        <h2>{steps[currentStep].title}</h2>
                        <button
                            className="close-btn"
                            onClick={handleSkip}
                            title="Skip"
                        >
                            <IoClose size={20} />
                        </button>
                    </div>
                    <div className="navigation-demo-content">
                        <p>{steps[currentStep].description}</p>
                    </div>
                    <div className="navigation-demo-footer">
                        <button
                            type="button"
                            onClick={handleSkip}
                            className="skip-btn"
                        >
                            Skip
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            className="next-btn"
                        >
                            {steps[currentStep].action}
                            <IoChevronForward size={16} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="navigation-demo-overlay" onClick={handleSkip} />
            <div
                className="navigation-demo-tooltip"
                style={{
                    top: position.top > 0 ? `${position.top}px` : '60px',
                    left: position.left !== null ? `${position.left}px` : 'auto',
                    right: position.left === null ? '20px' : 'auto'
                }}
                ref={demoRef}
            >
                <div className="navigation-demo-tooltip-header">
                    <h3>{steps[currentStep].title}</h3>
                    <button
                        className="close-btn"
                        onClick={handleSkip}
                        title="Skip"
                    >
                        <IoClose size={16} />
                    </button>
                </div>
                <div className="navigation-demo-tooltip-content">
                    <p>{steps[currentStep].description}</p>
                </div>
                <div className="navigation-demo-tooltip-footer">
                    <button
                        type="button"
                        onClick={handleSkip}
                        className="skip-btn"
                    >
                        Skip
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        className="next-btn"
                    >
                        {steps[currentStep].action}
                        <IoChevronForward size={14} />
                    </button>
                </div>
            </div>
        </>
    );
}

export default NavigationDemo;

