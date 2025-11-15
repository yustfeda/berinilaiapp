import React from 'react';

interface AnimatedHamburgerIconProps {
    isOpen: boolean;
}

const AnimatedHamburgerIcon: React.FC<AnimatedHamburgerIconProps> = ({ isOpen }) => {
    const baseClass = "block absolute h-0.5 w-5 bg-current transition-all duration-300 ease-in-out";
    const topBarClass = isOpen ? "rotate-45" : "-translate-y-1.5";
    const middleBarClass = isOpen ? "opacity-0" : "";
    const bottomBarClass = isOpen ? "-rotate-45" : "translate-y-1.5";

    return (
        <div className="w-6 h-6 relative" role="img" aria-label={isOpen ? "Tutup menu" : "Buka menu"}>
            <span className={`${baseClass} ${topBarClass}`}></span>
            <span className={`${baseClass} ${middleBarClass}`}></span>
            <span className={`${baseClass} ${bottomBarClass}`}></span>
        </div>
    );
};

export default AnimatedHamburgerIcon;
