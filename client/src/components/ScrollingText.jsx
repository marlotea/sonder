import React, { useEffect, useRef, useState, useCallback } from "react";
import "./ScrollingText.css";

const ScrollingText = () => {
    const [prompts, setPrompts] = useState([]);
    const containerRef = useRef(null);
    const [transformAmount, setTransformAmount] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);

    const scrollSpeed = 10;

    useEffect(() => {
        fetch("http://localhost:4000/api/prompts")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("Data received:", data);
                setPrompts(["", "", ...(data.prompts || [])]);
            })
            .catch((error) => {
                console.error("Fetching data failed:", error);
                setPrompts([]);
            });
    }, []);

    const snapToMiddle = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        const containerHeight = container.offsetHeight;
        const middlePosition = containerHeight / 2;

        let closestDistance = Infinity;
        let closestIndex = 0;

        const textElements = container.querySelectorAll(
            ".scrolling-text-content"
        );

        textElements.forEach((element, index) => {
            const elementTop =
                element.getBoundingClientRect().top -
                container.getBoundingClientRect().top;
            const elementMiddle = elementTop + element.offsetHeight / 2;

            const distanceToMiddle = Math.abs(elementMiddle - middlePosition);
            if (distanceToMiddle < closestDistance) {
                closestDistance = distanceToMiddle;
                closestIndex = index;
            }
        });

        setActiveIndex(closestIndex);

        const activeElement = textElements[closestIndex];
        if (activeElement) {
            const elementTop =
                activeElement.getBoundingClientRect().top -
                container.getBoundingClientRect().top;
            const elementMiddle = elementTop + activeElement.offsetHeight / 2;
            const adjustment = middlePosition - elementMiddle;

            setTransformAmount((prev) => {
                const newTransform = prev + adjustment;
                return Math.min(
                    Math.max(newTransform, -(prompts.length - 1) * 50), // Clamp to top
                    0 // Clamp to bottom
                );
            });
        }
    }, [prompts.length]);

    const handleScroll = useCallback(
        (e) => {
            const delta = e.deltaY;

            setTransformAmount((prev) => {
                const newTransform =
                    delta > 0 ? prev - scrollSpeed : prev + scrollSpeed;
                return Math.min(
                    Math.max(newTransform, -(prompts.length - 1) * 50), // Prevent scrolling past top
                    0 // Prevent scrolling past bottom
                );
            });

            if (containerRef.current) {
                clearTimeout(containerRef.current.snapTimeout);
                containerRef.current.snapTimeout = setTimeout(
                    snapToMiddle,
                    150
                );
            }
        },
        [snapToMiddle, prompts.length]
    );

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("wheel", handleScroll);

        snapToMiddle();

        return () => {
            container.removeEventListener("wheel", handleScroll);
        };
    }, [handleScroll, snapToMiddle]);

    return (
        <div className="container" ref={containerRef}>
            <div
                className="scrolling-text"
                style={{
                    transform: `translateY(${transformAmount}px)`,
                }}
            >
                {prompts.map((text, index) => (
                    <div
                        key={index}
                        className="scrolling-text-content"
                        style={{
                            opacity: index === activeIndex ? 1 : 0.5,
                            transition: "opacity 0.3s ease",
                        }}
                    >
                        {text}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScrollingText;
