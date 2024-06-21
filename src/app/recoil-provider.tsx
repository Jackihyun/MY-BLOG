"use client"; // 클라이언트 컴포넌트로 선언합니다.

import { ReactNode } from "react";
import { RecoilRoot } from "recoil";

interface RecoilProviderProps {
  children: ReactNode;
}

export default function RecoilProvider({ children }: RecoilProviderProps) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
