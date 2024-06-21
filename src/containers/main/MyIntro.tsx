import React from "react";
import Image from "next/image";

export default function MyIntro() {
  return (
    <div>
      <div className="flex flex-col pt-[35px] px-[10px] justify-start gap-1 text-[18px] mb-5 font-medium">
        <p>안녕하세요!</p>
        <p>Frontend를 좋아하는</p>
        <p>개발자 Jack입니다.</p>
      </div>
      <div className="flex flex-col md:flex-row">
        <Image
          src="/images/MyIntroVideo.gif"
          alt="My Intro"
          className="items-center p-2 rounded-2xl max-w-[720px] w-full h-auto object-cover"
          width={600}
          height={300}
        />
        <div className="flex flex-col p-2 md:ml-3">
          <p className="font-bold text-[14px] md:text-[18px] mt-2 md:mt-4">
            새로운 경험을 좋아하고 프론트엔드 개발자를
            <br /> 꿈꾸는 Jack입니다.
          </p>
          <p className="font-medium text-[12px] md:text-[14px] mt-2">
            기술을 깊게 공부하는 것도 좋지만 저는 다양한 기술을 사용해보고
            프로덕트를 만드는 것이 더 재미있습니다. 새로운 기술을 접할 때마다 그
            기술의 가능성에 대해 궁금해하고, 이를 활용하여 무엇을 만들어낼 수
            있을지 고민합니다. 명확하고 가독성 좋은 코드를 작성하는 것에 관심이
            많으며, 정보를 공유하는 것에 기쁨을 느낍니다. 컴퓨터 공학을 전공
            했고, 요즘은 프론트엔드 개발자를 꿈꾸며 사용자에게 편리하고 즐거운
            경험을 제공하는 프로덕트를 만들기 위해 노력하고 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
