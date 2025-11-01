import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

const API_URLS = {
  auth: 'https://functions.poehali.dev/d2a8ceaf-2621-4a04-9ca9-d9492f463324',
  cards: 'https://functions.poehali.dev/2420bae8-4bf1-4f3b-b39c-69b4557d4886',
  transactions: 'https://functions.poehali.dev/50deae80-664d-4ee6-89ca-ac2a7d5bee5b',
  credit: 'https://functions.poehali.dev/48e74b84-b25e-434c-89a5-1c1b76256ea3'
};

interface User {
  id: number;
  phone: string;
  name: string;
}

interface BankCard {
  id: number;
  card_number: string;
  card_type: string;
  balance: number;
  created_at?: string;
}

interface Transaction {
  id: number;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  from_card: string;
  to_card: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<BankCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<BankCard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [qrCode, setQrCode] = useState('');
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isHotlineOpen, setIsHotlineOpen] = useState(false);
  const [isCallConnecting, setIsCallConnecting] = useState(false);
  
  const [transferData, setTransferData] = useState({
    to_identifier: '',
    amount: '',
    identifier_type: 'card'
  });

  const [creditAmount, setCreditAmount] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('bank_user');
    if (!userData) {
      navigate('/');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    loadCards(parsedUser.id);
  }, [navigate]);

  useEffect(() => {
    if (selectedCard) {
      loadTransactions(selectedCard.id);
      generateQRCode(selectedCard.card_number);
    }
  }, [selectedCard]);

  const loadCards = async (userId: number) => {
    const response = await fetch(`${API_URLS.cards}?user_id=${userId}`);
    const data = await response.json();
    setCards(data.cards || []);
    if (data.cards && data.cards.length > 0) {
      setSelectedCard(data.cards[0]);
    }
  };

  const loadTransactions = async (cardId: number) => {
    const response = await fetch(`${API_URLS.transactions}?card_id=${cardId}`);
    const data = await response.json();
    setTransactions(data.transactions || []);
  };

  const createVirtualCard = async () => {
    if (!user) return;
    
    if (cards.length >= 3) {
      toast({
        title: 'Ошибка',
        description: 'Максимум 3 карты на аккаунт',
        variant: 'destructive'
      });
      return;
    }

    const response = await fetch(API_URLS.cards, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        card_type: 'virtual'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      toast({
        title: 'Успешно!',
        description: 'Виртуальная карта создана'
      });
      loadCards(user.id);
    }
  };

  const handleTransfer = async () => {
    if (!selectedCard || !transferData.to_identifier || !transferData.amount) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive'
      });
      return;
    }

    const response = await fetch(API_URLS.transactions, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from_card_id: selectedCard.id,
        to_identifier: transferData.to_identifier,
        amount: parseFloat(transferData.amount),
        identifier_type: transferData.identifier_type
      })
    });

    const data = await response.json();

    if (response.ok) {
      toast({
        title: 'Успешно!',
        description: 'Перевод выполнен'
      });
      setTransferData({ to_identifier: '', amount: '', identifier_type: 'card' });
      if (user) loadCards(user.id);
      loadTransactions(selectedCard.id);
    } else {
      toast({
        title: 'Ошибка',
        description: data.error || 'Не удалось выполнить перевод',
        variant: 'destructive'
      });
    }
  };

  const handleCredit = async () => {
    if (!selectedCard || !creditAmount) {
      toast({
        title: 'Ошибка',
        description: 'Укажите сумму кредита',
        variant: 'destructive'
      });
      return;
    }

    const response = await fetch(API_URLS.credit, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        card_id: selectedCard.id,
        amount: parseFloat(creditAmount)
      })
    });

    const data = await response.json();

    if (response.ok) {
      toast({
        title: 'Кредит одобрен!',
        description: `${creditAmount} ₽ зачислено на карту`
      });
      setCreditAmount('');
      if (user) loadCards(user.id);
      loadTransactions(selectedCard.id);
    } else {
      toast({
        title: 'Ошибка',
        description: data.error || 'Не удалось оформить кредит',
        variant: 'destructive'
      });
    }
  };

  const generateQRCode = async (cardNumber: string) => {
    try {
      const qr = await QRCode.toDataURL(cardNumber);
      setQrCode(qr);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVoiceCommand = (command: string) => {
    const cmd = command.toLowerCase();
    
    if (cmd.includes('перевод') || cmd.includes('отправить')) {
      setActiveTab('transfer');
      toast({
        title: 'ОТПК Бот',
        description: 'Открываю раздел переводов'
      });
    } else if (cmd.includes('кредит')) {
      setActiveTab('credit');
      toast({
        title: 'ОТПК Бот',
        description: 'Открываю раздел кредитов'
      });
    } else if (cmd.includes('баланс')) {
      toast({
        title: 'ОТПК Бот',
        description: selectedCard ? `Ваш баланс: ${selectedCard.balance} ₽` : 'Нет активной карты'
      });
    } else if (cmd.includes('помощь') || cmd.includes('что умеешь')) {
      toast({
        title: 'ОТПК Бот',
        description: 'Я могу: переводить деньги, показывать баланс, оформлять кредиты, звонить на горячую линию'
      });
    } else if (cmd.includes('горячая линия') || cmd.includes('позвонить')) {
      handleHotlineCall();
    } else {
      toast({
        title: 'ОТПК Бот',
        description: 'Команда не распознана. Скажите "помощь" чтобы узнать, что я умею'
      });
    }
  };

  const handleHotlineCall = () => {
    setIsHotlineOpen(true);
    setIsCallConnecting(true);
    
    const waitingAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE=');
    waitingAudio.loop = true;
    waitingAudio.play();

    setTimeout(() => {
      waitingAudio.pause();
      setIsCallConnecting(false);
      
      const robotMessage = new SpeechSynthesisUtterance('Здравствуйте! Вас приветствует служба поддержки ОТПК Банк. Чем я могу вам помочь?');
      robotMessage.lang = 'ru-RU';
      robotMessage.rate = 0.9;
      window.speechSynthesis.speak(robotMessage);
      
      toast({
        title: 'Горячая линия',
        description: 'Робот: Здравствуйте! Чем могу помочь?'
      });
    }, 3000);
  };

  const logout = () => {
    localStorage.removeItem('bank_user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <nav className="glass-effect border-b border-white/10 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Icon name="Sparkles" size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">ОТПК Банк</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-white">{user.name}</span>
            <Button variant="outline" onClick={logout} className="glass-effect text-white border-white/20">
              Выйти
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 glass-effect mb-8">
            <TabsTrigger value="home" className="data-[state=active]:bg-purple-500">
              <Icon name="Home" size={20} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="cards" className="data-[state=active]:bg-purple-500">
              <Icon name="CreditCard" size={20} className="mr-2" />
              Карты
            </TabsTrigger>
            <TabsTrigger value="transfer" className="data-[state=active]:bg-purple-500">
              <Icon name="Send" size={20} className="mr-2" />
              Переводы
            </TabsTrigger>
            <TabsTrigger value="credit" className="data-[state=active]:bg-purple-500">
              <Icon name="TrendingUp" size={20} className="mr-2" />
              Кредиты
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-500">
              <Icon name="History" size={20} className="mr-2" />
              История
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedCard && (
                <Card className="glass-effect border-white/10 p-8">
                  <h3 className="text-xl font-bold text-white mb-6">Активная карта</h3>
                  <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 p-6 flex flex-col justify-between mb-6">
                    <div className="flex justify-between items-start">
                      <Icon name="CreditCard" size={32} className="text-white" />
                      <span className="text-white text-sm opacity-80">{selectedCard.card_type}</span>
                    </div>
                    <div className="text-white">
                      <p className="text-sm opacity-80 mb-1">Номер карты</p>
                      <p className="text-xl font-bold mb-4">{selectedCard.card_number}</p>
                      <p className="text-3xl font-bold">{selectedCard.balance.toFixed(2)} ₽</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1 gradient-primary" onClick={() => setActiveTab('transfer')}>
                      <Icon name="Send" size={16} className="mr-2" />
                      Перевести
                    </Button>
                    <Button className="flex-1 gradient-primary" onClick={() => setActiveTab('credit')}>
                      <Icon name="TrendingUp" size={16} className="mr-2" />
                      Кредит
                    </Button>
                  </div>
                </Card>
              )}

              <Card className="glass-effect border-white/10 p-8">
                <h3 className="text-xl font-bold text-white mb-6">Быстрые действия</h3>
                <div className="space-y-4">
                  <Button className="w-full glass-effect text-white border-white/20 justify-start" onClick={createVirtualCard}>
                    <Icon name="Plus" size={20} className="mr-2" />
                    Создать виртуальную карту
                  </Button>
                  <Button className="w-full glass-effect text-white border-white/20 justify-start" onClick={() => setIsVoiceAssistantOpen(true)}>
                    <Icon name="Mic" size={20} className="mr-2" />
                    ОТПК Бот (голосовой помощник)
                  </Button>
                  <Button className="w-full glass-effect text-white border-white/20 justify-start" onClick={() => setIsHotlineOpen(true)}>
                    <Icon name="Phone" size={20} className="mr-2" />
                    Горячая линия 24/7
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="cards">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cards.map((card) => (
                <Card key={card.id} className="glass-effect border-white/10 p-6 hover:scale-105 transition-transform cursor-pointer" onClick={() => setSelectedCard(card)}>
                  <div className={`w-full h-48 rounded-2xl bg-gradient-to-br ${selectedCard?.id === card.id ? 'from-purple-500 to-blue-500' : 'from-gray-600 to-gray-800'} p-6 flex flex-col justify-between mb-4`}>
                    <div className="flex justify-between items-start">
                      <Icon name="CreditCard" size={28} className="text-white" />
                      <Icon name="Wifi" size={20} className="text-white" />
                    </div>
                    <div className="text-white">
                      <p className="text-xs opacity-80 mb-1">{card.card_type}</p>
                      <p className="text-lg font-bold mb-2">{card.card_number}</p>
                      <p className="text-2xl font-bold">{card.balance.toFixed(2)} ₽</p>
                    </div>
                  </div>
                </Card>
              ))}
              
              {cards.length < 3 && (
                <Card className="glass-effect border-white/10 p-6 hover:scale-105 transition-transform cursor-pointer flex items-center justify-center min-h-[300px]" onClick={createVirtualCard}>
                  <div className="text-center">
                    <Icon name="Plus" size={48} className="text-white/50 mx-auto mb-4" />
                    <p className="text-white">Создать виртуальную карту</p>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="transfer">
            <Card className="glass-effect border-white/10 p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">Перевод денег</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Тип перевода</Label>
                  <Select value={transferData.identifier_type} onValueChange={(value) => setTransferData({...transferData, identifier_type: value})}>
                    <SelectTrigger className="glass-effect border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1625] border-white/10">
                      <SelectItem value="card">По номеру карты</SelectItem>
                      <SelectItem value="phone">По номеру телефона</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">
                    {transferData.identifier_type === 'phone' ? 'Номер телефона' : 'Номер карты'}
                  </Label>
                  <Input
                    placeholder={transferData.identifier_type === 'phone' ? '+7 (999) 123-45-67' : '1234 5678 9012 3456'}
                    className="glass-effect border-white/10 text-white"
                    value={transferData.to_identifier}
                    onChange={(e) => setTransferData({...transferData, to_identifier: e.target.value})}
                  />
                </div>

                <div>
                  <Label className="text-white">Сумма</Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    className="glass-effect border-white/10 text-white"
                    value={transferData.amount}
                    onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                  />
                </div>

                <Button className="w-full gradient-primary" onClick={handleTransfer}>
                  Перевести
                </Button>

                {qrCode && (
                  <div className="mt-6 text-center">
                    <p className="text-white mb-4">QR-код для оплаты</p>
                    <img src={qrCode} alt="QR Code" className="mx-auto rounded-lg" />
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="credit">
            <Card className="glass-effect border-white/10 p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">Оформить кредит</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Сумма кредита</Label>
                  <Input
                    type="number"
                    placeholder="50000"
                    className="glass-effect border-white/10 text-white"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                  />
                </div>

                <div className="glass-effect border-white/10 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Кредит будет зачислен на выбранную карту мгновенно</p>
                  <p className="text-gray-400 text-sm">Без процентов и комиссий</p>
                </div>

                <Button className="w-full gradient-primary" onClick={handleCredit}>
                  Получить кредит
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="glass-effect border-white/10 p-8">
              <h3 className="text-2xl font-bold text-white mb-6">История операций</h3>
              
              {transactions.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Нет транзакций</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="glass-effect border-white/10 p-4 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full ${tx.type === 'credit' ? 'bg-green-500/20' : 'bg-blue-500/20'} flex items-center justify-center`}>
                          <Icon name={tx.type === 'credit' ? 'TrendingUp' : 'Send'} size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="text-white font-semibold">{tx.description}</p>
                          <p className="text-gray-400 text-sm">{new Date(tx.created_at).toLocaleString('ru-RU')}</p>
                        </div>
                      </div>
                      <p className={`text-xl font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-blue-400'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount.toFixed(2)} ₽
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isVoiceAssistantOpen} onOpenChange={setIsVoiceAssistantOpen}>
        <DialogContent className="bg-[#1a1625] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Icon name="Mic" size={28} />
              ОТПК Бот - Голосовой помощник
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Скажите команду или введите текст
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="glass-effect border-white/10 p-4 rounded-lg">
              <p className="text-white text-sm mb-2">Доступные команды:</p>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• "Перевод" - открыть раздел переводов</li>
                <li>• "Баланс" - показать баланс карты</li>
                <li>• "Кредит" - оформить кредит</li>
                <li>• "Горячая линия" - позвонить в поддержку</li>
                <li>• "Помощь" - список всех команд</li>
              </ul>
            </div>

            <Input
              placeholder="Введите команду..."
              className="glass-effect border-white/10 text-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleVoiceCommand(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />

            <Button
              className="w-full gradient-primary"
              onClick={() => {
                if ('webkitSpeechRecognition' in window) {
                  const recognition = new (window as any).webkitSpeechRecognition();
                  recognition.lang = 'ru-RU';
                  recognition.onresult = (event: any) => {
                    const command = event.results[0][0].transcript;
                    handleVoiceCommand(command);
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
              }}
            >
              <Icon name="Mic" size={20} className="mr-2" />
              Голосовой ввод
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHotlineOpen} onOpenChange={setIsHotlineOpen}>
        <DialogContent className="bg-[#1a1625] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Icon name="Phone" size={28} />
              Горячая линия ОТПК Банк
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isCallConnecting ? 'Соединяем с оператором...' : 'Вас приветствует робот службы поддержки'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {isCallConnecting ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <Icon name="Phone" size={40} className="text-white" />
                </div>
                <p className="text-white">Ожидайте соединения...</p>
                <p className="text-gray-400 text-sm">Играет музыка ожидания</p>
              </div>
            ) : (
              <div>
                <div className="glass-effect border-white/10 p-4 rounded-lg mb-4">
                  <p className="text-white mb-2">🤖 Робот: Здравствуйте! Чем могу помочь?</p>
                  <p className="text-gray-400 text-sm">Выберите тему обращения:</p>
                </div>

                <div className="space-y-2">
                  <Button className="w-full glass-effect text-white border-white/20 justify-start" onClick={() => {
                    toast({ title: 'Робот', description: 'Переключаю на консультанта по картам...' });
                  }}>
                    Вопросы по картам
                  </Button>
                  <Button className="w-full glass-effect text-white border-white/20 justify-start" onClick={() => {
                    toast({ title: 'Робот', description: 'Переключаю на консультанта по кредитам...' });
                  }}>
                    Вопросы по кредитам
                  </Button>
                  <Button className="w-full glass-effect text-white border-white/20 justify-start" onClick={() => {
                    toast({ title: 'Робот', description: 'Открываю техническую поддержку...' });
                  }}>
                    Техническая поддержка
                  </Button>
                  <Button className="w-full glass-effect text-white border-white/20 justify-start" onClick={() => {
                    toast({ title: 'Робот', description: 'Соединяю с живым оператором...' });
                  }}>
                    Связаться с оператором
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-6 right-6 flex flex-col gap-4">
        <Button
          className="w-14 h-14 rounded-full gradient-primary shadow-lg"
          onClick={() => setIsVoiceAssistantOpen(true)}
        >
          <Icon name="Mic" size={24} />
        </Button>
        <Button
          className="w-14 h-14 rounded-full bg-green-500 shadow-lg hover:bg-green-600"
          onClick={() => setIsHotlineOpen(true)}
        >
          <Icon name="Phone" size={24} />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
