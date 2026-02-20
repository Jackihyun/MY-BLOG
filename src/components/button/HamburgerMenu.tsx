import React, { useState } from "react";

const HamburgerMenu = ({
  isChecked,
  onToggle,
}: {
  isChecked: boolean;
  onToggle: () => void;
}) => {
  return (
    <button
      className="hamburger cursor-pointer z-50 p-1"
      onClick={onToggle}
      aria-label={isChecked ? "Close menu" : "Open menu"}
      aria-expanded={isChecked}
      aria-controls="mobile-sidebar"
    >
      <svg
        viewBox="0 0 34 34"
        className={`w-8 h-8 transition-transform duration-600 ease-in-out ${
          isChecked ? "transform -rotate-45" : ""
        }`}
      >
        <path
          className={`line line-top-bottom transition-all duration-600 ease-in-out ${
            isChecked ? "hamburger-open" : ""
          }`}
          d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
        ></path>
        <path
          className="line transition-all duration-600 ease-in-out"
          d="M7 16 27 16"
        >        </path>
      </svg>
    </button>
  );
};

export default HamburgerMenu;
