import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './SplashScreen.css';
import logo from '../../assets/logo.png'; // Verify this path

const SplashScreen = ({ onFinish }) => {
    const containerRef = useRef(null);
    const logoRef = useRef(null);
    const barRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({
            onComplete: () => {
                // Optional fade out before unmounting
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: onFinish
                });
            }
        });

        // Initial State is handled in CSS or via set here, but let's be explicit
        gsap.set(logoRef.current, { x: '100vw', opacity: 1 });
        gsap.set(barRef.current, { scaleX: 0 });

        // Step 1: Logo enters from right to center
        tl.to(logoRef.current, {
            x: 0,
            duration: 1.2,
            ease: 'power3.out',
        })
            // Step 2: Fade in text and Move up
            .to(logoRef.current, {
                y: -50,
                duration: 0.8,
                ease: 'power2.inOut'
            })
            .to(textRef.current, {
                opacity: 1,
                y: -40, // Position it under the logo
                duration: 0.5,
            }, "<0.3") // Start slightly before the move up ends

            // Step 3: Loading Bar fills
            .to(barRef.current, {
                scaleX: 1,
                duration: 2,
                ease: 'linear',
            });

    }, [onFinish]);

    return (
        <div className="splash-container" ref={containerRef}>
            <div className="splash-content" ref={logoRef}>
                <img src={logo} alt="Sanraw Logo" className="splash-logo" />
            </div>
            <h1 className="splash-text" ref={textRef}>SANRAW</h1>
            <div className="loading-bar-container">
                <div className="loading-bar" ref={barRef}></div>
            </div>
        </div>
    );
};

export default SplashScreen;
