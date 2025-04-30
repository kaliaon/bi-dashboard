import { useState, useCallback, useEffect, useRef } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import '@/grid-styles.css';
import { useDashboardStore, Widget } from '@/store/dashboardStore';
import WidgetContainer from './WidgetContainer';

// Use the standard ResponsiveGridLayout without the WidthProvider
// We'll handle width calculation ourselves for better precision
const ResponsiveReactGridLayout = Responsive;

interface DashboardGridProps {
  className?: string;
}

export default function DashboardGrid({ className }: DashboardGridProps) {
  const { widgets, updateWidgetLayout, removeWidget } = useDashboardStore();
  const [isEditing, setIsEditing] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200); // Default width

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (gridContainerRef.current) {
        setContainerWidth(gridContainerRef.current.offsetWidth);
      }
    };

    // Update width initially and on window resize
    updateWidth();
    window.addEventListener('resize', updateWidth);

    // Cleanup
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Convert widgets to layout objects for react-grid-layout
  const getLayouts = useCallback(() => {
    const layouts = {
      lg: widgets.map((widget) => ({
        i: widget.id,
        x: widget.layout.x,
        y: widget.layout.y,
        w: widget.layout.w,
        h: widget.layout.h,
        minW: 2,
        minH: 2,
      })),
    };
    return layouts;
  }, [widgets]);

  // Handle layout change
  const handleLayoutChange = useCallback(
    (currentLayout: Layout[], allLayouts: { [key: string]: Layout[] }) => {
      // Only update if we're in edit mode
      if (!isEditing) return;

      currentLayout.forEach((item) => {
        const widgetId = item.i;
        const layoutUpdate = {
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        };
        updateWidgetLayout(widgetId, layoutUpdate);
      });
    },
    [isEditing, updateWidgetLayout]
  );

  // Handle widget deletion
  const handleDeleteWidget = useCallback((widgetId: string) => {
    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this widget?')) {
      removeWidget(widgetId);
    }
  }, [removeWidget]);

  return (
    <div className="flex flex-col w-full h-full bg-white relative">
      {/* Floating edit button in top right corner */}
      <button
        className="absolute top-4 right-4 left-auto px-1 py-1 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors text-sm z-10 shadow-md"
        onClick={() => setIsEditing(!isEditing)}
        style={{ right: '1rem', left: 'auto' }}
      >
        {isEditing ? 'Save Layout' : 'Edit Layout'}
      </button>

      <div 
        ref={gridContainerRef} 
        className="flex-1 w-full h-full p-0"
      >
        {widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-xl mb-4">No widgets added yet</p>
            <p>
              Get started by clicking the "Add Widget" button to create your first
              visualization.
            </p>
          </div>
        ) : (
          <ResponsiveReactGridLayout
            className={`w-full ${className || ''}`}
            layouts={getLayouts()}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={100}
            width={containerWidth}
            isDraggable={isEditing}
            isResizable={isEditing}
            onLayoutChange={handleLayoutChange}
            margin={[10, 10]}
            containerPadding={[5, 5]}
            style={{ height: '100%' }}
            draggableHandle=".widget-drag-handle"
          >
            {widgets.map((widget) => (
              <div key={widget.id} className="h-full">
                <WidgetContainer 
                  widget={widget} 
                  isEditing={isEditing}
                  onDelete={() => handleDeleteWidget(widget.id)}
                />
              </div>
            ))}
          </ResponsiveReactGridLayout>
        )}
      </div>
    </div>
  );
} 