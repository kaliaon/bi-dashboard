import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 'line' | 'bar' | 'pie' | 'table' | 'text';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  dataSource?: string;
  config: {
    x?: string;
    y?: string;
    category?: string;
    values?: string[];
    colors?: string[];
    [key: string]: any;
  };
  layout: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

interface DashboardState {
  widgets: Widget[];
  activeWidget: string | null;
  addWidget: (widget: Widget) => void;
  updateWidget: (id: string, widget: Partial<Widget>) => void;
  removeWidget: (id: string) => void;
  setActiveWidget: (id: string | null) => void;
  updateWidgetLayout: (id: string, layout: Partial<Widget['layout']>) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: [],
      activeWidget: null,
      addWidget: (widget) => set((state) => ({ 
        widgets: [...state.widgets, widget] 
      })),
      updateWidget: (id, updatedWidget) => set((state) => ({
        widgets: state.widgets.map((widget) => 
          widget.id === id ? { ...widget, ...updatedWidget } : widget
        )
      })),
      removeWidget: (id) => set((state) => ({ 
        widgets: state.widgets.filter((widget) => widget.id !== id) 
      })),
      setActiveWidget: (id) => set({ activeWidget: id }),
      updateWidgetLayout: (id, layout) => set((state) => ({
        widgets: state.widgets.map((widget) =>
          widget.id === id ? { ...widget, layout: { ...widget.layout, ...layout } } : widget
        )
      })),
    }),
    {
      name: 'dashboard-storage',
    }
  )
); 