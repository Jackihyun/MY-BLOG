"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Extension } from "@tiptap/core";
import { common, createLowlight } from "lowlight";
import { useCallback, useEffect, useRef, useState } from "react";
import { uploadImage } from "@/lib/api";
import { enhanceCodeBlocks } from "@/lib/code-blocks";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const lowlight = createLowlight(common);
const CODE_LANGUAGES = [
  { label: "Plain", value: "plaintext" },
  { label: "JS", value: "javascript" },
  { label: "TS", value: "typescript" },
  { label: "JSX", value: "jsx" },
  { label: "TSX", value: "tsx" },
  { label: "HTML", value: "xml" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Bash", value: "bash" },
  { label: "Java", value: "java" },
  { label: "SQL", value: "sql" },
  { label: "YAML", value: "yaml" },
] as const;
const IMAGE_CROP_PRESETS = [
  { label: "원본", value: "original" },
  { label: "16:9", value: "16 / 9" },
  { label: "4:3", value: "4 / 3" },
  { label: "1:1", value: "1 / 1" },
] as const;

type ImageCropPreset = (typeof IMAGE_CROP_PRESETS)[number]["value"];

const EditorImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (element) => element.style.width || element.getAttribute("width") || "100%",
      },
      align: {
        default: "center",
        parseHTML: (element) => {
          const marginLeft = element.style.marginLeft;
          const marginRight = element.style.marginRight;

          if (marginLeft === "auto" && marginRight !== "auto") {
            return "right";
          }
          if (marginRight === "auto" && marginLeft !== "auto") {
            return "left";
          }
          return "center";
        },
      },
      cropAspect: {
        default: "original",
        parseHTML: (element) =>
          element.getAttribute("data-crop-aspect") || "original",
        renderHTML: (attributes) => ({
          "data-crop-aspect": attributes.cropAspect || "original",
        }),
      },
      cropX: {
        default: "50",
        parseHTML: (element) => element.getAttribute("data-crop-x") || "50",
        renderHTML: (attributes) => ({
          "data-crop-x": attributes.cropX || "50",
        }),
      },
      cropY: {
        default: "50",
        parseHTML: (element) => element.getAttribute("data-crop-y") || "50",
        renderHTML: (attributes) => ({
          "data-crop-y": attributes.cropY || "50",
        }),
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    const cropAspect = HTMLAttributes.cropAspect || "original";
    const cropX = HTMLAttributes.cropX || "50";
    const cropY = HTMLAttributes.cropY || "50";
    const width = HTMLAttributes.width || "100%";
    const align = HTMLAttributes.align || "center";

    const marginStyle =
      align === "left"
        ? "display:block;margin:0 auto 0 0"
        : align === "right"
          ? "display:block;margin:0 0 0 auto"
          : "display:block;margin:0 auto";

    const styleParts = [
      `width:${width}`,
      marginStyle,
      cropAspect === "original"
        ? "height:auto"
        : `aspect-ratio:${cropAspect};object-fit:cover;object-position:${cropX}% ${cropY}%`,
    ];

    return [
      "img",
      {
        ...HTMLAttributes,
        style: styleParts.join(";"),
      },
    ];
  },
});

const TextAlign = Extension.create({
  name: "textAlign",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          textAlign: {
            default: "left",
            parseHTML: (element: HTMLElement) =>
              element.style.textAlign || "left",
            renderHTML: (attributes: { textAlign?: string }) =>
              attributes.textAlign && attributes.textAlign !== "left"
                ? { style: `text-align: ${attributes.textAlign}` }
                : {},
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setTextAlign:
        (alignment: "left" | "center" | "right") =>
        ({ commands }: { commands: { updateAttributes: (type: string, attrs: Record<string, string>) => boolean } }) =>
          commands.updateAttributes("paragraph", { textAlign: alignment }) ||
          commands.updateAttributes("heading", { textAlign: alignment }),
    } as Record<string, unknown>;
  },
});

const CodeBlockTabBehavior = Extension.create({
  name: "codeBlockTabBehavior",
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (!this.editor.isActive("codeBlock")) {
          return false;
        }
        return this.editor.commands.insertContent("  ");
      },
      "Shift-Tab": () => {
        if (!this.editor.isActive("codeBlock")) {
          return false;
        }

        const { from, to } = this.editor.state.selection;
        if (from !== to) {
          return false;
        }

        const $from = this.editor.state.doc.resolve(from);
        const lineStart = $from.start();
        const textBeforeCursor = this.editor.state.doc.textBetween(
          lineStart,
          from,
          "\n",
          "\n"
        );

        if (textBeforeCursor.endsWith("  ")) {
          return this.editor.commands.deleteRange({ from: from - 2, to: from });
        }
        if (textBeforeCursor.endsWith("\t")) {
          return this.editor.commands.deleteRange({ from: from - 1, to: from });
        }

        return true;
      },
    };
  },
});

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "내용을 입력하세요...",
}: TiptapEditorProps) {
  const { token } = useAuth();
  const isSyncingFromExternalRef = useRef(false);
  const lastSyncedContentRef = useRef(content);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageAttrs, setSelectedImageAttrs] = useState<{
    cropAspect: ImageCropPreset;
    cropX: string;
    cropY: string;
  } | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline",
        },
      }),
      EditorImage.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto transition-shadow",
        },
      }),
      TextAlign,
      CodeBlockTabBehavior,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "plaintext",
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3",
      },
    },
    onUpdate: ({ editor }) => {
      if (isSyncingFromExternalRef.current) {
        return;
      }

      const html = editor.getHTML();
      lastSyncedContentRef.current = html;
      onChange(html);
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (content === lastSyncedContentRef.current) {
      return;
    }

    if (content === editor.getHTML()) {
      lastSyncedContentRef.current = content;
      return;
    }

    isSyncingFromExternalRef.current = true;
    editor.commands.setContent(content);
    lastSyncedContentRef.current = content;
    queueMicrotask(() => {
      isSyncingFromExternalRef.current = false;
    });
  }, [content, editor]);

  useEffect(() => {
    if (!editor) return;

    const updateSelectedImageAttrs = () => {
      if (!editor.isActive("image")) {
        setSelectedImageAttrs(null);
        return;
      }

      const attrs = editor.getAttributes("image") as {
        cropAspect?: ImageCropPreset;
        cropX?: string;
        cropY?: string;
      };

      setSelectedImageAttrs({
        cropAspect: attrs.cropAspect || "original",
        cropX: attrs.cropX || "50",
        cropY: attrs.cropY || "50",
      });
    };

    updateSelectedImageAttrs();
    editor.on("selectionUpdate", updateSelectedImageAttrs);
    editor.on("transaction", updateSelectedImageAttrs);

    return () => {
      editor.off("selectionUpdate", updateSelectedImageAttrs);
      editor.off("transaction", updateSelectedImageAttrs);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const dom = editor.view.dom;
    let isResizing = false;
    let startX = 0;
    let startWidthPercent = 100;
    let targetImage: HTMLImageElement | null = null;

    const getImageWidthPercent = (img: HTMLImageElement, editorWidth: number) => {
      const width = img.style.width || img.getAttribute("width") || "";
      if (width.endsWith("%")) {
        const parsed = Number.parseFloat(width);
        return Number.isFinite(parsed) ? parsed : 100;
      }
      if (width.endsWith("px")) {
        const parsed = Number.parseFloat(width);
        return Number.isFinite(parsed) && editorWidth > 0
          ? (parsed / editorWidth) * 100
          : 100;
      }
      return editorWidth > 0
        ? (img.getBoundingClientRect().width / editorWidth) * 100
        : 100;
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isResizing || !targetImage) return;

      const editorRect = dom.getBoundingClientRect();
      const editorWidth = editorRect.width;
      if (editorWidth <= 0) return;

      const deltaX = event.clientX - startX;
      const deltaPercent = (deltaX / editorWidth) * 100;
      const nextPercent = Math.min(
        100,
        Math.max(20, startWidthPercent + deltaPercent)
      );

      const pos = editor.view.posAtDOM(targetImage, 0);
      editor
        .chain()
        .focus()
        .setNodeSelection(pos)
        .updateAttributes("image", {
          width: `${nextPercent.toFixed(2)}%`,
        })
        .run();
    };

    const onMouseUp = () => {
      isResizing = false;
      targetImage = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    const onMouseDown = (event: Event) => {
      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as HTMLElement | null;
      if (!target || target.tagName !== "IMG") return;

      const img = target as HTMLImageElement;
      const rect = img.getBoundingClientRect();
      const isOnResizeZone = mouseEvent.clientX >= rect.right - 16;
      if (!isOnResizeZone) return;

      mouseEvent.preventDefault();

      const editorWidth = dom.getBoundingClientRect().width;
      startX = mouseEvent.clientX;
      startWidthPercent = getImageWidthPercent(img, editorWidth);
      targetImage = img;
      isResizing = true;

      const pos = editor.view.posAtDOM(img, 0);
      editor.chain().focus().setNodeSelection(pos).run();

      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    const onPointerMove = (event: Event) => {
      if (isResizing) return;

      const mouseEvent = event as MouseEvent;
      const target = mouseEvent.target as HTMLElement | null;
      if (!target || target.tagName !== "IMG") {
        dom.style.cursor = "";
        return;
      }

      const rect = target.getBoundingClientRect();
      const isOnResizeZone = mouseEvent.clientX >= rect.right - 16;
      dom.style.cursor = isOnResizeZone ? "ew-resize" : "";
    };

    dom.addEventListener("mousedown", onMouseDown);
    dom.addEventListener("mousemove", onPointerMove);
    dom.addEventListener("mouseleave", onMouseUp);
    return () => {
      dom.removeEventListener("mousedown", onMouseDown);
      dom.removeEventListener("mousemove", onPointerMove);
      dom.removeEventListener("mouseleave", onMouseUp);
      dom.style.cursor = "";
      onMouseUp();
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const extractCodeLanguage = (codeElement: HTMLElement | null) => {
      if (!codeElement) return "plaintext";
      const className = codeElement.className || "";
      const languageClass = className.match(/language-([\w-]+)/i);
      if (languageClass?.[1]) return languageClass[1];
      const altLanguageClass = className.match(/lang(?:uage)?-([\w-]+)/i);
      if (altLanguageClass?.[1]) return altLanguageClass[1];
      return "plaintext";
    };

    const normalizeLanguage = (value: string) => {
      const found = CODE_LANGUAGES.find((language) => language.value === value);
      return found?.value || "plaintext";
    };

    const attachLanguageSelect = () => {
      const codeBlocks = editor.view.dom.querySelectorAll("pre");
      codeBlocks.forEach((preElement) => {
        const pre = preElement as HTMLElement;
        const toolbar = pre.querySelector(".code-block-toolbar") as HTMLDivElement | null;
        if (!toolbar) return;

        let select = toolbar.querySelector(
          ".code-block-language-select"
        ) as HTMLSelectElement | null;

        if (!select) {
          select = document.createElement("select");
          select.className = "code-block-language-select";
          select.setAttribute("aria-label", "코드 블록 언어 선택");

          for (const language of CODE_LANGUAGES) {
            const option = document.createElement("option");
            option.value = language.value;
            option.textContent = language.label;
            select.appendChild(option);
          }

          select.onmousedown = (event) => {
            event.stopPropagation();
          };

          select.onchange = () => {
            const language = normalizeLanguage(select!.value);
            try {
              const pos = editor.view.posAtDOM(pre, 0);
              editor
                .chain()
                .focus()
                .setTextSelection(Math.max(1, pos + 1))
                .updateAttributes("codeBlock", { language })
                .run();
            } catch (error) {
              console.error("Failed to update code block language:", error);
            }
          };

          toolbar.insertBefore(select, toolbar.querySelector(".code-block-copy"));
        }

        const code = pre.querySelector("code") as HTMLElement | null;
        const currentLanguage = normalizeLanguage(
          pre.dataset.codeLanguage || extractCodeLanguage(code)
        );
        if (select.value !== currentLanguage) {
          select.value = currentLanguage;
        }
      });
    };

    const decorateCodeBlocks = () => {
      enhanceCodeBlocks(
        editor.view.dom,
        (message) => toast.success(message),
        (message) => toast.error(message)
      );
      attachLanguageSelect();
    };
    let rafId: number | null = null;
    const scheduleDecorateCodeBlocks = () => {
      if (rafId !== null) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        decorateCodeBlocks();
      });
    };

    scheduleDecorateCodeBlocks();
    editor.on("create", scheduleDecorateCodeBlocks);
    editor.on("update", scheduleDecorateCodeBlocks);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      editor.off("create", scheduleDecorateCodeBlocks);
      editor.off("update", scheduleDecorateCodeBlocks);
    };
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL을 입력하세요:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!token) {
        toast.error("로그인이 필요합니다.");
        return;
      }

      setIsUploading(true);
      try {
        const imageUrl = await uploadImage(file, token);
        editor
          .chain()
          .focus()
          .setImage({ src: imageUrl })
          .run();
        toast.success("이미지가 본문에 삽입되었습니다.");
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("이미지 업로드에 실패했습니다.");
      } finally {
        setIsUploading(false);
      }
    };

    input.click();
  }, [editor, token]);

  const setImageWidth = useCallback(
    (width: string) => {
      if (!editor) return;
      if (!editor.isActive("image")) {
        toast.info("크기를 변경할 이미지를 먼저 클릭하세요.");
        return;
      }
      editor.chain().focus().updateAttributes("image", { width }).run();
    },
    [editor]
  );

  const setImageAlign = useCallback(
    (align: "left" | "center" | "right") => {
      if (!editor) return;
      if (!editor.isActive("image")) {
        toast.info("정렬할 이미지를 먼저 클릭하세요.");
        return;
      }
      editor.chain().focus().updateAttributes("image", { align }).run();
    },
    [editor]
  );

  const setImageCropAspect = useCallback(
    (cropAspect: ImageCropPreset) => {
      if (!editor) return;
      if (!editor.isActive("image")) {
        toast.info("크롭할 이미지를 먼저 클릭하세요.");
        return;
      }
      editor.chain().focus().updateAttributes("image", { cropAspect }).run();
    },
    [editor]
  );

  const setImageCropPosition = useCallback(
    (axis: "cropX" | "cropY", value: string) => {
      if (!editor) return;
      if (!editor.isActive("image")) {
        toast.info("크롭 위치를 조절할 이미지를 먼저 클릭하세요.");
        return;
      }
      editor.chain().focus().updateAttributes("image", { [axis]: value }).run();
    },
    [editor]
  );

  const setTextAlign = useCallback(
    (alignment: "left" | "center" | "right") => {
      if (!editor) return;
      (editor.chain() as unknown as {
        focus: () => { setTextAlign: (value: "left" | "center" | "right") => { run: () => boolean } };
      })
        .focus()
        .setTextAlign(alignment)
        .run();
    },
    [editor]
  );

  if (!editor) return null;

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#1e1e1e]">
      {/* 툴바 */}
      <div className="sticky top-24 z-20 rounded-t-xl border-b border-gray-200 dark:border-gray-700 bg-gray-50/95 dark:bg-[#252525]/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/85 dark:supports-[backdrop-filter]:bg-[#252525]/85 shadow-sm">
        <div className="flex max-h-[40vh] flex-wrap gap-1 overflow-y-auto p-2">
        {/* 텍스트 스타일 */}
        <div className="flex gap-0.5 pr-2 border-r border-gray-300 dark:border-gray-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="굵게 (Ctrl+B)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="기울임 (Ctrl+I)"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="취소선"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            title="인라인 코드"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
            </svg>
          </ToolbarButton>
        </div>

        {/* 헤딩 */}
        <div className="flex gap-0.5 px-2 border-r border-gray-300 dark:border-gray-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="제목 1"
          >
            H1
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="제목 2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="제목 3"
          >
            H3
          </ToolbarButton>
        </div>

        {/* 리스트 */}
        <div className="flex gap-0.5 px-2 border-r border-gray-300 dark:border-gray-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            title="글머리 기호 목록"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            title="번호 매기기 목록"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
            </svg>
          </ToolbarButton>
        </div>

        {/* 블록 요소 */}
        <div className="flex gap-0.5 px-2 border-r border-gray-300 dark:border-gray-600">
          <ToolbarButton
            onClick={() => setTextAlign("left")}
            isActive={editor.isActive({ textAlign: "left" })}
            title="왼쪽 정렬"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 5h18v2H3V5zm0 4h12v2H3V9zm0 4h18v2H3v-2zm0 4h12v2H3v-2z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setTextAlign("center")}
            isActive={editor.isActive({ textAlign: "center" })}
            title="가운데 정렬"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 5h18v2H3V5zm3 4h12v2H6V9zm-3 4h18v2H3v-2zm3 4h12v2H6v-2z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setTextAlign("right")}
            isActive={editor.isActive({ textAlign: "right" })}
            title="오른쪽 정렬"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 5h18v2H3V5zm6 4h12v2H9V9zm-6 4h18v2H3v-2zm6 4h12v2H9v-2z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="구분선"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 11h16v2H4z" />
            </svg>
          </ToolbarButton>
        </div>

        <div className="flex gap-0.5 px-2 border-r border-gray-300 dark:border-gray-600">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="인용구"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="코드 블록"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V7h16l.002 12H4z" />
              <path d="M9.293 9.293L5.586 13l3.707 3.707 1.414-1.414L8.414 13l2.293-2.293zm5.414 0l-1.414 1.414L15.586 13l-2.293 2.293 1.414 1.414L18.414 13z" />
            </svg>
          </ToolbarButton>
        </div>

        {/* 링크 & 이미지 */}
        <div className="flex gap-0.5 pl-2">
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            title="링크 추가"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton onClick={addImage} title="이미지 추가" disabled={isUploading}>
            {isUploading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            )}
          </ToolbarButton>
          <ToolbarButton onClick={() => setImageWidth("25%")} title="이미지 25%">
            25%
          </ToolbarButton>
          <ToolbarButton onClick={() => setImageWidth("50%")} title="이미지 50%">
            50%
          </ToolbarButton>
          <ToolbarButton onClick={() => setImageWidth("75%")} title="이미지 75%">
            75%
          </ToolbarButton>
          <ToolbarButton onClick={() => setImageWidth("100%")} title="이미지 100%">
            100%
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setImageAlign("left")}
            isActive={editor.isActive("image", { align: "left" })}
            title="이미지 왼쪽 정렬"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 5h16v2H4V5zm0 4h10v2H4V9zm0 4h16v2H4v-2zm0 4h10v2H4v-2z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setImageAlign("center")}
            isActive={editor.isActive("image", { align: "center" })}
            title="이미지 가운데 정렬"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 5h16v2H4V5zm3 4h10v2H7V9zm-3 4h16v2H4v-2zm3 4h10v2H7v-2z" />
            </svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => setImageAlign("right")}
            isActive={editor.isActive("image", { align: "right" })}
            title="이미지 오른쪽 정렬"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 5h16v2H4V5zm10 4h6v2h-6V9zM4 13h16v2H4v-2zm10 4h6v2h-6v-2z" />
            </svg>
          </ToolbarButton>
        </div>
      </div>
      </div>

      {/* 에디터 영역 */}
      <EditorContent editor={editor} />

      {selectedImageAttrs && (
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50/90 dark:bg-[#252525] space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              이미지 크롭
            </span>
            {IMAGE_CROP_PRESETS.map((preset) => (
              <ToolbarButton
                key={preset.value}
                onClick={() => setImageCropAspect(preset.value)}
                isActive={selectedImageAttrs.cropAspect === preset.value}
                title={`${preset.label} 비율`}
              >
                {preset.label}
              </ToolbarButton>
            ))}
          </div>

          {selectedImageAttrs.cropAspect !== "original" && (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                <span className="w-14 shrink-0">가로</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={selectedImageAttrs.cropX}
                  onChange={(event) =>
                    setImageCropPosition("cropX", event.target.value)
                  }
                  className="w-full"
                />
                <span className="w-10 text-right">{selectedImageAttrs.cropX}%</span>
              </label>
              <label className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                <span className="w-14 shrink-0">세로</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={selectedImageAttrs.cropY}
                  onChange={(event) =>
                    setImageCropPosition("cropY", event.target.value)
                  }
                  className="w-full"
                />
                <span className="w-10 text-right">{selectedImageAttrs.cropY}%</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* 하단 정보 */}
      <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#252525] text-xs text-gray-500">
        <span>{editor.storage.characterCount?.characters?.() || 0}자</span>
        <span>블록 기반 에디터</span>
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  title?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, title, disabled, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 rounded-md text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}
