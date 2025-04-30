import { create } from 'zustand';
import { Widget } from './dashboardStore';

interface ModalState {
  // Widget Settings Modal
  isWidgetSettingsOpen: boolean;
  currentWidget: Widget | null;
  openWidgetSettings: (widget: Widget) => void;
  closeWidgetSettings: () => void;
  
  // Generic modal tracking (can be expanded for other modals)
  activeModals: Set<string>;
  openModal: (modalId: string) => void;
  closeModal: (modalId: string) => void;
  isModalOpen: (modalId: string) => boolean;
}

export const useModalStore = create<ModalState>((set, get) => ({
  // Widget Settings Modal
  isWidgetSettingsOpen: false,
  currentWidget: null,
  
  openWidgetSettings: (widget) => 
    set({
      isWidgetSettingsOpen: true,
      currentWidget: widget,
    }),
    
  closeWidgetSettings: () => 
    set({
      isWidgetSettingsOpen: false,
      currentWidget: null,
    }),
  
  // Generic modal tracking
  activeModals: new Set<string>(),
  
  openModal: (modalId) => 
    set(state => ({
      activeModals: new Set([...state.activeModals, modalId])
    })),
    
  closeModal: (modalId) => 
    set(state => {
      const newActiveModals = new Set([...state.activeModals]);
      newActiveModals.delete(modalId);
      return {
        activeModals: newActiveModals
      };
    }),
    
  isModalOpen: (modalId) => get().activeModals.has(modalId),
})); 