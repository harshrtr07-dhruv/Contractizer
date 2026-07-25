import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HudButton } from '../hud/HudButton';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'CONFIRM',
  cancelText = 'CANCEL',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-full max-w-sm p-6 pointer-events-auto"
              style={{
                backgroundColor: 'var(--color-ink, #12181A)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h3
                className="text-[18px] font-bold uppercase tracking-tight mb-3"
                style={{
                  fontFamily: '"Space Grotesk", sans-serif',
                  color: 'var(--color-paper, #FFFFFF)',
                }}
              >
                {title}
              </h3>
              <p
                className="text-[14px] opacity-70 mb-8"
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  color: 'var(--color-paper, #FFFFFF)',
                }}
              >
                {message}
              </p>

              <div className="flex items-center justify-center gap-6 mt-4">
                <button 
                  onClick={onClose}
                  className="px-[16px] py-[8px] text-[11px] font-extrabold uppercase tracking-[0.12em] opacity-60 hover:opacity-100 transition-opacity"
                  style={{
                    fontFamily: '"IBM Plex Mono", monospace',
                    color: 'var(--color-paper, #FFFFFF)',
                  }}
                >
                  {cancelText}
                </button>
                <HudButton variant="critical" size="sm" onClick={onConfirm}>
                  {confirmText}
                </HudButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
