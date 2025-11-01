import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface CardTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCard: (cardType: string, cardName: string, cardCategory: string, isChildCard: boolean) => void;
}

const CardTypeSelector = ({ isOpen, onClose, onCreateCard }: CardTypeSelectorProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const cardCategories = [
    { id: 'debit-premium', name: 'Дебетовая карта Premium', category: 'debit', gradient: 'from-purple-500 to-pink-500', icon: 'CreditCard' },
    { id: 'credit-gold', name: 'Кредитная карта Gold', category: 'credit', gradient: 'from-blue-500 to-cyan-500', icon: 'Sparkles' },
    { id: 'youth', name: 'Молодёжная карта Start', category: 'youth', gradient: 'from-green-500 to-emerald-500', icon: 'Zap' },
    { id: 'child', name: 'Детская карта', category: 'child', gradient: 'from-yellow-500 to-orange-500', icon: 'Baby', isChild: true }
  ];

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.id);
    setStep(2);
  };

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    const category = cardCategories.find(c => c.id === selectedCategory);
    if (category) {
      onCreateCard(type, category.name, category.category, category.isChild || false);
      toast({
        title: 'Карта создаётся',
        description: `${category.name} (${type === 'virtual' ? 'виртуальная' : 'пластиковая'})`
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCategory('');
    setSelectedType('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1625] border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            {step === 1 ? 'Выберите тип карты' : 'Выберите формат карты'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === 1 ? 'Какую карту вы хотите оформить?' : 'Виртуальная или пластиковая карта?'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {cardCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className="glass-effect border-white/10 p-6 rounded-xl hover:scale-105 transition-transform text-left"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-4`}>
                  <Icon name={category.icon} size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{category.name}</h3>
                <p className="text-gray-400 text-sm">
                  {category.category === 'debit' && 'Кэшбэк до 30%'}
                  {category.category === 'credit' && 'Лимит до 1 000 000 ₽'}
                  {category.category === 'youth' && 'Для лиц 14-25 лет'}
                  {category.category === 'child' && 'Для детей до 14 лет'}
                </p>
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-4">
            <Button
              className="w-full glass-effect text-white border-white/20 justify-start h-auto py-6"
              onClick={() => handleTypeSelect('virtual')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Icon name="Smartphone" size={24} className="text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold">Виртуальная карта</p>
                  <p className="text-sm text-gray-400">Мгновенная выдача, для онлайн-покупок</p>
                </div>
              </div>
            </Button>

            <Button
              className="w-full glass-effect text-white border-white/20 justify-start h-auto py-6"
              onClick={() => {
                toast({
                  title: 'Пластиковая карта',
                  description: 'Доставка пластиковых карт временно недоступна. Оформите виртуальную карту.',
                });
              }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Icon name="CreditCard" size={24} className="text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold">Пластиковая карта</p>
                  <p className="text-sm text-gray-400">Доставка в течение 3-5 дней</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full glass-effect text-white border-white/20"
              onClick={() => setStep(1)}
            >
              <Icon name="ArrowLeft" size={20} className="mr-2" />
              Назад
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CardTypeSelector;
