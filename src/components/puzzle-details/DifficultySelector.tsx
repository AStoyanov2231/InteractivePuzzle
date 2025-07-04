import { Difficulty } from "@/types";

interface DifficultySelectorProps {
  difficulties: Difficulty[];
  selectedDifficulty: Difficulty | null;
  onSelectDifficulty: (difficulty: Difficulty) => void;
}

interface MathOperationSelectorProps {
  operations: Difficulty[];
  selectedOperations: string[];
  onToggleOperation: (operationId: string) => void;
}

export const MathOperationSelector = ({
  operations,
  selectedOperations,
  onToggleOperation,
}: MathOperationSelectorProps) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-lg text-white font-bold bg-gradient-to-br from-purple-500 to-pink-500 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">1</span>
        <h4 className="text-2xl font-bold text-gray-800">Избери операции</h4>
      </div>
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-20 max-w-md">
          {operations.map((operation) => {
            const isSelected = selectedOperations.includes(operation.id);
            return (
              <button
                key={operation.id}
                onClick={() => onToggleOperation(operation.id)}
                className={`px-8 py-6 rounded-2xl text-base font-semibold transition-all duration-300 touch-manipulation flex items-center justify-center gap-2 w-48 ${
                  isSelected
                    ? 'border-4 shadow-xl transform scale-105' 
                    : 'border-2 hover:shadow-lg hover:scale-102 active:opacity-80 border-transparent'
                }`}
                style={{
                  backgroundColor: isSelected ? operation.color : '#fff',
                  borderColor: isSelected ? operation.color : 'transparent',
                  color: isSelected ? '#fff' : operation.color
                }}
              >
                <span className="text-lg">
                  {operation.id === 'addition' ? '➕' : 
                   operation.id === 'subtraction' ? '➖' : 
                   operation.id === 'multiplication' ? '✖️' : '➗'}
                </span>
                <span>{operation.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const DifficultySelector = ({
  difficulties,
  selectedDifficulty,
  onSelectDifficulty,
}: DifficultySelectorProps) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-lg text-white font-bold bg-gradient-to-br from-purple-500 to-pink-500 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">2</span>
        <h4 className="text-2xl font-bold text-gray-800">Избери трудност</h4>
      </div>
      <div className="flex flex-wrap gap-4">
        {difficulties.map((difficulty) => (
          <button
            key={difficulty.id}
            onClick={() => onSelectDifficulty(difficulty)}
            className={`px-6 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 touch-manipulation ${
              selectedDifficulty?.id === difficulty.id 
                ? 'border-4 shadow-xl transform hover:scale-105 active:scale-95' 
                : 'border-2 hover:shadow-lg hover:scale-102 active:opacity-80 border-transparent'
            }`}
            style={{
              backgroundColor: '#fff',
              borderColor: selectedDifficulty?.id === difficulty.id ? difficulty.color : 'transparent',
              color: difficulty.color
            }}
          >
            {difficulty.name}
          </button>
        ))}
      </div>
    </div>
  );
};
