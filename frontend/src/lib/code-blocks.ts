"use client";

function toDisplayLanguageName(language: string): string {
  const normalized = language.toLowerCase();
  const aliases: Record<string, string> = {
    plaintext: "Plain",
    text: "Plain",
    javascript: "JavaScript",
    js: "JavaScript",
    typescript: "TypeScript",
    ts: "TypeScript",
    jsx: "JSX",
    tsx: "TSX",
    xml: "HTML",
    html: "HTML",
    css: "CSS",
    json: "JSON",
    bash: "Bash",
    shell: "Shell",
    sh: "Shell",
    java: "Java",
    sql: "SQL",
    yaml: "YAML",
    yml: "YAML",
  };

  return aliases[normalized] || normalized.toUpperCase();
}

function extractCodeLanguage(codeElement: HTMLElement | null): string {
  if (!codeElement) return "plaintext";

  const className = codeElement.className || "";
  const languageClass = className.match(/language-([\w-]+)/i);
  if (languageClass?.[1]) {
    return languageClass[1];
  }

  const hljsClass = className.match(/lang(?:uage)?-([\w-]+)/i);
  if (hljsClass?.[1]) {
    return hljsClass[1];
  }

  return "plaintext";
}

export function enhanceCodeBlocks(
  container: ParentNode,
  onCopySuccess?: (message: string) => void,
  onCopyError?: (message: string) => void
) {
  const codeBlocks = container.querySelectorAll("pre");

  codeBlocks.forEach((preElement) => {
    const pre = preElement as HTMLElement;
    const code = pre.querySelector("code");
    if (!code) return;

    const language = extractCodeLanguage(code as HTMLElement);
    pre.dataset.codeLanguage = language;

    let toolbar = pre.querySelector(".code-block-toolbar") as HTMLDivElement | null;
    if (!toolbar) {
      toolbar = document.createElement("div");
      toolbar.className = "code-block-toolbar";
      pre.prepend(toolbar);
    }

    let badge = toolbar.querySelector(".code-block-language") as HTMLSpanElement | null;
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "code-block-language";
      toolbar.appendChild(badge);
    }
    badge.textContent = toDisplayLanguageName(language);

    let button = toolbar.querySelector(".code-block-copy") as HTMLButtonElement | null;
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "code-block-copy";
      toolbar.appendChild(button);
    }

    button.textContent = "복사";
    button.setAttribute("aria-label", "코드 복사");
    button.onclick = async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const codeText = code.textContent || "";
      try {
        await navigator.clipboard.writeText(codeText);
        button!.dataset.copied = "true";
        onCopySuccess?.("코드가 복사되었습니다.");
        window.setTimeout(() => {
          button!.dataset.copied = "false";
        }, 1600);
      } catch (error) {
        console.error("Failed to copy code block:", error);
        onCopyError?.("코드 복사에 실패했습니다.");
      }
    };

    button.dataset.copied = "false";
    button.innerHTML = `
      <span class="sr-only">코드 복사</span>
      <svg class="code-block-copy-icon code-block-copy-icon-default" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V5a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-2M8 7h8a2 2 0 012 2v8" />
      </svg>
      <svg class="code-block-copy-icon code-block-copy-icon-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    `;
  });
}
