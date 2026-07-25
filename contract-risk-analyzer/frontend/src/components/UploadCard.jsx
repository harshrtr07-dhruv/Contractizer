import React, { useState } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { HudPanel, HudButton } from './hud';
import { motion } from 'framer-motion';

const UploadCard = ({ onStartUpload, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      setError('File size exceeds the 20MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      validateAndSetFile(selected);
      if (onStartUpload && selected.name.toLowerCase().endsWith('.pdf')) {
        onStartUpload(selected);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      validateAndSetFile(selected);
      if (onStartUpload && selected.name.toLowerCase().endsWith('.pdf')) {
        onStartUpload(selected);
      }
    }
  };

  const handleUploadClick = () => {
    if (file && onStartUpload) {
      onStartUpload(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <HudPanel label="FLIGHT DECK UPLOAD ZONE" accentColor="signal-yellow" className="p-6">
        <p className="text-xs font-mono text-ink/60 mb-6">
          PDF FILES UP TO 20MB ARE PROCESSED USING AI ZERO-SHOT HAZARD TELEMETRY.
        </p>

      {error && (
        <div className="mb-4 p-3 rounded-none bg-clearance-pink border border-ink text-surface text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-none p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-signal-yellow bg-signal-yellow/10'
            : 'border-ink/30 bg-surface/60 hover:border-ink'
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-none bg-paper border border-ink text-ink">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="font-['TT_Lakes_Neue','Space_Grotesk'] text-sm font-bold text-ink uppercase tracking-tight">
              DRAG & DROP CONTRACT PDF TO LAUNCH ANALYSIS
            </p>
            <p className="font-mono text-xs text-ink/60 mt-1">OR CLICK TO SELECT FROM FILE SYSTEM</p>
          </div>
        </div>
      </form>

      {file && (
        <div className="mt-4 p-4 rounded-none bg-surface border border-ink flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="w-5 h-5 text-ink" />
            <div>
              <p className="text-xs font-mono font-bold text-ink truncate max-w-xs">{file.name}</p>
              <p className="text-[10px] font-mono text-ink/60">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>

          <HudButton variant="caution" onClick={handleUploadClick}>
            LAUNCH 3D FLIGHT ANALYSIS
          </HudButton>
        </div>
      )}
      </HudPanel>
    </motion.div>
  );
};

export default UploadCard;
