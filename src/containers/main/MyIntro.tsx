import React from "react";

const MyIntro: React.FC = () => {
  return (
    <div>
      <div className="flex flex-col gap-1 text-[30px]">
        <p>안녕하세요!</p>
        <p>Frontend를 좋아하는</p>
        <p>개발자 Jack입니다.</p>
      </div>
    </div>
  );
};

export default MyIntro;
