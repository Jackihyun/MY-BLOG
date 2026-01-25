"use client";

import { ReactNode } from "react";
import { RecoilRoot } from "recoil";
import { QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/queryClient";
import LoadingIndicator from "@/components/modal/LoadingIndicator";
import { useRouteChange } from "@/utils/hooks/useRouteChange";

interface ProvidersProps {
  children: ReactNode;
}

function LoadingWrapper({ children }: { children: ReactNode }) {
  const isLoading = useRouteChange();
  return (
    <>
      {isLoading && <LoadingIndicator />}
      {children}
    </>
  );
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <LoadingWrapper>
            {children}
          </LoadingWrapper>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "var(--toast-bg, #fff)",
                color: "var(--toast-color, #1f2937)",
                border: "1px solid var(--toast-border, #e5e7eb)",
              },
            }}
          />
        </QueryClientProvider>
      </RecoilRoot>
    </SessionProvider>
  );
}
