import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  height?: string;
  disableScroll?: boolean;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = 'w-[500px]',
  height = 'max-h-[90%]',
  disableScroll = false,
}: ModalProps) {
  const { t } = useTranslation('common');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      
      // Disable body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      
      // Re-enable body scroll when modal closes
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus trapping
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(2px)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
    >
      <div 
        ref={modalRef}
        className={`modal-container rounded-lg shadow-xl ${width} ${height} flex flex-col outline-none overflow-hidden translate-y-0 scale-100 transition-all duration-200`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        style={{
          maxWidth: 'calc(100vw - 2rem)',
          maxHeight: 'calc(100vh - 2rem)',
          backgroundColor: 'white',
          color: '#111827',
          border: '1px solid rgb(229, 231, 235)',
          transform: 'translate(0, 0)'
        }}
      >
        <div className="sticky top-0 px-4 py-3 border-b flex justify-between items-center px-[20px]" 
             style={{backgroundColor: 'white', borderBottomColor: '#e5e7eb'}}>
          <h4 className="font-medium text-lg text-gray-800">{title}</h4>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label={t('app.close')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div 
          className={`p-[20px] ${disableScroll ? 'overflow-hidden' : 'overflow-y-auto'}`} 
          style={{backgroundColor: 'white', color: '#111827'}}
        >
          {children}
        </div>
      </div>
    </div>
  );
} 