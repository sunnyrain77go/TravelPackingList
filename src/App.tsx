import { useState, useEffect, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  RotateCcw, 
  MapPin, 
  Calendar, 
  Cloud, 
  Waves, 
  Trees, 
  Briefcase,
  Home,
  Tent,
  Hotel,
  Plane,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Info,
  Utensils,
  Copy,
  ClipboardCheck
} from 'lucide-react';

// --- Types ---

type Destination = 'home' | 'camping' | 'hotel' | 'abroad' | 'other';
type Weather = 'sunny' | 'rainy' | 'cold' | 'windy';
type Activity = 'water' | 'grass' | 'hiking' | 'shopping' | 'cooking' | 'skiing';

interface TravelNeeds {
  destination: Destination;
  days: number;
  weather: Weather[];
  activities: Activity[];
  needTowel: boolean;
}

interface PackingItem {
  id: string;
  category: string;
  name: string;
  reason?: string;
}

// --- Constants & Data ---

const CATEGORIES = {
  ESSENTIALS: '必備品',
  CLOTHING: '衣物',
  TOILETRIES: '盥洗用品',
  ELECTRONICS: '電子產品',
  DOCUMENTS: '證件與金錢',
  MOM_KIT: '媽媽盥洗包',
  MEDICINE: '醫藥類',
  COOKING: '炊煮類',
  OTHERS: '其他',
};

const BASE_ITEMS: PackingItem[] = [
  { id: 'b1', category: CATEGORIES.ESSENTIALS, name: '手機/攝影機' },
  { id: 'b2', category: CATEGORIES.ESSENTIALS, name: '錢包 (現金/信用卡)' },
  { id: 'b3', category: CATEGORIES.ESSENTIALS, name: '鑰匙' },
  { id: 'b4', category: CATEGORIES.ELECTRONICS, name: '行動電源/耳機' },
  { id: 'b6', category: CATEGORIES.TOILETRIES, name: '牙刷牙膏牙線' },
  { id: 'b7', category: CATEGORIES.ESSENTIALS, name: '衛生紙/濕紙巾' },
  { id: 'b8', category: CATEGORIES.ESSENTIALS, name: '水壺' },
  // 媽媽盥洗包基本內容 (不管幾天都要帶)
  { id: 'm1', category: CATEGORIES.MOM_KIT, name: '髮夾髮圈' },
  { id: 'm5', category: CATEGORIES.MOM_KIT, name: '護手霜' },
  { id: 'm6', category: CATEGORIES.MOM_KIT, name: '防曬/吸油面紙' },
  { id: 'm7', category: CATEGORIES.MOM_KIT, name: '護唇膏' },
  // 醫藥類基本內容
  { id: 'med1', category: CATEGORIES.MEDICINE, name: 'AD軟膏' },
  { id: 'med2', category: CATEGORIES.MEDICINE, name: 'OK繃人工皮' },
  { id: 'med3', category: CATEGORIES.MEDICINE, name: '消炎藥' },
  { id: 'med4', category: CATEGORIES.MEDICINE, name: '眼藥膏' },
  { id: 'med5', category: CATEGORIES.MEDICINE, name: '眼藥水' },
  { id: 'med6', category: CATEGORIES.MEDICINE, name: '普拿疼過敏藥鼻水藥' },
];

const DESTINATION_ITEMS: Record<Destination, PackingItem[]> = {
  home: [
    { id: 'd1', category: CATEGORIES.OTHERS, name: '給家人的禮物' },
  ],
  camping: [
    { id: 'd2', category: CATEGORIES.OTHERS, name: '睡袋/枕頭/床墊床包' },
    { id: 'd3', category: CATEGORIES.OTHERS, name: '腳架/露營燈' },
    { id: 'd4', category: CATEGORIES.OTHERS, name: '防蚊液止癢藥' },
    { id: 'd5', category: CATEGORIES.OTHERS, name: '桌椅/RV桶' },
    { id: 'd13', category: CATEGORIES.OTHERS, name: '垃圾袋/抹布' },
  ],
  hotel: [
    { id: 'd12', category: CATEGORIES.ESSENTIALS, name: '票券' },
  ],
  abroad: [
    { id: 'd7', category: CATEGORIES.DOCUMENTS, name: '護照' },
    { id: 'd8', category: CATEGORIES.DOCUMENTS, name: '簽證/入境文件' },
    { id: 'd9', category: CATEGORIES.ELECTRONICS, name: '萬用轉接頭' },
    { id: 'd10', category: CATEGORIES.DOCUMENTS, name: '外幣' },
    { id: 'd11', category: CATEGORIES.OTHERS, name: '旅遊保險證明' },
  ],
  other: [],
};

const WEATHER_ITEMS: Record<Weather, PackingItem[]> = {
  sunny: [
    { id: 'w1', category: CATEGORIES.ESSENTIALS, name: '太陽眼鏡' },
    { id: 'w2', category: CATEGORIES.ESSENTIALS, name: '防曬乳' },
    { id: 'w3', category: CATEGORIES.ESSENTIALS, name: '遮陽帽' },
    { id: 'w_fan', category: CATEGORIES.ESSENTIALS, name: '電扇' },
  ],
  rainy: [
    { id: 'w4', category: CATEGORIES.ESSENTIALS, name: '雨傘/雨衣' },
    { id: 'w5', category: CATEGORIES.OTHERS, name: '備用鞋襪' },
  ],
  cold: [
    { id: 'w6', category: CATEGORIES.CLOTHING, name: '發熱衣' },
    { id: 'w7', category: CATEGORIES.CLOTHING, name: '厚外套' },
    { id: 'w8', category: CATEGORIES.CLOTHING, name: '圍巾/手套' },
    { id: 'w9', category: CATEGORIES.TOILETRIES, name: '護唇膏/乳液' },
  ],
  windy: [
    { id: 'w10', category: CATEGORIES.CLOTHING, name: '防風外套' },
  ],
};

const ACTIVITY_ITEMS: Record<Activity, PackingItem[]> = {
  water: [
    { id: 'a1', category: CATEGORIES.CLOTHING, name: '泳衣/泳褲' },
    { id: 'a2', category: CATEGORIES.OTHERS, name: '防水袋' },
    { id: 'a3', category: CATEGORIES.OTHERS, name: '海灘拖鞋' },
  ],
  grass: [
    { id: 'a4', category: CATEGORIES.OTHERS, name: '野餐墊' },
    { id: 'a5', category: CATEGORIES.OTHERS, name: '防蚊貼片' },
    { id: 'a16', category: CATEGORIES.OTHERS, name: '羽球/氣球/球類' },
  ],
  hiking: [
    { id: 'a6', category: CATEGORIES.ESSENTIALS, name: '登山杖' },
    { id: 'a7', category: CATEGORIES.CLOTHING, name: '排汗衣' },
    { id: 'a8', category: CATEGORIES.ESSENTIALS, name: '足夠的水' },
  ],
  shopping: [
    { id: 'a9', category: CATEGORIES.OTHERS, name: '環保購物袋' },
    { id: 'a10', category: CATEGORIES.OTHERS, name: '空行李空間' },
  ],
  cooking: [
    { id: 'a11', category: CATEGORIES.COOKING, name: '餐具 (碗筷/湯匙/剪刀)' },
    { id: 'a12', category: CATEGORIES.COOKING, name: '廚房紙巾/調味料' },
    { id: 'a13', category: CATEGORIES.COOKING, name: '洗碗精/菜瓜布/瀝水藍' },
    { id: 'a14', category: CATEGORIES.COOKING, name: '食材/飲用水' },
    { id: 'a15', category: CATEGORIES.COOKING, name: '卡式爐/瓦斯罐' },
    { id: 'a17', category: CATEGORIES.COOKING, name: '泡麵碗' },
  ],
  skiing: [
    { id: 's1', category: CATEGORIES.CLOTHING, name: '排汗衣' },
    { id: 's2', category: CATEGORIES.CLOTHING, name: '雪衣' },
    { id: 's3', category: CATEGORIES.CLOTHING, name: '雪褲' },
    { id: 's4', category: CATEGORIES.CLOTHING, name: '雪襪' },
    { id: 's5', category: CATEGORIES.CLOTHING, name: '頭套' },
    { id: 's6', category: CATEGORIES.ESSENTIALS, name: '雪票夾/護目鏡' },
  ],
};

// --- Components ---

const Checkbox = ({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) => (
  <label className="flex items-center space-x-3 cursor-pointer group py-2">
    <div 
      className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${
        checked 
          ? 'bg-sage-500 border-sage-500 shadow-sm' 
          : 'bg-white border-stone-300 group-hover:border-sage-400'
      }`}
      onClick={(e) => {
        e.preventDefault();
        onChange();
      }}
    >
      {checked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
    </div>
    <span className={`text-sm transition-colors duration-200 ${checked ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
      {label}
    </span>
  </label>
);

const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
  <div className="flex items-center space-x-2 mb-4 mt-6 first:mt-0">
    <Icon className="w-5 h-5 text-sage-600" />
    <h3 className="text-lg font-medium text-stone-800">{title}</h3>
  </div>
);

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100 ${className}`}>
    {children}
  </div>
);

export default function App() {
  const [needs, setNeeds] = useState<TravelNeeds>(() => {
    const saved = localStorage.getItem('travel-needs');
    return saved ? JSON.parse(saved) : {
      destination: 'hotel',
      days: 2,
      weather: [],
      activities: [],
      needTowel: false,
    };
  });

  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('checked-items');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [copySuccess, setCopySuccess] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('travel-needs', JSON.stringify(needs));
  }, [needs]);

  useEffect(() => {
    localStorage.setItem('checked-items', JSON.stringify(Array.from(checkedItems)));
  }, [checkedItems]);

  const toggleChecked = (id: string) => {
    const next = new Set(checkedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedItems(next);
  };

  const resetAll = () => {
    setNeeds({
      destination: 'hotel',
      days: 2,
      weather: [],
      activities: [],
      needTowel: false,
    });
    setCheckedItems(new Set());
  };

  const exportToExcel = () => {
    const listText = Object.entries(generatedList)
      .map(([category, items]) => {
        const categoryHeader = `【${category}】`;
        const itemsText = (items as PackingItem[])
          .map(item => {
            const status = checkedItems.has(item.id) ? 'V' : '';
            return `${status}\t${item.name}\t${item.reason || ''}`;
          })
          .join('\n');
        return `${categoryHeader}\n狀態\t項目\t備註\n${itemsText}`;
      })
      .join('\n\n');

    navigator.clipboard.writeText(listText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const generatedList = useMemo(() => {
    let items = [...BASE_ITEMS];

    // Destination
    items = [...items, ...(DESTINATION_ITEMS[needs.destination] || [])];

    // Weather
    needs.weather.forEach(w => {
      items = [...items, ...(WEATHER_ITEMS[w] || [])];
    });

    // Activities
    needs.activities.forEach(a => {
      items = [...items, ...(ACTIVITY_ITEMS[a] || [])];
    });

    // Towel (needTowel OR water activity)
    if (needs.needTowel || needs.activities.includes('water')) {
      items.push({ 
        id: 't1', 
        category: CATEGORIES.TOILETRIES, 
        name: '毛巾',
        reason: needs.activities.includes('water') ? '有玩水行程' : undefined
      });
    }

    // 媽媽盥洗包條件性項目
    // 卸妝洗臉、化妝水乳霜 (天數 >= 2 OR 有玩水)
    if (needs.days >= 2 || needs.activities.includes('water')) {
      items.push({ 
        id: 'm2', 
        category: CATEGORIES.MOM_KIT, 
        name: '卸妝洗臉梳子',
        reason: needs.activities.includes('water') ? '有玩水行程' : '天數超過 2 天'
      });
      items.push({ 
        id: 'm3', 
        category: CATEGORIES.MOM_KIT, 
        name: '化妝水乳霜',
        reason: needs.activities.includes('water') ? '有玩水行程' : '天數超過 2 天'
      });
    }

    // 面膜 (天數 >= 3)
    if (needs.days >= 3) {
      items.push({ 
        id: 'm4', 
        category: CATEGORIES.MOM_KIT, 
        name: '面膜', 
        reason: '天數超過 3 天建議加強保養' 
      });
    }

    // 多日行程邏輯 (天數 > 1)
    if (needs.days > 1) {
      // 充電線
      items.push({ 
        id: 'b5', 
        category: CATEGORIES.ELECTRONICS, 
        name: '充電線', 
        reason: '多日行程建議攜帶' 
      });

      // 睡衣
      items.push({ 
        id: 'c4', 
        category: CATEGORIES.CLOTHING, 
        name: '睡衣', 
        reason: '天數超過 2 天建議攜帶' 
      });

      // 盥洗用品
      items.push({
        id: 't2',
        category: CATEGORIES.TOILETRIES,
        name: '棉花棒/夾子',
        reason: '多日行程建議攜帶'
      });

      // 飯店特定需求 (泡麵碗跟餐具)
      if (needs.destination === 'hotel') {
        items.push({ id: 'h_bowl', category: CATEGORIES.COOKING, name: '泡麵碗', reason: '飯店住宿建議攜帶' });
        items.push({ id: 'h_utensils', category: CATEGORIES.COOKING, name: '餐具 (碗筷/湯匙)', reason: '飯店住宿建議攜帶' });
      }

      // 衣物計算
      items.push({ 
        id: 'c1', 
        category: CATEGORIES.CLOTHING, 
        name: `換洗衣物 (${needs.days - 1} 套)`,
        reason: `根據 ${needs.days} 天行程計算`
      });
      items.push({ 
        id: 'c2', 
        category: CATEGORIES.CLOTHING, 
        name: `內衣褲 (${needs.days} 套)` 
      });
      items.push({ 
        id: 'c3', 
        category: CATEGORIES.CLOTHING, 
        name: `襪子 (${needs.days} 雙)` 
      });
    } else {
      items.push({ id: 'c1', category: CATEGORIES.CLOTHING, name: '備用衣物 (視需求)' });
    }

    // Group by category
    const grouped: Record<string, PackingItem[]> = {};
    items.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      // Avoid duplicates by name
      if (!grouped[item.category].find(i => i.name === item.name)) {
        grouped[item.category].push(item);
      }
    });

    return grouped;
  }, [needs]);

  const toggleWeather = (w: Weather) => {
    setNeeds(prev => ({
      ...prev,
      weather: prev.weather.includes(w) 
        ? prev.weather.filter(item => item !== w) 
        : [...prev.weather, w]
    }));
  };

  const toggleActivity = (a: Activity) => {
    setNeeds(prev => ({
      ...prev,
      activities: prev.activities.includes(a) 
        ? prev.activities.filter(item => item !== a) 
        : [...prev.activities, a]
    }));
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-stone-700 font-sans selection:bg-sage-100 pb-20">
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-light tracking-widest text-stone-800 mb-2">旅人行李清單</h1>
          <p className="text-stone-400 text-sm tracking-wider">Traveler's Packing List</p>
          <div className="w-12 h-0.5 bg-sage-300 mx-auto mt-6 rounded-full" />
        </motion.div>
      </header>

      <main className="max-w-4xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Needs Selection */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <SectionTitle icon={MapPin} title="目的地" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'home', label: '南部家', icon: Home },
                { id: 'camping', label: '露營', icon: Tent },
                { id: 'hotel', label: '飯店', icon: Hotel },
                { id: 'abroad', label: '出國', icon: Plane },
                { id: 'other', label: '其他', icon: Briefcase },
              ].map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => setNeeds({ ...needs, destination: dest.id as Destination })}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    needs.destination === dest.id 
                      ? 'bg-sage-500 text-white shadow-md shadow-sage-200' 
                      : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                  }`}
                >
                  <dest.icon className="w-4 h-4" />
                  <span>{dest.label}</span>
                </button>
              ))}
            </div>

            <SectionTitle icon={Calendar} title="天數" />
            <div className="flex items-center space-x-4 bg-stone-50 p-2 rounded-2xl">
              <button 
                onClick={() => setNeeds({ ...needs, days: Math.max(1, needs.days - 1) })}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-stone-100 text-stone-400"
              >
                -
              </button>
              <div className="flex-1 text-center font-medium text-stone-800">
                {needs.days} <span className="text-xs text-stone-400 font-normal">天</span>
              </div>
              <button 
                onClick={() => setNeeds({ ...needs, days: needs.days + 1 })}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm hover:bg-stone-100 text-stone-400"
              >
                +
              </button>
            </div>

            <SectionTitle icon={Cloud} title="天氣預測" />
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'sunny', label: '晴天', icon: Sun },
                { id: 'rainy', label: '雨天', icon: CloudRain },
                { id: 'cold', label: '寒冷', icon: Snowflake },
                { id: 'windy', label: '強風', icon: Wind },
              ].map((w) => (
                <button
                  key={w.id}
                  onClick={() => toggleWeather(w.id as Weather)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                    needs.weather.includes(w.id as Weather)
                      ? 'bg-sage-100 text-sage-700 border border-sage-200' 
                      : 'bg-stone-50 text-stone-500 border border-transparent hover:bg-stone-100'
                  }`}
                >
                  <w.icon className="w-4 h-4" />
                  <span>{w.label}</span>
                </button>
              ))}
            </div>

            <SectionTitle icon={Waves} title="活動內容" />
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'water', label: '玩水', icon: Waves },
                { id: 'grass', label: '草地', icon: Trees },
                { id: 'hiking', label: '登山', icon: Trees },
                { id: 'shopping', label: '購物', icon: Briefcase },
                { id: 'cooking', label: '炊煮', icon: Utensils },
                { id: 'skiing', label: '滑雪', icon: Snowflake },
              ].map((a) => (
                <button
                  key={a.id}
                  onClick={() => toggleActivity(a.id as Activity)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                    needs.activities.includes(a.id as Activity)
                      ? 'bg-sage-100 text-sage-700 border border-sage-200' 
                      : 'bg-stone-50 text-stone-500 border border-transparent hover:bg-stone-100'
                  }`}
                >
                  <a.icon className="w-4 h-4" />
                  <span>{a.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 group-hover:text-sage-500 transition-colors">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-800">需自備毛巾？</p>
                    <p className="text-xs text-stone-400">部分民宿或露營不提供</p>
                  </div>
                </div>
                <div 
                  onClick={() => setNeeds({ ...needs, needTowel: !needs.needTowel })}
                  className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${needs.needTowel ? 'bg-sage-500' : 'bg-stone-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${needs.needTowel ? 'left-7' : 'left-1'}`} />
                </div>
              </label>
            </div>

            <button 
              onClick={resetAll}
              className="w-full mt-8 flex items-center justify-center space-x-2 py-3 rounded-2xl text-stone-400 hover:text-red-400 hover:bg-red-50 transition-all duration-200 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>清除所有需求與勾選</span>
            </button>
          </Card>
        </div>

        {/* Right Column: Packing List */}
        <div className="md:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={JSON.stringify(needs)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="min-h-[600px]">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-medium text-stone-800">行李清單</h2>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={exportToExcel}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                        copySuccess 
                          ? 'bg-green-50 text-green-600 border border-green-100' 
                          : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-transparent'
                      }`}
                    >
                      {copySuccess ? <ClipboardCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copySuccess ? '已複製！' : '複製清單 (Excel)'}</span>
                    </button>
                    <div className="text-xs text-stone-400 bg-stone-50 px-3 py-1 rounded-full border border-transparent">
                      已完成 {Array.from(checkedItems).filter(id => {
                        // Only count items that are actually in the current list
                        return Object.values(generatedList).flat().some((i: PackingItem) => i.id === id);
                      }).length} / {Object.values(generatedList).flat().length}
                    </div>
                  </div>
                </div>

                {Object.entries(generatedList).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-stone-300">
                    <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                    <p>尚未生成清單</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(generatedList).map(([category, items]) => (
                      <div key={category}>
                        <h4 className="text-xs font-bold text-sage-600 uppercase tracking-widest mb-3 flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mr-2" />
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 gap-1">
                          {(items as PackingItem[]).map((item) => (
                            <div key={item.id} className="flex flex-col">
                              <Checkbox 
                                label={item.name}
                                checked={checkedItems.has(item.id)}
                                onChange={() => toggleChecked(item.id)}
                              />
                              {item.reason && !checkedItems.has(item.id) && (
                                <span className="text-[10px] text-stone-400 ml-8 -mt-1 mb-2">
                                  {item.reason}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-12 p-4 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <p className="text-xs text-stone-400 leading-relaxed italic">
                    「旅行的意義不在於目的地，而在於沿途的風景與心情。」<br/>
                    祝您旅途愉快！
                  </p>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer / Floating Action */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
        <button 
          onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          className="bg-sage-600 text-white px-6 py-3 rounded-full shadow-lg shadow-sage-200 flex items-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">查看清單</span>
        </button>
      </footer>
    </div>
  );
}
