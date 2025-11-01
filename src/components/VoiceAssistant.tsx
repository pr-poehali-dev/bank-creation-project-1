import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface VoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string, mode: string) => void;
  selectedCard: any;
}

const VoiceAssistant = ({ isOpen, onClose, onCommand, selectedCard }: VoiceAssistantProps) => {
  const { toast } = useToast();
  const [mode, setMode] = useState('normal');
  const [inputValue, setInputValue] = useState('');

  const modes = [
    { id: 'ai', name: 'AI режим', icon: 'Sparkles', description: 'Умный помощник с AI' },
    { id: 'normal', name: 'Обычный', icon: 'MessageCircle', description: 'Стандартные команды' },
    { id: 'child', name: 'Детский', icon: 'Baby', description: 'Простой интерфейс для детей' },
    { id: 'adult', name: 'Взрослый', icon: 'User', description: 'Расширенные функции' }
  ];

  const getModeCommands = (currentMode: string) => {
    const baseCommands = [
      '• "Баланс" - показать баланс карты',
      '• "Перевод" - открыть раздел переводов',
      '• "История" - показать историю операций',
      '• "Помощь" - список всех команд'
    ];

    switch (currentMode) {
      case 'ai':
        return [
          '• Спросите что угодно про банк',
          '• "Как перевести деньги?"',
          '• "Сколько у меня денег?"',
          '• "Оформи кредит на 50000"',
          '• AI поймёт естественную речь'
        ];
      case 'child':
        return [
          '🎈 "Сколько денег" - узнать сколько денег',
          '🎨 "Отправить маме" - перевести деньги',
          '🎮 "Что я покупал" - посмотреть покупки',
          '🎪 "Помоги" - получить помощь'
        ];
      case 'adult':
        return [
          ...baseCommands,
          '• "Кредит" - оформить кредит',
          '• "Инвестиции" - открыть инвестиции',
          '• "Горячая линия" - связаться с поддержкой',
          '• "Статистика" - финансовая статистика'
        ];
      default:
        return baseCommands;
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.onresult = (event: any) => {
        const command = event.results[0][0].transcript;
        setInputValue(command);
        handleCommand(command);
      };
      recognition.start();
      toast({
        title: 'Слушаю...',
        description: 'Говорите команду'
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Голосовой ввод не поддерживается',
        variant: 'destructive'
      });
    }
  };

  const handleCommand = (command: string) => {
    onCommand(command, mode);
  };

  const getModeColor = (currentMode: string) => {
    switch (currentMode) {
      case 'ai': return 'from-purple-500 to-pink-500';
      case 'child': return 'from-yellow-500 to-orange-500';
      case 'adult': return 'from-blue-500 to-cyan-500';
      default: return 'from-green-500 to-emerald-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a1625] border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getModeColor(mode)} flex items-center justify-center`}>
              <Icon name="Mic" size={24} className="text-white" />
            </div>
            ОТПК Бот
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Голосовой помощник с разными режимами
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="grid w-full grid-cols-4 glass-effect mb-4">
            {modes.map((m) => (
              <TabsTrigger 
                key={m.id} 
                value={m.id}
                className="data-[state=active]:bg-purple-500 flex flex-col gap-1 py-3"
              >
                <Icon name={m.icon} size={20} />
                <span className="text-xs">{m.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {modes.map((m) => (
            <TabsContent key={m.id} value={m.id} className="space-y-4">
              <div className={`glass-effect border-white/10 p-4 rounded-lg bg-gradient-to-r ${getModeColor(m.id)} bg-opacity-10`}>
                <p className="text-white font-semibold mb-2">{m.description}</p>
                <div className="text-gray-300 text-sm space-y-1">
                  {getModeCommands(m.id).map((cmd, idx) => (
                    <p key={idx}>{cmd}</p>
                  ))}
                </div>
              </div>

              {selectedCard && (
                <div className="glass-effect border-white/10 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Активная карта:</p>
                  <p className="text-white font-semibold">{selectedCard.card_number}</p>
                  <p className="text-2xl font-bold text-white mt-2">{selectedCard.balance?.toFixed(2)} ₽</p>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder={
                    m.id === 'child' ? 'Скажи что хочешь...' :
                    m.id === 'ai' ? 'Спросите что угодно...' :
                    'Введите команду...'
                  }
                  className="glass-effect border-white/10 text-white"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputValue.trim()) {
                      handleCommand(inputValue);
                      setInputValue('');
                    }
                  }}
                />
                <Button
                  className={`bg-gradient-to-br ${getModeColor(m.id)}`}
                  onClick={handleVoiceInput}
                >
                  <Icon name="Mic" size={20} />
                </Button>
              </div>

              <Button
                className={`w-full bg-gradient-to-br ${getModeColor(m.id)} text-white font-semibold`}
                onClick={() => {
                  if (inputValue.trim()) {
                    handleCommand(inputValue);
                    setInputValue('');
                  }
                }}
              >
                Отправить команду
              </Button>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceAssistant;
