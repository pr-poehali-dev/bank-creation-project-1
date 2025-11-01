import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const API_URLS = {
  auth: 'https://functions.poehali.dev/d2a8ceaf-2621-4a04-9ca9-d9492f463324'
};

const Index = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const { toast } = useToast();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authData, setAuthData] = useState({ phone: '', name: '' });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    amount: '',
    term: ''
  });

  const handleSubmit = (type: string) => {
    toast({
      title: "Заявка отправлена!",
      description: `Ваша заявка на ${type} принята. Мы свяжемся с вами в ближайшее время.`,
    });
    setFormData({ name: '', phone: '', email: '', amount: '', term: '' });
  };

  const services = [
    { id: 'cards', icon: 'CreditCard', title: 'Карты', description: 'Дебетовые и кредитные карты с кэшбэком до 30%', gradient: 'from-purple-500 to-pink-500' },
    { id: 'credits', icon: 'TrendingUp', title: 'Кредиты', description: 'Кредиты наличными от 4.9% годовых', gradient: 'from-blue-500 to-cyan-500' },
    { id: 'deposits', icon: 'PiggyBank', title: 'Вклады', description: 'Накопительные счета до 18% годовых', gradient: 'from-green-500 to-emerald-500' },
    { id: 'mortgage', icon: 'Home', title: 'Ипотека', description: 'Ипотечные программы от 6% годовых', gradient: 'from-orange-500 to-red-500' },
    { id: 'investments', icon: 'LineChart', title: 'Инвестиции', description: 'Брокерские счета и готовые портфели', gradient: 'from-violet-500 to-purple-500' },
    { id: 'insurance', icon: 'Shield', title: 'Страхование', description: 'Защита здоровья, имущества и путешествий', gradient: 'from-indigo-500 to-blue-500' },
    { id: 'business', icon: 'Briefcase', title: 'Бизнесу', description: 'Расчетные счета и эквайринг для бизнеса', gradient: 'from-yellow-500 to-orange-500' },
    { id: 'support', icon: 'Headphones', title: 'Поддержка', description: 'Круглосуточная поддержка клиентов 24/7', gradient: 'from-pink-500 to-rose-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <nav className="fixed top-0 w-full z-50 glass-effect border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Icon name="Sparkles" size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold text-white">ОТПК Банк</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              {['Карты', 'Кредиты', 'Вклады', 'Ипотека', 'Инвестиции', 'Страхование', 'Бизнесу', 'Поддержка'].map((item) => (
                <button 
                  key={item}
                  className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
                  onClick={() => {
                    const element = document.getElementById(item.toLowerCase());
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-white font-semibold hover:scale-105 transition-transform">
                  Войти
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-[#1a1625] border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-white">Вход в ОТПК Банк</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Введите номер телефона и имя для входа или регистрации
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="login-phone" className="text-white">Номер телефона</Label>
                    <Input 
                      id="login-phone" 
                      placeholder="+7 (999) 123-45-67" 
                      className="glass-effect border-white/10 text-white"
                      value={authData.phone}
                      onChange={(e) => setAuthData({...authData, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-name" className="text-white">Ваше имя</Label>
                    <Input 
                      id="login-name" 
                      placeholder="Иван Иванов" 
                      className="glass-effect border-white/10 text-white"
                      value={authData.name}
                      onChange={(e) => setAuthData({...authData, name: e.target.value})}
                    />
                  </div>
                  <Button 
                    className="w-full gradient-primary text-white font-semibold"
                    onClick={async () => {
                      if (!authData.phone || !authData.name) {
                        toast({
                          title: 'Ошибка',
                          description: 'Заполните все поля',
                          variant: 'destructive'
                        });
                        return;
                      }
                      
                      const response = await fetch(API_URLS.auth, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(authData)
                      });
                      
                      const data = await response.json();
                      
                      if (response.ok) {
                        localStorage.setItem('bank_user', JSON.stringify(data.user));
                        toast({
                          title: 'Успешно!',
                          description: data.message
                        });
                        navigate('/dashboard');
                      } else {
                        toast({
                          title: 'Ошибка',
                          description: data.error,
                          variant: 'destructive'
                        });
                      }
                    }}
                  >
                    Войти / Зарегистрироваться
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 animate-fade-in">
        <div className="container mx-auto text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            ОТПК Банк
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Современные финансовые решения для вашего успеха. Управляйте деньгами легко и безопасно.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="gradient-primary text-white font-semibold text-lg px-8 hover:scale-105 transition-transform">
              Открыть счёт
              <Icon name="ArrowRight" size={20} className="ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="glass-effect text-white border-white/20 hover:border-white/40 font-semibold text-lg px-8">
              Узнать больше
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 px-6" id="services">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-white">Наши услуги</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card 
                key={service.id}
                className="glass-effect border-white/10 p-6 hover:scale-105 transition-all duration-300 cursor-pointer group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  const element = document.getElementById(service.id);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform`}>
                  <Icon name={service.icon} size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
                <p className="text-gray-400">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6" id="cards">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-white">Карты</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="glass-effect border-white/10 p-8 hover:scale-105 transition-transform">
              <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Icon name="CreditCard" size={32} className="text-white" />
                  <Icon name="Wifi" size={24} className="text-white" />
                </div>
                <div className="text-white">
                  <p className="text-sm opacity-80 mb-1">Дебетовая карта</p>
                  <p className="text-2xl font-bold">Premium</p>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Дебетовая Premium</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Кэшбэк до 30%
                </li>
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Бесплатное обслуживание
                </li>
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Снятие без комиссии
                </li>
              </ul>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gradient-primary text-white font-semibold">
                    Оформить карту
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1625] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-white">Заявка на карту</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Заполните форму, и мы свяжемся с вами для оформления карты
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="name" className="text-white">ФИО</Label>
                      <Input 
                        id="name" 
                        placeholder="Иванов Иван Иванович" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-white">Телефон</Label>
                      <Input 
                        id="phone" 
                        placeholder="+7 (999) 123-45-67" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="example@mail.ru" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full gradient-primary text-white font-semibold"
                      onClick={() => handleSubmit('дебетовую карту')}
                    >
                      Отправить заявку
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>

            <Card className="glass-effect border-white/10 p-8 hover:scale-105 transition-transform">
              <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Icon name="CreditCard" size={32} className="text-white" />
                  <Icon name="Sparkles" size={24} className="text-white" />
                </div>
                <div className="text-white">
                  <p className="text-sm opacity-80 mb-1">Кредитная карта</p>
                  <p className="text-2xl font-bold">Gold</p>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Кредитная Gold</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Лимит до 1 000 000 ₽
                </li>
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  120 дней без процентов
                </li>
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Кэшбэк до 10%
                </li>
              </ul>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gradient-primary text-white font-semibold">
                    Оформить карту
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1625] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-white">Заявка на карту</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Заполните форму, и мы свяжемся с вами для оформления карты
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="name2" className="text-white">ФИО</Label>
                      <Input 
                        id="name2" 
                        placeholder="Иванов Иван Иванович" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone2" className="text-white">Телефон</Label>
                      <Input 
                        id="phone2" 
                        placeholder="+7 (999) 123-45-67" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email2" className="text-white">Email</Label>
                      <Input 
                        id="email2" 
                        type="email" 
                        placeholder="example@mail.ru" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full gradient-primary text-white font-semibold"
                      onClick={() => handleSubmit('кредитную карту')}
                    >
                      Отправить заявку
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>

            <Card className="glass-effect border-white/10 p-8 hover:scale-105 transition-transform">
              <div className="w-full h-48 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 mb-6 p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Icon name="CreditCard" size={32} className="text-white" />
                  <Icon name="Zap" size={24} className="text-white" />
                </div>
                <div className="text-white">
                  <p className="text-sm opacity-80 mb-1">Молодёжная карта</p>
                  <p className="text-2xl font-bold">Start</p>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Молодёжная Start</h3>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Для лиц 14-25 лет
                </li>
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Кэшбэк на развлечения
                </li>
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Бесплатная доставка
                </li>
              </ul>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gradient-primary text-white font-semibold">
                    Оформить карту
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1625] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-white">Заявка на карту</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Заполните форму, и мы свяжемся с вами для оформления карты
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="name3" className="text-white">ФИО</Label>
                      <Input 
                        id="name3" 
                        placeholder="Иванов Иван Иванович" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone3" className="text-white">Телефон</Label>
                      <Input 
                        id="phone3" 
                        placeholder="+7 (999) 123-45-67" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email3" className="text-white">Email</Label>
                      <Input 
                        id="email3" 
                        type="email" 
                        placeholder="example@mail.ru" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full gradient-primary text-white font-semibold"
                      onClick={() => handleSubmit('молодёжную карту')}
                    >
                      Отправить заявку
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-black/20" id="credits">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-5xl font-bold text-center mb-16 text-white">Кредиты</h2>
          <Card className="glass-effect border-white/10 p-8">
            <Tabs defaultValue="cash" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass-effect">
                <TabsTrigger value="cash" className="data-[state=active]:bg-purple-500">Наличными</TabsTrigger>
                <TabsTrigger value="refinance" className="data-[state=active]:bg-purple-500">Рефинансирование</TabsTrigger>
                <TabsTrigger value="auto" className="data-[state=active]:bg-purple-500">Автокредит</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cash" className="space-y-6 mt-6">
                <div className="text-center mb-8">
                  <p className="text-gray-400 mb-2">Ставка от</p>
                  <p className="text-5xl font-bold text-white mb-2">4.9%</p>
                  <p className="text-gray-400">годовых</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount" className="text-white">Сумма кредита</Label>
                    <Input 
                      id="amount" 
                      placeholder="500 000 ₽" 
                      className="glass-effect border-white/10 text-white"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="term" className="text-white">Срок кредита</Label>
                    <Select value={formData.term} onValueChange={(value) => setFormData({...formData, term: value})}>
                      <SelectTrigger className="glass-effect border-white/10 text-white">
                        <SelectValue placeholder="Выберите срок" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1625] border-white/10">
                        <SelectItem value="12">12 месяцев</SelectItem>
                        <SelectItem value="24">24 месяца</SelectItem>
                        <SelectItem value="36">36 месяцев</SelectItem>
                        <SelectItem value="60">60 месяцев</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="name-credit" className="text-white">ФИО</Label>
                    <Input 
                      id="name-credit" 
                      placeholder="Иванов Иван Иванович" 
                      className="glass-effect border-white/10 text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone-credit" className="text-white">Телефон</Label>
                    <Input 
                      id="phone-credit" 
                      placeholder="+7 (999) 123-45-67" 
                      className="glass-effect border-white/10 text-white"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <Button 
                    className="w-full gradient-primary text-white font-semibold"
                    onClick={() => handleSubmit('кредит наличными')}
                  >
                    Отправить заявку
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="refinance" className="space-y-6 mt-6">
                <div className="text-center mb-8">
                  <p className="text-gray-400 mb-2">Ставка от</p>
                  <p className="text-5xl font-bold text-white mb-2">6.9%</p>
                  <p className="text-gray-400">годовых</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount2" className="text-white">Сумма кредита</Label>
                    <Input 
                      id="amount2" 
                      placeholder="1 000 000 ₽" 
                      className="glass-effect border-white/10 text-white"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="term2" className="text-white">Срок кредита</Label>
                    <Select value={formData.term} onValueChange={(value) => setFormData({...formData, term: value})}>
                      <SelectTrigger className="glass-effect border-white/10 text-white">
                        <SelectValue placeholder="Выберите срок" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1625] border-white/10">
                        <SelectItem value="12">12 месяцев</SelectItem>
                        <SelectItem value="24">24 месяца</SelectItem>
                        <SelectItem value="36">36 месяцев</SelectItem>
                        <SelectItem value="60">60 месяцев</SelectItem>
                        <SelectItem value="84">84 месяца</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="name-refi" className="text-white">ФИО</Label>
                    <Input 
                      id="name-refi" 
                      placeholder="Иванов Иван Иванович" 
                      className="glass-effect border-white/10 text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone-refi" className="text-white">Телефон</Label>
                    <Input 
                      id="phone-refi" 
                      placeholder="+7 (999) 123-45-67" 
                      className="glass-effect border-white/10 text-white"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <Button 
                    className="w-full gradient-primary text-white font-semibold"
                    onClick={() => handleSubmit('рефинансирование')}
                  >
                    Отправить заявку
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="auto" className="space-y-6 mt-6">
                <div className="text-center mb-8">
                  <p className="text-gray-400 mb-2">Ставка от</p>
                  <p className="text-5xl font-bold text-white mb-2">5.9%</p>
                  <p className="text-gray-400">годовых</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount3" className="text-white">Стоимость автомобиля</Label>
                    <Input 
                      id="amount3" 
                      placeholder="2 000 000 ₽" 
                      className="glass-effect border-white/10 text-white"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="term3" className="text-white">Срок кредита</Label>
                    <Select value={formData.term} onValueChange={(value) => setFormData({...formData, term: value})}>
                      <SelectTrigger className="glass-effect border-white/10 text-white">
                        <SelectValue placeholder="Выберите срок" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1625] border-white/10">
                        <SelectItem value="12">12 месяцев</SelectItem>
                        <SelectItem value="24">24 месяца</SelectItem>
                        <SelectItem value="36">36 месяцев</SelectItem>
                        <SelectItem value="60">60 месяцев</SelectItem>
                        <SelectItem value="84">84 месяца</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="name-auto" className="text-white">ФИО</Label>
                    <Input 
                      id="name-auto" 
                      placeholder="Иванов Иван Иванович" 
                      className="glass-effect border-white/10 text-white"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone-auto" className="text-white">Телефон</Label>
                    <Input 
                      id="phone-auto" 
                      placeholder="+7 (999) 123-45-67" 
                      className="glass-effect border-white/10 text-white"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <Button 
                    className="w-full gradient-primary text-white font-semibold"
                    onClick={() => handleSubmit('автокредит')}
                  >
                    Отправить заявку
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </section>

      <section className="py-20 px-6" id="deposits">
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-16 text-white">Вклады</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="glass-effect border-white/10 p-8 hover:scale-105 transition-transform">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Icon name="TrendingUp" size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Накопительный</h3>
                  <p className="text-gray-400">Пополняемый вклад</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-gray-400 mb-2">Ставка до</p>
                <p className="text-4xl font-bold text-white">18%</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Пополнение в любое время
                </li>
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Ежемесячная капитализация
                </li>
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  От 10 000 ₽
                </li>
              </ul>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gradient-primary text-white font-semibold">
                    Открыть вклад
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1625] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-white">Заявка на вклад</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Заполните форму для открытия накопительного вклада
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="deposit-amount" className="text-white">Сумма вклада</Label>
                      <Input 
                        id="deposit-amount" 
                        placeholder="100 000 ₽" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deposit-term" className="text-white">Срок вклада</Label>
                      <Select value={formData.term} onValueChange={(value) => setFormData({...formData, term: value})}>
                        <SelectTrigger className="glass-effect border-white/10 text-white">
                          <SelectValue placeholder="Выберите срок" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1625] border-white/10">
                          <SelectItem value="3">3 месяца</SelectItem>
                          <SelectItem value="6">6 месяцев</SelectItem>
                          <SelectItem value="12">12 месяцев</SelectItem>
                          <SelectItem value="24">24 месяца</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="deposit-name" className="text-white">ФИО</Label>
                      <Input 
                        id="deposit-name" 
                        placeholder="Иванов Иван Иванович" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deposit-phone" className="text-white">Телефон</Label>
                      <Input 
                        id="deposit-phone" 
                        placeholder="+7 (999) 123-45-67" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full gradient-primary text-white font-semibold"
                      onClick={() => handleSubmit('накопительный вклад')}
                    >
                      Отправить заявку
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>

            <Card className="glass-effect border-white/10 p-8 hover:scale-105 transition-transform">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Icon name="Lock" size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Срочный</h3>
                  <p className="text-gray-400">Максимальная ставка</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-gray-400 mb-2">Ставка до</p>
                <p className="text-4xl font-bold text-white">20%</p>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Фиксированная ставка
                </li>
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  Выплата процентов в конце
                </li>
                <li className="flex items-center text-gray-300">
                  <Icon name="Check" size={20} className="text-green-400 mr-2" />
                  От 50 000 ₽
                </li>
              </ul>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full gradient-primary text-white font-semibold">
                    Открыть вклад
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1a1625] border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-2xl text-white">Заявка на вклад</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Заполните форму для открытия срочного вклада
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="fixed-amount" className="text-white">Сумма вклада</Label>
                      <Input 
                        id="fixed-amount" 
                        placeholder="200 000 ₽" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fixed-term" className="text-white">Срок вклада</Label>
                      <Select value={formData.term} onValueChange={(value) => setFormData({...formData, term: value})}>
                        <SelectTrigger className="glass-effect border-white/10 text-white">
                          <SelectValue placeholder="Выберите срок" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1625] border-white/10">
                          <SelectItem value="6">6 месяцев</SelectItem>
                          <SelectItem value="12">12 месяцев</SelectItem>
                          <SelectItem value="18">18 месяцев</SelectItem>
                          <SelectItem value="24">24 месяца</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fixed-name" className="text-white">ФИО</Label>
                      <Input 
                        id="fixed-name" 
                        placeholder="Иванов Иван Иванович" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fixed-phone" className="text-white">Телефон</Label>
                      <Input 
                        id="fixed-phone" 
                        placeholder="+7 (999) 123-45-67" 
                        className="glass-effect border-white/10 text-white"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <Button 
                      className="w-full gradient-primary text-white font-semibold"
                      onClick={() => handleSubmit('срочный вклад')}
                    >
                      Отправить заявку
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Icon name="Sparkles" size={24} className="text-white" />
                </div>
                <span className="text-2xl font-bold text-white">ОТПК Банк</span>
              </div>
              <p className="text-gray-400">Современный банк для современных людей</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Продукты</h4>
              <ul className="space-y-2">
                <li><a href="#cards" className="text-gray-400 hover:text-white transition-colors">Карты</a></li>
                <li><a href="#credits" className="text-gray-400 hover:text-white transition-colors">Кредиты</a></li>
                <li><a href="#deposits" className="text-gray-400 hover:text-white transition-colors">Вклады</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Компания</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">О нас</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Карьера</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Пресс-центр</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Контакты</h4>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <Icon name="Phone" size={16} className="mr-2" />
                  8 (800) 555-35-35
                </li>
                <li className="flex items-center text-gray-400">
                  <Icon name="Mail" size={16} className="mr-2" />
                  info@neobank.ru
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p>© 2024 ОТПК Банк. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;