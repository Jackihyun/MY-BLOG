import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const useRouteChange = () => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    // 원래 있던 1초 로딩 대신 220ms 정도로 가벼운 전환만 유지
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 220);

    return () => clearTimeout(timer);
  }, [pathname]);

  return isLoading;
};
