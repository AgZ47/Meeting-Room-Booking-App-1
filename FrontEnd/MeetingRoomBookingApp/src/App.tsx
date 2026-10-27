import { LoginPage } from "./features/auth/loginPage";
import { Routes, Route, NavLink } from "react-router-dom";
import { RegisterPage } from "./features/auth/registerPage";
import { AdminBookings } from "./features/adminBookings/adminBookings";
import { Rooms } from "./features/rooms/rooms";
import { Bookings } from "./features/bookings/bookings";
import type { RootState } from "./state/store";
import { useSelector } from "react-redux";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-gray-300 text-black"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  }`;

function App() {
  const role = useSelector((state: RootState) => state.auth.role)
  const userName = useSelector((state: RootState) => state.auth.name)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3">
          {/* Brand */}
          <NavLink to="/rooms" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mist-950 text-lg font-bold text-white shadow-sm">
              M
            </div>
            <div>
              <span className="block text-lg font-bold tracking-tight text-slate-900">
                MeetSpace
              </span>
              <span className="block text-xs text-slate-500">
                Room booking
              </span>
            </div>
          </NavLink>

          {/* Main navigation */}
          <div className="flex flex-wrap items-center gap-1">
            <NavLink to="/rooms" className={navLinkClass}>
              Rooms
            </NavLink>

            <NavLink to="/bookings/me" className={navLinkClass}>
              My Bookings
            </NavLink>
            
            {role && role === "admin" ? 
              <NavLink to="/admin/bookings" className={navLinkClass}>
                Admin
              </NavLink>
             : null}
            
          </div>

          {/* Authentication links */}
          <div className="flex items-center gap-2">
            {!role ? <><NavLink
              to="/"
              end
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "text-mist-950"
                    : "text-slate-600 hover:bg-slate-100 hover:text-mist-950"
                }`
              }
            >
              Log in
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-mist-700 text-white"
                    : "bg-slate-950 text-white shadow-sm hover:bg-slate-700"
                }`
              }
            >
              Sign up 
            </NavLink></> : 
            <div className="flex flex-col rounded-lg bg-gray-300 p-3 outline-2">
              <div>
                  Name: {userName}
              </div>
              <div>
                  Role: {role=='admin' ? 'Admin' : 'User'}
              </div>
            </div>
            }
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/bookings/me" element={<Bookings />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;