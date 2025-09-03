import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CrayonFlavor } from '../../types/easterEggs';

interface CrayonSelectorProps {
  isOpen: boolean;
  selectedFlavor: CrayonFlavor | null;
  tastedFlavors: string[];
  onSelectFlavor: (flavor: CrayonFlavor) => void;
  onClose: () => void;
}

const CRAYON_FLAVORS: CrayonFlavor[] = [
  {
    color: 'red',
    name: 'Red',
    description: 'Tastes like blood from a safety brief gone wrong.',
    hex: '#DC143C'
  },
  {
    color: 'blue',
    name: 'Blue', 
    description: 'Tastes like 3-day-old Copenhagen spit in a water bottle.',
    hex: '#0066CC'
  },
  {
    color: 'yellow',
    name: 'Yellow',
    description: 'Tastes like the porta-shitter at 29 Palms in July.',
    hex: '#FFD700'
  },
  {
    color: 'green',
    name: 'Green',
    description: 'Tastes like MRE jalapeño cheese mixed with regret.',
    hex: '#228B22'
  },
  {
    color: 'brown',
    name: 'Brown',
    description: "Tastes like the 'coffee' Gunny's been brewing since Desert Storm.",
    hex: '#8B4513'
  },
  {
    color: 'black',
    name: 'Black',
    description: 'Tastes like burnt oil, CLP, and the tears of boot privates.',
    hex: '#2F2F2F'
  },
  {
    color: 'white',
    name: 'White',
    description: 'Tastes like chalk dust off the barracks wall after a drunken fight.',
    hex: '#F5F5F5'
  },
  {
    color: 'orange',
    name: 'Orange',
    description: 'Tastes like that one mystery meat in the chow hall they swore was chicken.',
    hex: '#FF8C00'
  },
  {
    color: 'purple',
    name: 'Purple',
    description: "Tastes like a Jolly Rancher that's been marinating in an ammo can for a decade.",
    hex: '#8A2BE2'
  }
];

const CrayonSelector: React.FC<CrayonSelectorProps> = ({
  isOpen,
  selectedFlavor,
  tastedFlavors,
  onSelectFlavor,
  onClose
}) => {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTastedCount = () => tastedFlavors.length;
  const hasAchievement = (type: string) => {
    switch (type) {
      case 'patriotic':
        return tastedFlavors.includes('red') && tastedFlavors.includes('white') && tastedFlavors.includes('blue');
      case 'iron-stomach':
        return getTastedCount() === 9;
      case 'green-lover':
        return tastedFlavors.filter(f => f === 'green').length >= 3;
      default:
        return false;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-gray-900 border-2 border-green-500 rounded-lg p-6 max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            style={{ fontFamily: 'monospace' }}
          >
            {/* Header */}
            <div className="mb-6 text-center border-b border-green-500 pb-4">
              <h2 className="text-2xl font-bold text-green-500 mb-2">
                MRE FIELD RATIONS - MENU #64
              </h2>
              <p className="text-green-400 text-sm">
                🖍️ CRAYON VARIETY PACK - 64 COUNT 🖍️
              </p>
              <p className="text-gray-400 text-xs mt-1">
                WARNING: Non-toxic (we think) • Not actual food (but Marines don't mind)
              </p>
              <p className="text-green-300 text-sm mt-2">
                Tasted: {getTastedCount()}/9 flavors
              </p>
            </div>

            {/* Achievements */}
            {(hasAchievement('patriotic') || hasAchievement('iron-stomach')) && (
              <div className="mb-4 p-3 bg-yellow-900 border border-yellow-500 rounded">
                <p className="text-yellow-300 font-bold">🏆 ACHIEVEMENTS UNLOCKED:</p>
                {hasAchievement('patriotic') && (
                  <p className="text-yellow-200 text-sm">• Patriotic Meal - Red, White, Blue consumed</p>
                )}
                {hasAchievement('iron-stomach') && (
                  <p className="text-yellow-200 text-sm">• Iron Stomach - All flavors conquered</p>
                )}
              </div>
            )}

            {/* Crayon Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {CRAYON_FLAVORS.map((flavor) => {
                const isTasted = tastedFlavors.includes(flavor.color);
                const isSelected = selectedFlavor?.color === flavor.color;
                
                return (
                  <motion.button
                    key={flavor.color}
                    className={`
                      relative p-4 border-2 rounded-lg text-left transition-all
                      ${isSelected 
                        ? 'border-yellow-400 bg-yellow-900' 
                        : isTasted 
                          ? 'border-green-500 bg-gray-800' 
                          : 'border-gray-600 bg-gray-800 hover:border-green-400'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onSelectFlavor(flavor)}
                  >
                    {/* Crayon Visual */}
                    <div className="flex items-center mb-2">
                      <div 
                        className="w-8 h-8 rounded mr-3 border"
                        style={{ 
                          backgroundColor: flavor.hex,
                          borderColor: flavor.color === 'white' ? '#666' : flavor.hex 
                        }}
                      >
                        {/* Bite marks for tasted crayons */}
                        {isTasted && (
                          <div className="w-full h-full relative">
                            <div className="absolute top-0 right-0 w-2 h-2 bg-gray-900 rounded-bl-full"></div>
                            <div className="absolute bottom-1 right-1 w-1 h-1 bg-gray-900 rounded-full"></div>
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{flavor.name}</h3>
                        {isTasted && <span className="text-green-400 text-xs">✓ TASTED</span>}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-gray-300 text-sm leading-tight">
                      {flavor.description}
                    </p>

                    {/* Rating for tasted flavors */}
                    {isTasted && (
                      <div className="mt-2 text-xs text-green-400">
                        Rating: {Math.floor(Math.random() * 3) + 3}/5 MREs - Would eat again if ordered
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Selected Flavor Details */}
            {selectedFlavor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gray-800 border border-green-500 rounded"
              >
                <h3 className="text-green-400 font-bold mb-2">FIELD TASTE REPORT:</h3>
                <p className="text-white mb-2">
                  <span className="text-green-300">Flavor:</span> {selectedFlavor.name}
                </p>
                <p className="text-gray-300 mb-3">
                  <span className="text-green-300">Assessment:</span> {selectedFlavor.description}
                </p>
                
                {/* Nutritional Facts (joke) */}
                <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
                  <strong>Nutritional Information (Per Crayon):</strong><br/>
                  Wax: 100% • Actual Nutrition: 0% • Motivation: 200%<br/>
                  Pairs well with: Warm Rip It, regret, and the tears of your enemies
                </div>
              </motion.div>
            )}

            {/* Fun Facts */}
            <div className="mb-6 p-3 bg-gray-800 border border-gray-600 rounded">
              <p className="text-green-400 font-bold mb-1">🧠 MARINE INTEL:</p>
              <p className="text-gray-300 text-sm">
                {getTastedCount() === 0 && "Fun fact: Red pairs well with a warm Rip It"}
                {getTastedCount() === 1 && "Tip: Try the variety pack for a complete nutritional experience"}
                {getTastedCount() === 3 && "Achievement progress: Patriotic Meal requires Red, White, and Blue"}
                {getTastedCount() === 5 && "You're halfway to the Iron Stomach achievement!"}
                {getTastedCount() === 9 && "Congratulations, you've achieved peak Marine cuisine mastery! 🎖️"}
              </p>
            </div>

            {/* Close Button */}
            <div className="text-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors"
              >
                CLOSE CHOW HALL
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CrayonSelector;