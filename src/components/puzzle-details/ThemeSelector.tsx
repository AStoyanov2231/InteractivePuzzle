import { Theme } from "@/types";

interface ThemeSelectorProps {
  themes: Theme[];
  selectedTheme: Theme | null;
  onSelectTheme: (theme: Theme) => void;
}

export const ThemeSelector = ({ themes, selectedTheme, onSelectTheme }: ThemeSelectorProps) => {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/30">
      <div className="flex items-center gap-4 mb-6">
        <span className="text-lg text-white font-bold bg-gradient-to-br from-purple-500 to-pink-500 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg">1</span>
        <h4 className="text-2xl font-bold text-gray-800">Избери тема</h4>
      </div>
      <div className="flex flex-wrap gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelectTheme(theme)}
            className={`px-6 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 touch-manipulation flex items-center justify-center gap-3 ${
              selectedTheme?.id === theme.id 
                ? 'border-4 shadow-xl transform hover:scale-105 active:scale-95' 
                : 'border-2 hover:shadow-lg hover:scale-102 active:opacity-80 border-transparent'
            }`}
            style={{ 
              backgroundColor: '#fff',
              borderColor: selectedTheme?.id === theme.id ? theme.color : 'transparent',
              color: theme.color
            }}
          >
            <span className="text-2xl">{theme.icon}</span>
            <span>{theme.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
