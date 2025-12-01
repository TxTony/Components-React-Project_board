/**
 * Content Store
 * Zustand store for managing content panel state (markdown, attachments)
 */

import { create } from 'zustand';
import type { ContentItem, Attachment, UID } from '@/types';

export interface ContentState {
  // Data
  contentItems: Map<UID, ContentItem>;
  currentContentId: UID | null;

  // UI state
  isPanelOpen: boolean;
  isEditing: boolean;
  isSaving: boolean;

  // Actions - Content
  setContentItems: (items: Map<UID, ContentItem>) => void;
  addContentItem: (item: ContentItem) => void;
  updateContentItem: (id: UID, updates: Partial<ContentItem>) => void;
  deleteContentItem: (id: UID) => void;
  getContentItem: (id: UID) => ContentItem | undefined;

  // Actions - Current content
  setCurrentContentId: (id: UID | null) => void;
  getCurrentContent: () => ContentItem | undefined;

  // Actions - Markdown
  updateMarkdown: (id: UID, markdown: string) => void;

  // Actions - Attachments
  addAttachment: (contentId: UID, attachment: Attachment) => void;
  removeAttachment: (contentId: UID, attachmentId: UID) => void;
  updateAttachment: (contentId: UID, attachmentId: UID, updates: Partial<Attachment>) => void;

  // Actions - Panel
  openPanel: (contentId: UID) => void;
  closePanel: () => void;
  togglePanel: () => void;

  // Actions - Editing
  setIsEditing: (editing: boolean) => void;
  setIsSaving: (saving: boolean) => void;

  // Actions - Reset
  reset: () => void;
}

const initialState = {
  contentItems: new Map<UID, ContentItem>(),
  currentContentId: null,
  isPanelOpen: false,
  isEditing: false,
  isSaving: false,
};

export const useContentStore = create<ContentState>((set, get) => ({
  ...initialState,

  // Content actions
  setContentItems: (items) => set({ contentItems: items }),

  addContentItem: (item) =>
    set((state) => {
      const newMap = new Map(state.contentItems);
      newMap.set(item.id, item);
      return { contentItems: newMap };
    }),

  updateContentItem: (id, updates) =>
    set((state) => {
      const item = state.contentItems.get(id);
      if (!item) return state;

      const updatedItem: ContentItem = {
        ...item,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const newMap = new Map(state.contentItems);
      newMap.set(id, updatedItem);
      return { contentItems: newMap };
    }),

  deleteContentItem: (id) =>
    set((state) => {
      const newMap = new Map(state.contentItems);
      newMap.delete(id);
      return {
        contentItems: newMap,
        currentContentId: state.currentContentId === id ? null : state.currentContentId,
      };
    }),

  getContentItem: (id) => {
    return get().contentItems.get(id);
  },

  // Current content actions
  setCurrentContentId: (id) => set({ currentContentId: id }),

  getCurrentContent: () => {
    const { currentContentId, contentItems } = get();
    if (!currentContentId) return undefined;
    return contentItems.get(currentContentId);
  },

  // Markdown actions
  updateMarkdown: (id, markdown) =>
    set((state) => {
      const item = state.contentItems.get(id);
      if (!item) return state;

      const updatedItem: ContentItem = {
        ...item,
        body: markdown,
        updatedAt: new Date().toISOString(),
      };

      const newMap = new Map(state.contentItems);
      newMap.set(id, updatedItem);
      return { contentItems: newMap };
    }),

  // Attachment actions
  addAttachment: (contentId, attachment) =>
    set((state) => {
      const item = state.contentItems.get(contentId);
      if (!item) return state;

      const updatedItem: ContentItem = {
        ...item,
        attachments: [...item.attachments, attachment],
        updatedAt: new Date().toISOString(),
      };

      const newMap = new Map(state.contentItems);
      newMap.set(contentId, updatedItem);
      return { contentItems: newMap };
    }),

  removeAttachment: (contentId, attachmentId) =>
    set((state) => {
      const item = state.contentItems.get(contentId);
      if (!item) return state;

      const updatedItem: ContentItem = {
        ...item,
        attachments: item.attachments.filter((att) => att.id !== attachmentId),
        updatedAt: new Date().toISOString(),
      };

      const newMap = new Map(state.contentItems);
      newMap.set(contentId, updatedItem);
      return { contentItems: newMap };
    }),

  updateAttachment: (contentId, attachmentId, updates) =>
    set((state) => {
      const item = state.contentItems.get(contentId);
      if (!item) return state;

      const updatedItem: ContentItem = {
        ...item,
        attachments: item.attachments.map((att) =>
          att.id === attachmentId ? { ...att, ...updates } : att
        ),
        updatedAt: new Date().toISOString(),
      };

      const newMap = new Map(state.contentItems);
      newMap.set(contentId, updatedItem);
      return { contentItems: newMap };
    }),

  // Panel actions
  openPanel: (contentId) =>
    set({
      currentContentId: contentId,
      isPanelOpen: true,
    }),

  closePanel: () =>
    set({
      isPanelOpen: false,
      isEditing: false,
    }),

  togglePanel: () =>
    set((state) => ({
      isPanelOpen: !state.isPanelOpen,
    })),

  // Editing actions
  setIsEditing: (editing) => set({ isEditing: editing }),

  setIsSaving: (saving) => set({ isSaving: saving }),

  // Reset
  reset: () => set(initialState),
}));
