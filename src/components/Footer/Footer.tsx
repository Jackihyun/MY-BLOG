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
      <footer className="flex justify-center items-center w-full h-[40px] md:h-[60px] text-[13px] md:text-[16px] bg-[#f7f8fa] dark:bg-[#2c2d2e] font-roboto-regular">
        <p>
          &copy; Developed by{" "}
          <span
            onClick={handleNameClick}
            className={`cursor-pointer select-none ${
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
