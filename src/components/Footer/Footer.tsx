"use client";

import { useState } from "react";
import LoginModal from "@/components/admin/LoginModal";
import { useAuth } from "@/hooks/useAuth";

export default function Footer() {
  const [clickCount, setClickCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleNameClick = () => {
    if (isAuthenticated) return;

    const newCount = clickCount + 1;
    if (newCount >= 5) {
      setShowLoginModal(true);
      setClickCount(0);
    } else {
      setClickCount(newCount);
      setTimeout(() => setClickCount(0), 3000);
    }
  };

  return (
    <>
      <footer className="flex justify-center items-center w-full py-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
        <p>
          &copy; {new Date().getFullYear()} Developed by{" "}
          <span
            onClick={handleNameClick}
            className={`cursor-pointer select-none hover:text-gray-900 dark:hover:text-white transition-colors ${
              clickCount > 0 ? "text-blue-500" : ""
            }`}
          >
            Jackihyun
          </span>
          {isAuthenticated && (
            <span className="ml-2 text-green-500 text-xs">(Admin)</span>
          )}
        </p>
      </footer>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}
