"use client";
import React, { useState, useEffect } from "react";

const DarkModeToggle: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="w-8 h-8 rounded-full bg-[#212121] dark:bg-[#e8e8e8] text-white dark:text-black fixed top-12 right-5"
    >
      {darkMode ? "L" : "D"}
    </button>
  );
};

export default DarkModeToggle;
