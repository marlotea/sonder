import React, { useState, useEffect, useRef } from "react";

const ShootingStarField = () => {
    const [stars, setStars] = useState([]);
    const [pausedStarId, setPausedStarId] = useState(null);
    const requestRef = useRef();
    const lastUpdateRef = useRef(Date.now());
    const [stories, setStories] = useState([]);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await fetch(
                    "http://localhost:4000/api/stories"
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log("Data received:", data);

                // Assuming data is an array of objects with 'story' field
                setStories(data);
            } catch (error) {
                console.error("Fetching data failed:", error);
                setStories([]);
            }
        };

        fetchStories();
    }, []);
    // Create a new star with consistent circular motion
    const createStar = () => {
        const id = Math.random().toString(36).substr(2, 9);
        const story =
            stories[Math.floor(Math.random() * stories.length)]["story"];
        const baseSize = 4;
        const sizeMultiplier = 1 + story.length / 50;
        const size = Math.min(baseSize * sizeMultiplier, baseSize * 2.5);

        // All stars will move around the same center point but at different distances
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const minRadius = Math.min(window.innerWidth, window.innerHeight) * 0.3;
        const maxRadius = Math.min(window.innerWidth, window.innerHeight) * 0.8;
        const radius = minRadius + Math.random() * (maxRadius - minRadius);

        return {
            id,
            story,
            size,
            startTime: Date.now(),
            pausedAt: null,
            totalPausedTime: 0,
            duration: 40000 + Math.random() * 20000,
            centerX,
            centerY,
            radius,
            startAngle: Math.random() * Math.PI * 2,
        };
    };

    useEffect(() => {
        // Only create stars if we actually have stories in the array
        if (stories.length > 0) {
            const initialStars = Array(10).fill(null).map(createStar);
            setStars(initialStars);
        }
    }, [stories]);

    const animate = () => {
        const currentTime = Date.now();
        lastUpdateRef.current = currentTime;

        setStars((prevStars) => {
            return prevStars.map((star) => {
                if (star.id === pausedStarId) {
                    if (!star.pausedAt) {
                        return { ...star, pausedAt: currentTime };
                    }
                    return star;
                }

                if (star.pausedAt) {
                    return {
                        ...star,
                        pausedAt: null,
                        startTime:
                            currentTime - (star.pausedAt - star.startTime),
                        totalPausedTime:
                            star.totalPausedTime +
                            (currentTime - star.pausedAt),
                    };
                }

                const effectiveTime =
                    currentTime - star.startTime - star.totalPausedTime;
                if (effectiveTime > star.duration) {
                    return createStar();
                }
                return star;
            });
        });
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [pausedStarId]);

    return (
        <div className="fixed inset-0 overflow-hidden bg-black pointer-events-none">
            {stars.map((star) => (
                <ShootingStar
                    key={star.id}
                    star={star}
                    onHover={(hovering) =>
                        setPausedStarId(hovering ? star.id : null)
                    }
                />
            ))}
        </div>
    );
};

const ShootingStar = ({ star, onHover }) => {
    const [isHovered, setIsHovered] = useState(false);

    const handleHover = (hovering) => {
        setIsHovered(hovering);
        onHover(hovering);
    };

    // Calculate position based on time, accounting for pauses
    const effectiveTime = star.pausedAt
        ? star.pausedAt - star.startTime - star.totalPausedTime
        : Date.now() - star.startTime - star.totalPausedTime;
    const progress = effectiveTime / star.duration;
    const angle = star.startAngle + progress * Math.PI * 2;

    const x = star.centerX + Math.cos(angle) * star.radius;
    const y = star.centerY + Math.sin(angle) * star.radius;

    return (
        <div
            className="absolute pointer-events-auto"
            style={{
                transform: `translate(${x}px, ${y}px) rotate(${
                    angle + Math.PI / 2
                }rad)`,
                transition: "transform 16ms linear",
                width: `${star.size * 5}px`, // Larger wrapper
                height: `${star.size * 5}px`, // Larger wrapper
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
            onMouseEnter={() => handleHover(true)}
            onMouseLeave={() => handleHover(false)}
        >
            <div className="relative">
                {/* Previous star content remains the same */}
                <div
                    className="absolute bg-gradient-to-l from-white via-white to-transparent"
                    style={{
                        width: `${star.size * 8}px`,
                        height: `${star.size / 2}px`,
                        transform: "translateX(-100%)",
                        opacity: 0.4,
                    }}
                />
                {/* Star */}
                <div
                    className="absolute bg-white rounded-full"
                    style={{
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        boxShadow: `0 0 ${star.size * 2}px ${
                            star.size / 2
                        }px rgba(255, 255, 255, 0.8)`,
                    }}
                />
                {/* Hover text */}
                {isHovered && (
                    <div
                        className="absolute text-white whitespace-nowrap bg-black/50 px-2 py-1 rounded"
                        style={{
                            transform: "translate(-50%, -200%) rotate(-90deg)", // Counteract the rotation
                            transition: "opacity 0.2s",
                        }}
                    >
                        {star.story}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShootingStarField;
