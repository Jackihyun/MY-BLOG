import React from "react";
import Utterances from "@/components/Utterances";

const Guest: React.FC = () => {
  return (
    <>
      <div className="mt-7 flex flex-col justify-center items-center ">
        <p className="text-[24px]">🎉🎉🎉</p>
        <p>반가워요!</p>
        <p>자유롭게 방명록을 작성해주세요 :)</p>
        <div className="w-full pt-14 ">
          <Utterances />
        </div>
      </div>
    </>
  );
};

export default Guest;
