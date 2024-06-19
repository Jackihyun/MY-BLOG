// "use client";

// import React, { useEffect, useRef } from "react";

// const Utterances: React.FC = () => {
//   const containerRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const scriptElem = document.createElement("script");
//     scriptElem.src = "https://utteranc.es/client.js";
//     scriptElem.async = true;
//     scriptElem.setAttribute("repo", "Jackihyun/blog-comments");
//     scriptElem.setAttribute("issue-term", "pathname");
//     scriptElem.setAttribute("theme", "github-light");
//     scriptElem.crossOrigin = "anonymous";

//     const currentContainer = containerRef.current;
//     if (currentContainer) {
//       currentContainer.appendChild(scriptElem);
//     }

//     // Cleanup function to remove the script when component unmounts
//     return () => {
//       if (currentContainer) {
//         currentContainer.innerHTML = "";
//       }
//     };
//   }, [containerRef]);

//   return <div ref={containerRef} />;
// };

// export default Utterances;
