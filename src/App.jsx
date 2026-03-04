import { useState, createContext, useContext, useEffect } from 'react';
import { actionPlan, hotelsDatabase, dayTitles, fixedExpenses } from './data/travelData';
import Sidebar from './components/Sidebar';
import OverviewPage from './pages/OverviewPage';
import DayDetailPage from './pages/DayDetailPage';
import MapPage from './pages/MapPage';
import ExpensesPage from './pages/ExpensesPage';
import HotelsPage from './pages/HotelsPage';
import PlacesPage from './pages/PlacesPage';
import { useMultiplayer } from './hooks/useMultiplayer';
import { MultiplayerOverlay } from './components/MultiplayerOverlay';
import LoginScreen from './components/LoginScreen';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseSetup';

export const TravelContext = createContext(null);

// Default hotel selections
const defaultKyotoHotel = hotelsDatabase.find(h => h.id === 'k1');
const defaultOsakaHotel = hotelsDatabase.find(h => h.id === 'o1');

export default function App() {
  const [page, setPage] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(1);
  const [plan, setPlan] = useState(actionPlan);
  const [allHotels, setAllHotels] = useState(hotelsDatabase);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [customExpenses, setCustomExpenses] = useState(fixedExpenses);
  const [exchangeRate, setExchangeRate] = useState(0.25); // default fallback
  const [theme, setTheme] = useState(localStorage.getItem('travel_theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Authenticate user
  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('travel_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const mpProps = useMultiplayer(currentUser, (remoteState) => {
    setPlan(remoteState.plan);
    setHotelSelection(remoteState.hotelSelection);
    setCustomExpenses(remoteState.customExpenses);
    setAllHotels(remoteState.allHotels);
  });

  const notifyChange = (newPlan, newHotels, newCustomEx, newAllHotels, actionName) => {
    if (mpProps.mode === 'view' && !mpProps.isHost) return; // Readers don't broadcast
    mpProps.broadcastState({
      plan: newPlan,
      hotelSelection: newHotels,
      customExpenses: newCustomEx,
      allHotels: newAllHotels
    }, actionName);
  }

  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/JPY')
      .then(res => res.json())
      .then(data => {
        if (data && data.rates && data.rates.THB) {
          setExchangeRate(data.rates.THB);
        }
      })
      .catch(err => console.error("Failed to fetch exchange rate", err));
  }, []);

  // Global hotel selection — drives plan names, expenses, and map pins
  const [hotelSelection, setHotelSelection] = useState({
    kyoto: { hotel: defaultKyotoHotel, nights: 5, checkIn: '2026-03-07', checkOut: '2026-03-12' },
    osaka: { hotel: defaultOsakaHotel, nights: 1, checkIn: '2026-03-12', checkOut: '2026-03-13' },
  });

  // When hotel changes, update plan items that reference old hotel names
  const selectHotel = (city, newHotel, nights) => {
    if (mpProps.mode === 'view' && !mpProps.isHost) return;
    setHotelSelection(prev => {
      const prev_ = prev[city];
      const oldName = prev_.hotel.name;
      const newSelection = { ...prev, [city]: { ...prev_[city], hotel: newHotel, nights: nights ?? prev_.nights } };

      let clonedPlan = null;
      setPlan(p => {
        clonedPlan = p.map(item => item.place === oldName ? { ...item, place: newHotel.name } : item);
        notifyChange(clonedPlan, newSelection, customExpenses, allHotels, `เปลี่ยนโรงแรม ${city}`);
        return clonedPlan;
      });

      return newSelection;
    });
  };

  const updateHotelNights = (city, nights) => {
    if (mpProps.mode === 'view' && !mpProps.isHost) return;
    setHotelSelection(prev => {
      const next = { ...prev, [city]: { ...prev[city], nights } };
      notifyChange(plan, next, customExpenses, allHotels, `เพิ่มคืนพัก ${city}`);
      return next;
    });
  };

  const addCustomHotel = (newHotel) => {
    if (mpProps.mode === 'view' && !mpProps.isHost) return;
    setAllHotels(prev => {
      const next = [...prev, { ...newHotel, id: `custom_${Date.now()}` }];
      notifyChange(plan, hotelSelection, customExpenses, next, `เพิ่มที่พักใหม่`);
      return next;
    });
  };

  // Plan CRUD
  const updateItem = (index, updatedItem) => {
    if (mpProps.mode === 'view' && !mpProps.isHost) return;
    setPlan(prev => {
      const next = prev.map((item, i) => i === index ? { ...item, ...updatedItem } : item);
      notifyChange(next, hotelSelection, customExpenses, allHotels, `แก้ไข: ${updatedItem.place}`);
      return next;
    });
  };

  const addItem = (newItem) => {
    if (mpProps.mode === 'view' && !mpProps.isHost) return;
    setPlan(prev => {
      const lastIdx = prev.map((it, i) => it.day === newItem.day ? i : -1).filter(i => i >= 0).pop() ?? prev.length - 1;
      const arr = [...prev];
      arr.splice(lastIdx + 1, 0, newItem);
      notifyChange(arr, hotelSelection, customExpenses, allHotels, `เพิ่ม: ${newItem.place}`);
      return arr;
    });
  };

  const deleteItem = (index) => {
    if (mpProps.mode === 'view' && !mpProps.isHost) return;
    setPlan(prev => {
      const placeName = prev[index]?.place || 'สถานที่';
      const next = prev.filter((_, i) => i !== index);
      notifyChange(next, hotelSelection, customExpenses, allHotels, `ลบ: ${placeName}`);
      return next;
    });
  };

  const updateCustomExpense = (index, newTotalYen) => {
    if (mpProps.mode === 'view' && !mpProps.isHost) return;
    setCustomExpenses(prev => {
      const next = prev.map((e, i) => i === index ? { ...e, totalYen: newTotalYen, totalBaht: Math.round(newTotalYen * exchangeRate) } : e);
      notifyChange(plan, hotelSelection, next, allHotels, `อัปเดตค่าใช้จ่าย`);
      return next;
    });
  };

  const navTo = (p, day) => {
    setPage(p);
    if (day !== undefined) setSelectedDay(day);
  };

  // Computed hotel expense (live)
  const hotelExpense = {
    yen: hotelSelection.kyoto.hotel.priceYen * hotelSelection.kyoto.nights +
      hotelSelection.osaka.hotel.priceYen * hotelSelection.osaka.nights,
    baht: Math.round((hotelSelection.kyoto.hotel.priceYen * hotelSelection.kyoto.nights +
      hotelSelection.osaka.hotel.priceYen * hotelSelection.osaka.nights) * exchangeRate),
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  if (authLoading) return <div style={{ height: '100vh', background: 'var(--bg-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>กำลังตรวจสอบสิทธิ์...</div>;
  if (!currentUser) return <LoginScreen />;

  return (
    <TravelContext.Provider value={{
      plan, updateItem, addItem, deleteItem,
      selectedDay, setSelectedDay,
      hotelSelection, selectHotel, updateHotelNights,
      allHotels, addCustomHotel,
      hotelExpense,
      customExpenses, updateCustomExpense,
      navTo,
      exchangeRate,
    }}>
      {/* Multiplayer System */}
      <MultiplayerOverlay {...mpProps} theme={theme} toggleTheme={toggleTheme} currentUser={currentUser} />

      {/* Main UI shifting up by 40px for the Top Banner */}
      <div style={{ paddingTop: 40, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Mobile header with hamburger */}
        <div className="mobile-header">
          <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" style={{ width: 26, height: 26, borderRadius: 6 }} alt="logo" />
            <span className="mobile-header-title">เกียวโต・โอซาก้า</span>
          </div>
        </div>

        {/* Sidebar overlay (mobile) */}
        <div
          className={`sidebar-overlay ${isSidebarOpen ? 'visible' : ''}`}
          onClick={closeSidebar}
        />

        <div className="app-wrapper">
          <Sidebar
            page={page}
            onNav={(p) => setPage(p)}
            isOpen={isSidebarOpen}
            onClose={closeSidebar}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <div className="main-content">
            {page === 'overview' && <OverviewPage />}
            {page === 'day' && <DayDetailPage />}
            {page === 'map' && <MapPage />}
            {page === 'expenses' && <ExpensesPage />}
            {page === 'hotels' && <HotelsPage />}
            {page === 'places' && <PlacesPage />}
          </div>
        </div>
      </div>
    </TravelContext.Provider>
  );
}
