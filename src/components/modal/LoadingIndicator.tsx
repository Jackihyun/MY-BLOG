import React from "react";
import Image from "next/image";

const LoadingIndicator = () => (
  <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-[#e8e8e8] dark:bg-[#212121] bg-opacity-75 z-50">
    {/* <Image
      src="/public/images/loading.gif"
      alt="Loading"
      width={100}
      height={100}
    /> */}
    <p className="text-[18px] sm:text-[24px] md:text-[32px]">Loading...</p>
  </div>
);

export default LoadingIndicator;
