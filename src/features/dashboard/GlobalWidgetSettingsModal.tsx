import { useEffect } from 'react';
import { useModalStore } from '@/store/modalStore';
import Modal from '@/components/Modal';
import WidgetSettings from './WidgetSettings';
import { useDashboardStore } from '@/store/dashboardStore';
import { useTranslation } from 'react-i18next';

export default function GlobalWidgetSettingsModal() {
  const { t } = useTranslation('dashboard');
  const { 
    isWidgetSettingsOpen, 
    currentWidget, 
    closeWidgetSettings 
  } = useModalStore();
  
  // Get the latest version of the widget (in case it was updated elsewhere)
  const { widgets } = useDashboardStore();
  const updatedWidget = currentWidget 
    ? widgets.find(w => w.id === currentWidget.id) 
    : null;
  
  // Safety check - if the widget has been deleted, close the modal
  useEffect(() => {
    if (isWidgetSettingsOpen && currentWidget && !updatedWidget) {
      closeWidgetSettings();
    }
  }, [isWidgetSettingsOpen, currentWidget, updatedWidget, closeWidgetSettings]);

  return (
    <Modal
      isOpen={isWidgetSettingsOpen && !!updatedWidget}
      onClose={closeWidgetSettings}
      title={t('editWidgetTitle', { name: updatedWidget?.title || t('widget') })}
      width="w-[600px]"
      disableScroll={true}
    >
      <div className="flex flex-col space-y-4 px-2 overflow-hidden">
        {updatedWidget && (
          <WidgetSettings
            widget={updatedWidget}
            onSaved={() => {
              // Close the modal with a slight delay to let user see confirmation
              setTimeout(() => closeWidgetSettings(), 800);
            }}
          />
        )}
      </div>
    </Modal>
  );
} 