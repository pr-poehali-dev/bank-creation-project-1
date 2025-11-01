import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface InvestmentsProps {
  selectedCard: any;
  onInvest: (amount: number, type: string) => void;
}

const Investments = ({ selectedCard, onInvest }: InvestmentsProps) => {
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [selectedInvestment, setSelectedInvestment] = useState('');

  const investmentOptions = [
    {
      id: 'conservative',
      name: 'Консервативный портфель',
      icon: 'Shield',
      gradient: 'from-green-500 to-emerald-500',
      return: '8-12%',
      risk: 'Низкий',
      description: 'Облигации и стабильные активы'
    },
    {
      id: 'balanced',
      name: 'Сбалансированный портфель',
      icon: 'TrendingUp',
      gradient: 'from-blue-500 to-cyan-500',
      return: '12-18%',
      risk: 'Средний',
      description: 'Микс акций и облигаций'
    },
    {
      id: 'aggressive',
      name: 'Агрессивный портфель',
      icon: 'Zap',
      gradient: 'from-purple-500 to-pink-500',
      return: '18-30%',
      risk: 'Высокий',
      description: 'Акции роста и криптовалюта'
    },
    {
      id: 'crypto',
      name: 'Криптовалюты',
      icon: 'Bitcoin',
      gradient: 'from-orange-500 to-red-500',
      return: '20-50%',
      risk: 'Очень высокий',
      description: 'BTC, ETH и другие крипто'
    }
  ];

  const handleInvest = () => {
    if (!amount || !selectedInvestment) {
      toast({
        title: 'Ошибка',
        description: 'Выберите портфель и укажите сумму',
        variant: 'destructive'
      });
      return;
    }

    const investAmount = parseFloat(amount);
    if (investAmount > (selectedCard?.balance || 0)) {
      toast({
        title: 'Недостаточно средств',
        description: 'На карте недостаточно денег',
        variant: 'destructive'
      });
      return;
    }

    onInvest(investAmount, selectedInvestment);
    setAmount('');
    setSelectedInvestment('');
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-white mb-4">Инвестиции</h2>
        <p className="text-gray-400">Приумножайте свой капитал с ОТПК Банк</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {investmentOptions.map((option) => (
          <Card
            key={option.id}
            className={`glass-effect border-white/10 p-6 cursor-pointer transition-all ${
              selectedInvestment === option.id ? 'ring-2 ring-purple-500 scale-105' : 'hover:scale-102'
            }`}
            onClick={() => setSelectedInvestment(option.id)}
          >
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${option.gradient} flex items-center justify-center mb-4`}>
              <Icon name={option.icon} size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{option.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{option.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Доходность:</span>
                <span className="text-green-400 font-semibold">{option.return}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Риск:</span>
                <span className={`font-semibold ${
                  option.risk === 'Низкий' ? 'text-green-400' :
                  option.risk === 'Средний' ? 'text-yellow-400' :
                  option.risk === 'Высокий' ? 'text-orange-400' :
                  'text-red-400'
                }`}>{option.risk}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedInvestment && (
        <Card className="glass-effect border-white/10 p-8 max-w-2xl mx-auto animate-fade-in">
          <h3 className="text-2xl font-bold text-white mb-6">Инвестировать</h3>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Сумма инвестиции</Label>
              <Input
                type="number"
                placeholder="10000"
                className="glass-effect border-white/10 text-white"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <p className="text-gray-400 text-sm mt-2">
                Доступно: {selectedCard?.balance?.toFixed(2) || 0} ₽
              </p>
            </div>

            <div className="glass-effect border-white/10 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-2">Прогноз дохода через год:</p>
              {amount && (
                <p className="text-3xl font-bold text-green-400">
                  +{(parseFloat(amount) * 0.15).toFixed(2)} ₽
                </p>
              )}
            </div>

            <Button
              className="w-full gradient-primary text-white font-semibold"
              onClick={handleInvest}
            >
              Инвестировать {amount} ₽
            </Button>

            <p className="text-gray-400 text-xs text-center">
              Инвестиции связаны с риском. Прошлая доходность не гарантирует будущих результатов.
            </p>
          </div>
        </Card>
      )}

      <Card className="glass-effect border-white/10 p-6 max-w-2xl mx-auto">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Icon name="Info" size={24} className="text-blue-400" />
          </div>
          <div>
            <h4 className="text-white font-semibold mb-2">Почему инвестировать с нами?</h4>
            <ul className="text-gray-400 text-sm space-y-1">
              <li>✓ Низкие комиссии</li>
              <li>✓ Диверсификация портфеля</li>
              <li>✓ Профессиональное управление</li>
              <li>✓ Вывод средств в любой момент</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Investments;
