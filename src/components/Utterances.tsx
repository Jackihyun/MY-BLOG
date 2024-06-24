"use client";
import React, { useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import { themeState } from "@/store/theme";
import { sidebarState } from "@/store/sidebarState";

const Utterances: React.FC = () => {
  const [theme] = useRecoilState(themeState);
  const [isSidebarOpen] = useRecoilState(sidebarState);

  const utterances_theme =
    theme.value === "light" ? "github-light" : "github-dark";

  return (
    <div
      className={`relative ${isSidebarOpen ? "z-[-1]" : "z-10"}`}
      ref={(elem) => {
        if (!elem) {
          return;
        }
        const scriptElem = document.createElement("script");
        scriptElem.src = "https://utteranc.es/client.js";
        scriptElem.async = true;
        scriptElem.crossOrigin = "anonymous";
        scriptElem.setAttribute("repo", "Jackihyun/blog-comments");
        scriptElem.setAttribute("issue-term", "pathname");
        scriptElem.setAttribute("theme", utterances_theme);
        scriptElem.setAttribute("label", "comments");
        elem.replaceChildren(scriptElem);
      }}
    />
  );
};

export default Utterances;
