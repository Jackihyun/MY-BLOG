import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const useRouteChange = () => {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    // Simulate route change completion after a delay
    // You can adjust the delay or use a more appropriate method to detect when the new route has fully loaded
    const timeoutId = setTimeout(handleComplete, 1000);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return isLoading;
};
