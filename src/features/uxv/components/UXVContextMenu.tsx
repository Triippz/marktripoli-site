import React from 'react';
import { UXVPosition, UXVContextMenu as ContextMenuType } from '../types';

interface UXVContextMenuProps {
  contextMenu: ContextMenuType;
  onSetTarget: (target: UXVPosition) => void;
  onDropPayload: (target: UXVPosition) => void;
  onClose: () => void;
}

const UXVContextMenu: React.FC<UXVContextMenuProps> = ({
  contextMenu,
  onSetTarget,
  onDropPayload,
  onClose
}) => {
  const handleSetTarget = () => {
    onSetTarget({ lng: contextMenu.lng, lat: contextMenu.lat });
    onClose();
  };

  const handleDropPayload = () => {
    onDropPayload({ lng: contextMenu.lng, lat: contextMenu.lat });
    onClose();
  };

  return (
    <div 
      className="absolute z-[121]" 
      style={{ left: contextMenu.x, top: contextMenu.y }}
    >
      <div className="tactical-panel p-2 text-xs font-mono">
        <div className="flex flex-col gap-1">
          <button 
            className="tactical-button text-[11px] px-2 py-1" 
            onClick={handleSetTarget}
          >
            Set Target Here
          </button>
          <button 
            className="tactical-button text-[11px] px-2 py-1" 
            onClick={handleDropPayload}
          >
            Drop Payload Here
          </button>
          <button 
            className="tactical-button text-[11px] px-2 py-1" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UXVContextMenu;