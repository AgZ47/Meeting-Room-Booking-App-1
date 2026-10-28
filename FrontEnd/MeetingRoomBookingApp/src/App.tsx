import { LoginPage } from "./features/auth/loginPage";
import { Routes, Route, NavLink } from "react-router-dom";
import { RegisterPage } from "./features/auth/registerPage";
import { AdminBookings } from "./features/adminBookings/adminBookings";
import { Rooms } from "./features/rooms/rooms";
import { Bookings } from "./features/bookings/bookings";
import type { RootState } from "./common/store";
import { useSelector } from "react-redux";
import { CalendarRange, LogIn, Presentation, ShieldCheck, User, UserPlus } from "lucide-react";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 rounded-lg p-3 text-sm font-medium transition-colors overflow-hidden ${
      isActive
        ? "bg-white text-sky-700 font-semibold shadow-sm"
        : "text-white/80 hover:bg-sky-500 hover:text-white"
    }`;

function App() {
  const role = useSelector((state: RootState) => state.auth.role)
  const userName = useSelector((state: RootState) => state.auth.name)

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left Sidebar - Added `group`, width transitions, and whitespace-nowrap */}
      <aside className="group sticky top-0 flex h-screen flex-col overflow-hidden whitespace-nowrap border-r border-slate-200 px-4 py-6 shadow-sm transition-all duration-300 w-20 hover:w-64 z-50 bg-linear-to-t from-sky-600 via-sky-700 to-sky-600 ">
        
        {/* Brand */}
        <NavLink to="/rooms" className="mb-8 flex items-center gap-4 px-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xl font-bold text-white shadow-sm transition-all">
            M
          </div>
          <span className="text-xl font-bold tracking-tight text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            MeetSpace
          </span>
        </NavLink>

        {/* Main navigation */}
        <nav className="flex flex-1 flex-col gap-3">
          <NavLink to="/rooms" className={navLinkClass}>
            <Presentation className="size-6 shrink-0" />
            <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">Rooms</span>
          </NavLink>

          <NavLink to="/bookings/me" className={navLinkClass}>
            <CalendarRange className="size-6 shrink-0" />
            <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">My Bookings</span>
          </NavLink>
          
          {role && role === "admin" && (
            <NavLink to="/admin/bookings" className={navLinkClass}>
              <ShieldCheck className="size-6 shrink-0" />
              <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">Admin</span>
            </NavLink>
          )}
        </nav>

        {/* Authentication / User Profile */}
        <div className="mt-auto flex flex-col gap-2 border-t border-sky-400 pt-4">
          {!role ? (
            <>
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-lg p-3 text-sm font-semibold transition overflow-hidden ${
                    isActive
                      ? "bg-white text-sky-700 shadow-sm"
                      : "text-white hover:bg-sky-500"
                  }`
                }
              >
                <LogIn className="size-6 shrink-0" />
                <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">Log in</span>
              </NavLink>
              <NavLink
                to="/register"
                className={({ isActive }) =>
                  `flex items-center gap-4 rounded-lg p-3 text-sm font-semibold transition overflow-hidden ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-950 text-white shadow-sm hover:bg-slate-800"
                  }`
                }
              >
                <UserPlus className="size-6 shrink-0" />
                <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">Sign up</span>
              </NavLink>
            </>
          ) : (
            <div className="flex items-center gap-4 rounded-xl bg-sky-700/50 px-2 border border-sky-500 overflow-hidden">
              <User className="size-6 shrink-0 text-white" />
              <div className="flex flex-col opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-sm font-semibold text-white truncate">
                  {userName}
                </span>
                <span className="text-xs font-medium text-sky-200 uppercase tracking-wider">
                  {role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Page content */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="w-full px-8 py-8">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/bookings/me" element={<Bookings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;