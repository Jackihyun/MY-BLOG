"use client";

import { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { PostData } from "@/lib/posts";
import { useAuth } from "@/hooks/useAuth";
import { getPostPreview } from "@/lib/utils";
import { useVisitorStatsQuery } from "@/hooks/queries/useVisitorStatsQuery";
import {
  useCategoryTreeQuery,
  useUpdateCategoryTreeMutation,
} from "@/hooks/queries/useCategoryTreeQuery";
import { CategoryTreeResponse } from "@/types";

type CategoryNode = {
  id: string;
  name: string;
  parentId: string | null;
  order: number;
};
const UNCATEGORIZED_NAME = "미분류";

function slugifyCategoryName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-가-힣]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getUniqueCategoryId(baseName: string, existingIds: Set<string>) {
  const safeBase = slugifyCategoryName(baseName) || "category";
  let id = safeBase;
  let suffix = 2;

  while (existingIds.has(id)) {
    id = `${safeBase}-${suffix}`;
    suffix += 1;
  }

  return id;
}

function buildDefaultNodes(posts: PostData[]): CategoryNode[] {
  const uniqueNames = Array.from(
    new Set(posts.map((post) => post.category)),
  ).sort();

  const existingIds = new Set<string>();

  return uniqueNames.map((name, index) => {
    const id = getUniqueCategoryId(name, existingIds);
    existingIds.add(id);

    return {
      id,
      name,
      parentId: null,
      order: index,
    };
  });
}

function normalizeNodes(nodes: CategoryNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]));

  return nodes.map((node) => {
    const parent = node.parentId ? byId.get(node.parentId) : null;
    const isValidParent = parent && parent.parentId === null;

    return {
      ...node,
      parentId: isValidParent ? parent!.id : null,
    };
  });
}

function flattenTree(nodes: CategoryNode[]) {
  const childrenMap = new Map<string | null, CategoryNode[]>();

  for (const node of nodes) {
    const key = node.parentId;
    if (!childrenMap.has(key)) {
      childrenMap.set(key, []);
    }
    childrenMap.get(key)!.push(node);
  }

  childrenMap.forEach((siblings) => {
    siblings.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  });

  const flat: Array<{ node: CategoryNode; depth: number }> = [];

  const walk = (parentId: string | null, depth: number) => {
    const children = childrenMap.get(parentId) ?? [];
    for (const child of children) {
      flat.push({ node: child, depth });
      walk(child.id, depth + 1);
    }
  };

  walk(null, 0);
  return flat;
}

function collectCategoryIds(nodes: CategoryNode[], rootId: string) {
  const childrenMap = new Map<string, string[]>();

  for (const node of nodes) {
    if (!node.parentId) continue;
    const siblings = childrenMap.get(node.parentId) ?? [];
    siblings.push(node.id);
    childrenMap.set(node.parentId, siblings);
  }

  const ids = new Set<string>();
  const stack = [rootId];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || ids.has(current)) continue;
    ids.add(current);

    const children = childrenMap.get(current) ?? [];
    for (const childId of children) {
      stack.push(childId);
    }
  }

  return ids;
}

function getSortedSiblings(nodes: CategoryNode[], parentId: string | null) {
  return nodes
    .filter((node) => node.parentId === parentId)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

function moveCategoryNode(
  nodes: CategoryNode[],
  sourceId: string,
  newParentId: string | null,
  targetIndex: number,
) {
  const source = nodes.find((node) => node.id === sourceId);
  if (!source) {
    return nodes;
  }

  if (newParentId === sourceId) {
    return nodes;
  }

  if (newParentId) {
    const nextParent = nodes.find((node) => node.id === newParentId);
    if (!nextParent || nextParent.parentId !== null) {
      return nodes;
    }

    const sourceHasChildren = nodes.some((node) => node.parentId === sourceId);
    if (sourceHasChildren) {
      return nodes;
    }
  }

  const oldParentId = source.parentId;
  const withoutSource = nodes.filter((node) => node.id !== sourceId);

  const siblingsOfNewParent = getSortedSiblings(withoutSource, newParentId);
  const safeIndex = Math.max(
    0,
    Math.min(targetIndex, siblingsOfNewParent.length),
  );

  const movedNode: CategoryNode = {
    ...source,
    parentId: newParentId,
    order: 0,
  };

  const updatedMap = new Map<string, CategoryNode>(
    withoutSource.map((node) => [node.id, { ...node }]),
  );

  const orderedNewSiblings = [
    ...siblingsOfNewParent.slice(0, safeIndex),
    movedNode,
    ...siblingsOfNewParent.slice(safeIndex),
  ];

  if (oldParentId !== newParentId) {
    const oldSiblings = getSortedSiblings(withoutSource, oldParentId);
    oldSiblings.forEach((node, index) => {
      const prev = updatedMap.get(node.id);
      if (!prev) return;
      prev.order = index;
      updatedMap.set(node.id, prev);
    });
  }

  orderedNewSiblings.forEach((node, index) => {
    const current = node.id === sourceId ? movedNode : updatedMap.get(node.id);
    if (!current) return;
    current.parentId = newParentId;
    current.order = index;
    updatedMap.set(node.id, current);
  });

  return Array.from(updatedMap.values());
}

function ensureCategoryExistsByName(nodes: CategoryNode[], name: string) {
  const existing = nodes.find((node) => node.name === name);
  if (existing) {
    return { nodes, id: existing.id };
  }

  const ids = new Set(nodes.map((node) => node.id));
  const id = getUniqueCategoryId(name, ids);
  const nextOrder = nodes.filter((node) => node.parentId === null).length;

  return {
    nodes: [
      ...nodes,
      {
        id,
        name,
        parentId: null,
        order: nextOrder,
      },
    ],
    id,
  };
}

function ensureUncategorized(nodes: CategoryNode[]) {
  return ensureCategoryExistsByName(nodes, UNCATEGORIZED_NAME);
}

function CategoryManagerModal({
  isOpen,
  onClose,
  nodes,
  onCreate,
  onDelete,
  onMove,
}: {
  isOpen: boolean;
  onClose: () => void;
  nodes: CategoryNode[];
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
  onMove: (
    sourceId: string,
    parentId: string | null,
    targetIndex: number,
  ) => void;
}) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [insertTarget, setInsertTarget] = useState<{
    parentId: string | null;
    index: number;
  } | null>(null);
  const [insideTargetRootId, setInsideTargetRootId] = useState<string | null>(
    null,
  );
  const dragPreviewRef = useRef<HTMLElement | null>(null);

  const roots = useMemo(() => getSortedSiblings(nodes, null), [nodes]);
  const childrenByRootId = useMemo(() => {
    const map = new Map<string, CategoryNode[]>();
    for (const root of roots) {
      map.set(root.id, getSortedSiblings(nodes, root.id));
    }
    return map;
  }, [nodes, roots]);

  const draggedHasChildren = useMemo(() => {
    if (!draggingId) {
      return false;
    }
    return nodes.some((node) => node.parentId === draggingId);
  }, [draggingId, nodes]);

  const clearDropIndicators = () => {
    setInsertTarget(null);
    setInsideTargetRootId(null);
  };

  const handleDropToInsert = (parentId: string | null, index: number) => {
    if (!draggingId) {
      return;
    }

    onMove(draggingId, parentId, index);
    setDraggingId(null);
    clearDropIndicators();
  };

  const canDropInsideRoot = (rootId: string) => {
    if (!draggingId || draggingId === rootId) {
      return false;
    }

    if (draggedHasChildren) {
      return false;
    }

    return true;
  };

  const removeDragPreview = () => {
    if (dragPreviewRef.current) {
      dragPreviewRef.current.remove();
      dragPreviewRef.current = null;
    }
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    categoryId: string,
  ) => {
    setDraggingId(categoryId);
    clearDropIndicators();

    const target = event.currentTarget;
    const preview = target.cloneNode(true) as HTMLDivElement;
    preview.style.position = "fixed";
    preview.style.top = "-1000px";
    preview.style.left = "-1000px";
    preview.style.width = `${target.offsetWidth}px`;
    preview.style.pointerEvents = "none";
    preview.style.opacity = "0.95";
    preview.style.transform = "scale(1.02)";
    preview.style.boxShadow = "0 18px 42px rgba(24, 24, 27, 0.22)";
    preview.style.borderColor = "rgb(99 102 241 / 0.8)";
    preview.style.background = "rgb(255 255 255)";

    document.body.appendChild(preview);
    dragPreviewRef.current = preview;

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setDragImage(preview, 20, 14);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    clearDropIndicators();
    removeDragPreview();
  };

  useEffect(() => {
    return () => removeDragPreview();
  }, []);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            카테고리 관리
          </h3>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            닫기
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            value={newCategoryName}
            onChange={(event) => setNewCategoryName(event.target.value)}
            placeholder="새 카테고리 이름"
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            onClick={() => {
              const name = newCategoryName.trim();
              if (!name) {
                return;
              }
              onCreate(name);
              setNewCategoryName("");
            }}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            추가
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 p-3 max-h-[420px] overflow-y-auto">
          <div className="space-y-1.5">
            <div
              className="h-3 flex items-center"
              onDragOver={(event) => {
                event.preventDefault();
                setInsertTarget({ parentId: null, index: 0 });
                setInsideTargetRootId(null);
              }}
              onDrop={() => handleDropToInsert(null, 0)}
            >
              <div
                className={`w-full border-t-2 ${insertTarget?.parentId === null && insertTarget.index === 0 ? "border-indigo-500" : "border-transparent"}`}
              />
            </div>

            {roots.map((root, rootIndex) => {
              const children = childrenByRootId.get(root.id) ?? [];
              const canDropInside = canDropInsideRoot(root.id);

              return (
                <div key={root.id} className="space-y-1">
                  <div
                    draggable
                    onDragStart={(event) => handleDragStart(event, root.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(event) => {
                      if (!canDropInside) return;
                      event.preventDefault();
                      setInsideTargetRootId(root.id);
                      setInsertTarget(null);
                    }}
                    onDragLeave={(event) => {
                      const related = event.relatedTarget as Node | null;
                      if (related && event.currentTarget.contains(related)) {
                        return;
                      }
                      if (insideTargetRootId === root.id) {
                        setInsideTargetRootId(null);
                      }
                    }}
                    onDrop={() => {
                      if (!draggingId || !canDropInside) return;
                      onMove(draggingId, root.id, children.length);
                      setDraggingId(null);
                      clearDropIndicators();
                    }}
                    className={`flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-zinc-950 border px-2 py-2 transition-all ${
                      insideTargetRootId === root.id
                        ? "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30"
                        : "border-zinc-200 dark:border-zinc-800"
                    } ${draggingId === root.id ? "opacity-60 scale-[0.98] cursor-grabbing" : "cursor-grab"}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <svg
                        className="w-4 h-4 text-zinc-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        />
                      </svg>
                      <span className="truncate text-sm text-zinc-700 dark:text-zinc-200">
                        {root.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`h-7 w-7 rounded-md border flex items-center justify-center transition-colors ${
                          canDropInside
                            ? insideTargetRootId === root.id
                              ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                              : "border-zinc-300 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                            : "border-zinc-200 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600"
                        }`}
                        title="카테고리 안으로 드롭 가능"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v14m7-7H5"
                          />
                        </svg>
                      </div>
                      <button
                        onClick={() => onDelete(root.id)}
                        className="px-2 py-1 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {children.length > 0 && (
                    <div className="pl-5">
                      <div
                        className="h-3 flex items-center"
                        onDragOver={(event) => {
                          event.preventDefault();
                          setInsertTarget({ parentId: root.id, index: 0 });
                          setInsideTargetRootId(null);
                        }}
                        onDrop={() => handleDropToInsert(root.id, 0)}
                      >
                        <div
                          className={`w-full border-t-2 ${insertTarget?.parentId === root.id && insertTarget.index === 0 ? "border-indigo-500" : "border-transparent"}`}
                        />
                      </div>

                      {children.map((child, childIndex) => (
                        <div key={child.id}>
                          <div
                            draggable
                            onDragStart={(event) =>
                              handleDragStart(event, child.id)
                            }
                            onDragEnd={handleDragEnd}
                            className={`flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2 py-2 transition-all ${
                              draggingId === child.id
                                ? "opacity-60 scale-[0.98] cursor-grabbing"
                                : "cursor-grab"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <svg
                                className="w-4 h-4 text-zinc-400 shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.8}
                                  d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                                />
                              </svg>
                              <span className="truncate text-sm text-zinc-700 dark:text-zinc-200">
                                {child.name}
                              </span>
                            </div>
                            <button
                              onClick={() => onDelete(child.id)}
                              className="px-2 py-1 rounded-md text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                            >
                              삭제
                            </button>
                          </div>

                          <div
                            className="h-3 flex items-center"
                            onDragOver={(event) => {
                              event.preventDefault();
                              setInsertTarget({
                                parentId: root.id,
                                index: childIndex + 1,
                              });
                              setInsideTargetRootId(null);
                            }}
                            onDrop={() =>
                              handleDropToInsert(root.id, childIndex + 1)
                            }
                          >
                            <div
                              className={`w-full border-t-2 ${insertTarget?.parentId === root.id && insertTarget.index === childIndex + 1 ? "border-indigo-500" : "border-transparent"}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className="h-3 flex items-center"
                    onDragOver={(event) => {
                      event.preventDefault();
                      setInsertTarget({ parentId: null, index: rootIndex + 1 });
                      setInsideTargetRootId(null);
                    }}
                    onDrop={() => handleDropToInsert(null, rootIndex + 1)}
                  >
                    <div
                      className={`w-full border-t-2 ${insertTarget?.parentId === null && insertTarget.index === rootIndex + 1 ? "border-indigo-500" : "border-transparent"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          하위는 1단계까지만 지원됩니다.
        </p>
      </div>
    </div>
  );
}

function PostsList({ allPostsData }: { allPostsData: PostData[] }) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [categoryNodes, setCategoryNodes] = useState<CategoryNode[]>([]);
  const [postCategoryOverrides, setPostCategoryOverrides] = useState<
    Record<string, string>
  >({});
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isMobileCategoryPopupOpen, setIsMobileCategoryPopupOpen] =
    useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const mobileCategoryPopupRef = useRef<HTMLDivElement | null>(null);

  const { isAuthenticated, token } = useAuth();
  const { data: visitorStats } = useVisitorStatsQuery();
  const { data: categoryTreeData } = useCategoryTreeQuery();
  const updateCategoryTreeMutation = useUpdateCategoryTreeMutation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHydratedCategoryTreeRef = useRef(false);
  const lastSavedCategoryTreeRef = useRef("");
  const saveCategoryTreeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    const defaultNodes = buildDefaultNodes(allPostsData);
    const baseNodes = normalizeNodes(categoryTreeData?.nodes ?? defaultNodes);
    const existingNames = new Set(baseNodes.map((node) => node.name));

    const mergedNodes = [...baseNodes];
    let mergedIds = new Set(mergedNodes.map((node) => node.id));

    for (const node of defaultNodes) {
      if (!existingNames.has(node.name)) {
        const newId = getUniqueCategoryId(node.name, mergedIds);
        mergedNodes.push({
          ...node,
          id: newId,
          order: mergedNodes.filter((item) => item.parentId === null).length,
        });
        mergedIds = new Set(mergedNodes.map((item) => item.id));
      }
    }

    const nextOverrides = categoryTreeData?.postCategoryOverrides ?? {};

    setCategoryNodes(mergedNodes);
    setPostCategoryOverrides(nextOverrides);

    hasHydratedCategoryTreeRef.current = true;
    lastSavedCategoryTreeRef.current = JSON.stringify({
      nodes: mergedNodes,
      postCategoryOverrides: nextOverrides,
    } as CategoryTreeResponse);
  }, [allPostsData, categoryTreeData]);

  useEffect(() => {
    if (!hasHydratedCategoryTreeRef.current || !token) {
      return;
    }

    const payload: CategoryTreeResponse = {
      nodes: categoryNodes,
      postCategoryOverrides,
    };
    const serializedPayload = JSON.stringify(payload);

    if (serializedPayload === lastSavedCategoryTreeRef.current) {
      return;
    }

    if (saveCategoryTreeTimerRef.current) {
      clearTimeout(saveCategoryTreeTimerRef.current);
    }

    saveCategoryTreeTimerRef.current = setTimeout(() => {
      updateCategoryTreeMutation.mutate(
        { data: payload, token },
        {
          onSuccess: () => {
            lastSavedCategoryTreeRef.current = serializedPayload;
          },
        },
      );
    }, 350);

    return () => {
      if (saveCategoryTreeTimerRef.current) {
        clearTimeout(saveCategoryTreeTimerRef.current);
      }
    };
  }, [categoryNodes, postCategoryOverrides, token, updateCategoryTreeMutation]);

  const categoryById = useMemo(
    () => new Map(categoryNodes.map((node) => [node.id, node])),
    [categoryNodes],
  );

  const categoryIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const node of categoryNodes) {
      if (!map.has(node.name)) {
        map.set(node.name, node.id);
      }
    }
    return map;
  }, [categoryNodes]);

  const getPostCategoryId = useCallback(
    (post: PostData) => {
      const overriddenId = postCategoryOverrides[post.id];
      if (overriddenId && categoryById.has(overriddenId)) {
        return overriddenId;
      }

      const mappedId = categoryIdByName.get(post.category);
      if (mappedId) {
        return mappedId;
      }

      return "";
    },
    [categoryById, categoryIdByName, postCategoryOverrides],
  );

  useEffect(() => {
    if (selectedCategoryId === "all" || categoryNodes.length === 0) {
      return;
    }

    if (!categoryById.has(selectedCategoryId)) {
      setSelectedCategoryId("all");
    }
  }, [categoryById, categoryNodes.length, selectedCategoryId]);

  useEffect(() => {
    const queryCategory = searchParams.get("category");

    if (!queryCategory) {
      if (selectedCategoryId !== "all") {
        setSelectedCategoryId("all");
      }
      return;
    }

    if (queryCategory === selectedCategoryId) {
      return;
    }

    if (categoryNodes.length === 0) {
      setSelectedCategoryId(queryCategory);
      return;
    }

    if (categoryById.has(queryCategory)) {
      setSelectedCategoryId(queryCategory);
      return;
    }

    setSelectedCategoryId("all");
  }, [categoryById, categoryNodes.length, searchParams, selectedCategoryId]);

  const applyCategoryFilter = useCallback(
    (categoryId: string) => {
      setSelectedCategoryId(categoryId);

      const nextParams = new URLSearchParams(searchParams.toString());
      if (categoryId === "all") {
        nextParams.delete("category");
      } else {
        nextParams.set("category", categoryId);
      }
      nextParams.delete("page");

      const nextQuery = nextParams.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (!isMobileCategoryPopupOpen) {
      return;
    }

    const handleOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        mobileCategoryPopupRef.current &&
        target &&
        !mobileCategoryPopupRef.current.contains(target)
      ) {
        setIsMobileCategoryPopupOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileCategoryPopupOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isMobileCategoryPopupOpen]);

  useEffect(() => {
    const updateScrollPosition = () => {
      const doc = document.documentElement;
      const scrollBottom = window.scrollY + window.innerHeight;
      const maxScroll = doc.scrollHeight;
      setIsAtBottom(scrollBottom >= maxScroll - 8);
    };

    updateScrollPosition();
    window.addEventListener("scroll", updateScrollPosition, { passive: true });
    window.addEventListener("resize", updateScrollPosition);

    return () => {
      window.removeEventListener("scroll", updateScrollPosition);
      window.removeEventListener("resize", updateScrollPosition);
    };
  }, [allPostsData.length, categoryNodes.length, selectedCategoryId]);

  const selectedCategoryIds = useMemo(() => {
    if (selectedCategoryId === "all") {
      return null;
    }

    return collectCategoryIds(categoryNodes, selectedCategoryId);
  }, [categoryNodes, selectedCategoryId]);

  const categoryCountMap = useMemo(() => {
    const directCounts = new Map<string, number>();
    const childrenMap = new Map<string, string[]>();

    for (const post of allPostsData) {
      const categoryId = getPostCategoryId(post);
      if (!categoryId) {
        continue;
      }
      directCounts.set(categoryId, (directCounts.get(categoryId) ?? 0) + 1);
    }

    for (const node of categoryNodes) {
      if (!node.parentId) continue;
      const children = childrenMap.get(node.parentId) ?? [];
      children.push(node.id);
      childrenMap.set(node.parentId, children);
    }

    const totals = new Map<string, number>();

    const getTotal = (id: string): number => {
      if (totals.has(id)) {
        return totals.get(id)!;
      }

      let total = directCounts.get(id) ?? 0;
      for (const childId of childrenMap.get(id) ?? []) {
        total += getTotal(childId);
      }

      totals.set(id, total);
      return total;
    };

    for (const node of categoryNodes) {
      getTotal(node.id);
    }

    return totals;
  }, [allPostsData, categoryNodes, getPostCategoryId]);

  const visibleCategoryRows = useMemo(() => {
    return flattenTree(categoryNodes);
  }, [categoryNodes]);

  const categoryFilteredPosts = useMemo(() => {
    if (!selectedCategoryIds) {
      return allPostsData;
    }

    return allPostsData.filter((post) =>
      selectedCategoryIds.has(getPostCategoryId(post)),
    );
  }, [allPostsData, getPostCategoryId, selectedCategoryIds]);

  const pageSize = useMemo(() => {
    const sizeParam = Number(searchParams.get("size") ?? "10");
    return sizeParam === 20 ? 20 : 10;
  }, [searchParams]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(categoryFilteredPosts.length / pageSize)),
    [categoryFilteredPosts.length, pageSize],
  );

  const currentPage = useMemo(() => {
    const pageParam = Number(searchParams.get("page") ?? "1");
    if (!Number.isFinite(pageParam) || pageParam < 1) {
      return 1;
    }
    return Math.min(Math.floor(pageParam), totalPages);
  }, [searchParams, totalPages]);

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return categoryFilteredPosts.slice(start, start + pageSize);
  }, [categoryFilteredPosts, currentPage, pageSize]);

  useEffect(() => {
    const currentQueryPage = Number(searchParams.get("page") ?? "1");
    if (Number.isFinite(currentQueryPage) && currentQueryPage === currentPage) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    if (currentPage <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(currentPage));
    }

    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [currentPage, pathname, router, searchParams]);

  const selectedCategoryLabel =
    selectedCategoryId === "all"
      ? "전체 글"
      : (categoryById.get(selectedCategoryId)?.name ?? "전체 글");

  const createCategory = (name: string) => {
    const existingIds = new Set(categoryNodes.map((node) => node.id));
    const nextId = getUniqueCategoryId(name, existingIds);

    setCategoryNodes((prev) => [
      ...prev,
      {
        id: nextId,
        name,
        parentId: null,
        order: prev.filter((node) => node.parentId === null).length,
      },
    ]);
  };

  const deleteCategory = (categoryId: string) => {
    const postsToReassign = allPostsData
      .filter((post) => getPostCategoryId(post) === categoryId)
      .map((post) => post.id);

    setCategoryNodes((prev) => {
      const target = prev.find((node) => node.id === categoryId);
      if (!target) {
        return prev;
      }

      let next = prev
        .filter((node) => node.id !== categoryId)
        .map((node) =>
          node.parentId === categoryId
            ? {
                ...node,
                parentId: target.parentId,
              }
            : node,
        );

      let uncategorizedId = "";
      if (postsToReassign.length > 0) {
        const ensured = ensureUncategorized(next);
        next = ensured.nodes;
        uncategorizedId = ensured.id;
      }

      if (postsToReassign.length > 0 && uncategorizedId) {
        setPostCategoryOverrides((prevOverrides) => {
          const updated = { ...prevOverrides };
          for (const postId of postsToReassign) {
            updated[postId] = uncategorizedId;
          }
          return updated;
        });
      }

      return next;
    });
  };

  const moveCategory = (
    sourceId: string,
    parentId: string | null,
    targetIndex: number,
  ) => {
    setCategoryNodes((prev) =>
      moveCategoryNode(prev, sourceId, parentId, targetIndex),
    );
  };

  const moveListViewport = () => {
    const behavior: ScrollBehavior = "smooth";
    if (isAtBottom) {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
  };

  const changePageSize = (size: 10 | 20) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("size", String(size));
    nextParams.delete("page");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  const goToPage = (page: number) => {
    const safePage = Math.max(1, Math.min(page, totalPages));
    const nextParams = new URLSearchParams(searchParams.toString());
    if (safePage <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(safePage));
    }
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <CategoryManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        nodes={categoryNodes}
        onCreate={createCategory}
        onDelete={deleteCategory}
        onMove={moveCategory}
      />

      <div className="space-y-6 w-full min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Posts
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {categoryFilteredPosts.length}개의 글
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <div className="hidden sm:flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => changePageSize(10)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  pageSize === 10
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                10개
              </button>
              <button
                type="button"
                onClick={() => changePageSize(20)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  pageSize === 20
                    ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400"
                }`}
              >
                20개
              </button>
            </div>

            <div className="relative lg:hidden" ref={mobileCategoryPopupRef}>
              <button
                type="button"
                onClick={() => setIsMobileCategoryPopupOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                aria-haspopup="dialog"
                aria-expanded={isMobileCategoryPopupOpen}
                aria-label="카테고리 선택"
              >
                <span className="max-w-[120px] truncate">
                  {selectedCategoryLabel}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${isMobileCategoryPopupOpen ? "rotate-180" : "rotate-0"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isMobileCategoryPopupOpen && (
                <div className="absolute right-0 top-full mt-2 z-30 w-[min(60vw,320px)] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <p className="text-xs font-bold tracking-wide uppercase text-zinc-500 dark:text-zinc-400">
                      Categories
                    </p>
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileCategoryPopupOpen(false);
                          setIsManagerOpen(true);
                        }}
                        className="rounded-md bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                      >
                        편집
                      </button>
                    )}
                  </div>

                  <div className="max-h-[70vh] space-y-1 overflow-y-auto pr-1">
                    <button
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                        selectedCategoryId === "all"
                          ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                      onClick={() => {
                        applyCategoryFilter("all");
                        setIsMobileCategoryPopupOpen(false);
                      }}
                    >
                      <span className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 opacity-80"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.8}
                            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                          />
                        </svg>
                        전체 글
                      </span>
                      <span className="text-xs opacity-80">
                        {allPostsData.length}
                      </span>
                    </button>

                    {visibleCategoryRows.map(({ node, depth }) => {
                      const count = categoryCountMap.get(node.id) ?? 0;

                      return (
                        <button
                          key={node.id}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                            selectedCategoryId === node.id
                              ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                          }`}
                          onClick={() => {
                            applyCategoryFilter(node.id);
                            setIsMobileCategoryPopupOpen(false);
                          }}
                          style={{ paddingLeft: `${12 + depth * 16}px` }}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <svg
                              className="w-4 h-4 opacity-80 shrink-0"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              aria-hidden
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                              />
                            </svg>
                            <span className="truncate">{node.name}</span>
                          </span>
                          <span className="text-xs opacity-80">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {isAuthenticated && (
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-2 px-5 py-2.5
                           bg-zinc-900 dark:bg-zinc-50
                           text-white dark:text-zinc-900 font-bold rounded-xl
                           shadow-lg shadow-zinc-900/20 dark:shadow-zinc-50/10
                           transition-all duration-200 active:scale-95"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                글쓰기
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[264px_minmax(0,1fr)]">
          <aside className="hidden lg:block min-w-0">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-4">
                <p className="text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                  Visitor
                </p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 px-2 py-3">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Total
                    </p>
                    <p className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {visitorStats?.total ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 px-2 py-3">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Today
                    </p>
                    <p className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {visitorStats?.today ?? "-"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-zinc-50 dark:bg-zinc-900 px-2 py-3">
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Yesterday
                    </p>
                    <p className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {visitorStats?.yesterday ?? "-"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0a0a0a] p-3">
                <div className="px-2 pb-2 flex items-center justify-between gap-2">
                  <p className="text-xs font-bold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                    Categories
                  </p>
                  {isAuthenticated && (
                    <button
                      onClick={() => setIsManagerOpen(true)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    >
                      편집
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <button
                    className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                      selectedCategoryId === "all"
                        ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    }`}
                    onClick={() => applyCategoryFilter("all")}
                  >
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 opacity-80"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.8}
                          d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                        />
                      </svg>
                      전체 글
                    </span>
                    <span className="text-xs opacity-80">
                      {allPostsData.length}
                    </span>
                  </button>

                  {visibleCategoryRows.map(({ node, depth }) => {
                    const count = categoryCountMap.get(node.id) ?? 0;

                    return (
                      <button
                        key={node.id}
                        className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                          selectedCategoryId === node.id
                            ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        }`}
                        onClick={() => applyCategoryFilter(node.id)}
                        style={{ paddingLeft: `${12 + depth * 16}px` }}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <svg
                            className="w-4 h-4 opacity-80 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
                            />
                          </svg>
                          <span className="truncate">{node.name}</span>
                        </span>
                        <span className="text-xs opacity-80">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-4 min-w-0">
            {categoryFilteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-4">
                  <svg
                    className="w-8 h-8 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                    />
                  </svg>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                  아직 작성된 글이 없습니다
                </p>
              </div>
            ) : (
              paginatedPosts.map((post, index) => {
                const { id, date, title, contentHtml, excerpt } = post;
                const categoryId = getPostCategoryId(post);
                const categoryName =
                  categoryById.get(categoryId)?.name ?? post.category;

                return (
                  <motion.article
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Link href={`/posts/${id}`}>
                      <div
                        className="group p-5 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-zinc-100 dark:border-zinc-800
                                   transition-all duration-300 ease-out
                                   hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/40
                                   hover:border-indigo-200 dark:hover:border-indigo-800/50
                                   hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                              {title}
                            </h2>
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                              {getPostPreview(excerpt, contentHtml, 160)}
                            </p>
                            <div className="flex items-center gap-3 mt-4">
                              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {categoryName}
                              </span>
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                                {date}
                              </span>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-zinc-50 dark:bg-zinc-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 transition-colors">
                            <svg
                              className="w-5 h-5 text-zinc-400 group-hover:text-indigo-500 transition-colors"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                );
              })
            )}

            {categoryFilteredPosts.length > 0 && (
              <div className="pt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {currentPage} / {totalPages} 페이지
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40"
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={moveListViewport}
        className="fixed right-6 bottom-10 z-40 inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 p-3 sm:px-4 sm:py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200 shadow-lg backdrop-blur transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
        aria-label={isAtBottom ? "맨 위로 이동" : "맨 아래로 이동"}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          {isAtBottom ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          )}
        </svg>
        <span className="hidden sm:inline">
          {isAtBottom ? "맨 위로 가기" : "맨 아래로 가기"}
        </span>
      </button>
    </>
  );
}

export default memo(PostsList);
