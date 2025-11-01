import Icon from '@/components/ui/icon';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navItems = [
    { id: 'home', icon: 'Home', label: 'Главная' },
    { id: 'cards', icon: 'CreditCard', label: 'Карты' },
    { id: 'transfer', icon: 'Send', label: 'Переводы' },
    { id: 'investments', icon: 'TrendingUp', label: 'Инвестиции' },
    { id: 'more', icon: 'MoreHorizontal', label: 'Ещё' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-effect border-t border-white/10 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === item.id ? 'text-purple-400' : 'text-gray-400'
              }`}
            >
              <Icon name={item.icon} size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
