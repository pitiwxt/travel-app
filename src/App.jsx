import { useState, createContext, useContext, useEffect } from 'react';
import { actionPlan, hotelsDatabase, dayTitles, fixedExpenses } from './data/travelData';
import Sidebar from './components/Sidebar';
import OverviewPage from './pages/OverviewPage';
import DayDetailPage from './pages/DayDetailPage';
import MapPage from './pages/MapPage';
import ExpensesPage from './pages/ExpensesPage';
import HotelsPage from './pages/HotelsPage';
import PlacesPage from './pages/PlacesPage';

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
    setHotelSelection(prev => {
      const prev_ = prev[city];
      const oldName = prev_.hotel.name;
      // Update plan references
      setPlan(p => p.map(item =>
        item.place === oldName ? { ...item, place: newHotel.name } : item
      ));
      return { ...prev, [city]: { ...prev_[city], hotel: newHotel, nights: nights ?? prev_.nights } };
    });
  };

  const updateHotelNights = (city, nights) => {
    setHotelSelection(prev => ({ ...prev, [city]: { ...prev[city], nights } }));
  };

  const addCustomHotel = (newHotel) => {
    setAllHotels(prev => [...prev, { ...newHotel, id: `custom_${Date.now()}` }]);
  };

  // Plan CRUD
  const updateItem = (index, updatedItem) => {
    setPlan(prev => prev.map((item, i) => i === index ? { ...item, ...updatedItem } : item));
  };

  const addItem = (newItem) => {
    setPlan(prev => {
      const lastIdx = prev.map((it, i) => it.day === newItem.day ? i : -1).filter(i => i >= 0).pop() ?? prev.length - 1;
      const arr = [...prev];
      arr.splice(lastIdx + 1, 0, newItem);
      return arr;
    });
  };

  const deleteItem = (index) => {
    setPlan(prev => prev.filter((_, i) => i !== index));
  };

  const updateCustomExpense = (index, newTotalYen) => {
    setCustomExpenses(prev => prev.map((e, i) => i === index ? { ...e, totalYen: newTotalYen, totalBaht: Math.round(newTotalYen * exchangeRate) } : e));
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
    </TravelContext.Provider>
  );
}
