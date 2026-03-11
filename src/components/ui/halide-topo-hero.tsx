"use client";

import React, { useEffect, useRef } from "react";

interface HalideTopoHeroProps {
    children: React.ReactNode;
}

export const HalideTopoHero: React.FC<HalideTopoHeroProps> = ({ children }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Mouse Parallax Logic
        const handleMouseMove = (e: MouseEvent) => {
            if (window.innerWidth < 768) return; // Prevent heavy math frame updates on touch hardware

            const x = (window.innerWidth / 2 - e.pageX) / 25;
            const y = (window.innerHeight / 2 - e.pageY) / 25;

            // Rotate the 3D Canvas - slight adjustment for hero legibility
            canvas.style.transform = `rotateX(${55 + y / 2}deg) rotateZ(${-25 + x / 2}deg)`;

            // Apply depth shift to layers
            layersRef.current.forEach((layer, index) => {
                if (!layer) return;
                const depth = (index + 1) * 15;
                const moveX = x * (index + 1) * 0.2;
                const moveY = y * (index + 1) * 0.2;
                layer.style.transform = `translateZ(${depth}px) translate(${moveX}px, ${moveY}px)`;
            });
        };

        // Entrance Animation
        canvas.style.opacity = "0";
        canvas.style.transform = "rotateX(90deg) rotateZ(0deg) scale(0.8)";

        const timeout = setTimeout(() => {
            const isMobile = window.innerWidth < 768;
            canvas.style.transition = "all 2.5s cubic-bezier(0.16, 1, 0.3, 1)";
            canvas.style.opacity = "1";
            canvas.style.transform = `rotateX(55deg) rotateZ(-25deg) scale(${isMobile ? 1.2 : 1.5})`;
        }, 300);

        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden w-full bg-[#0a0a0a]">
            <style>{`
                .contours {
                    position: absolute;
                    width: 200%; height: 200%;
                    top: -50%; left: -50%;
                    background-image: repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, rgba(255,255,255,0.05) 41px, transparent 42px);
                    transform: translateZ(120px);
                    pointer-events: none;
                }
            `}</style>

            {/* SVG Filter for Grain - Strictly hidden on mobile to protect scroll frames */}
            <svg className="hidden lg:block" style={{ position: "absolute", width: 0, height: 0 }}>
                <filter id="grain">
                    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </svg>

            {/* Grain Overlay - scoped to hero only (fixed caused pointer-events bug in Chromium) */}
            <div className="hidden lg:block absolute inset-0 pointer-events-none z-[1] opacity-15" style={{ filter: "url(#grain)" }}></div>

            {/* Viewport for 3D Transform */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden pointer-events-none [perspective:2000px]">
                {/* Canvas */}
                <div
                    ref={canvasRef}
                    className="relative w-[250vw] h-[150vh] sm:w-[150vw] [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                    {/* Layer 1 */}
                    <div
                        ref={(el) => { if (el) layersRef.current[0] = el; }}
                        className="absolute inset-[-20%] border border-white/5 bg-cover bg-center transition-transform duration-500 grayscale contrast-125 brightness-50"
                        style={{ backgroundImage: "url('/images/BCR Cover Photo.png')" }}
                    ></div>
                    {/* Layer 2 */}
                    <div
                        ref={(el) => { if (el) layersRef.current[1] = el; }}
                        className="absolute inset-[-20%] border border-white/5 bg-cover bg-center transition-transform duration-500 grayscale contrast-110 brightness-75 opacity-60 mix-blend-screen"
                        style={{ backgroundImage: "url('/images/BCR Cover Photo.png')" }}
                    ></div>
                    {/* Layer 3 */}
                    <div
                        ref={(el) => { if (el) layersRef.current[2] = el; }}
                        className="absolute inset-[-20%] border border-white/5 bg-cover bg-center transition-transform duration-500 grayscale contrast-125 brightness-[0.8] opacity-40 mix-blend-overlay"
                        style={{ backgroundImage: "url('/images/BCR Cover Photo.png')" }}
                    ></div>

                    <div className="contours"></div>
                </div>
            </div>

            {/* Standard hero gradient cutoff for smooth blending */}
            <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/20 via-brand-dark/60 to-brand-dark z-10 pointer-events-none"></div>

            {/* Content Container (z-20 inside App.tsx matches this, but we'll wrap children) */}
            <div className="relative z-20 w-full px-6 flex flex-col items-center text-center">
                {children}
            </div>
        </div>
    );
};
