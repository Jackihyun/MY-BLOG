"use client";

import React from "react";
import CommentList from "@/components/comments/CommentList";

const Guest: React.FC = () => {
  return (
    <>
      <div className="mt-7 flex flex-col justify-center items-center">
        <p className="text-[24px]">🎉🎉🎉</p>
        <p className="text-gray-800 dark:text-gray-200">반가워요!</p>
        <p className="text-gray-600 dark:text-gray-400">
          자유롭게 방명록을 작성해주세요 :)
        </p>
        <div className="w-full pt-8">
          <CommentList slug="guestbook" />
        </div>
      </div>
    </>
  );
};

export default Guest;
