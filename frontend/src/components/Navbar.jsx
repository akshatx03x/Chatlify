import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User, Menu } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
      <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16">
        <div className="flex items-center justify-between h-full">
          
          {/* Left - Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-all"
          >
            <div className="size-8 sm:size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <h1 className="text-base sm:text-lg font-bold text-white">Chatlify</h1>
          </Link>

          {/* Right - Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/settings" className="btn btn-sm gap-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            {authUser && (
              <>
                <Link to="/profile" className="btn btn-sm gap-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={logout}
                  className="btn btn-sm btn-error text-white gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="
              sm:hidden p-3 rounded-lg 
              hover:bg-base-300 transition-colors 
              text-white focus:outline-none
            "
          >
            <Menu className="w-7 h-7" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="sm:hidden bg-base-100 border-t border-base-300 px-4 py-3 flex flex-col gap-2 shadow-lg">
          <Link to="/settings" className="flex items-center gap-3 p-2 rounded-md hover:bg-base-200">
            <Settings className="w-5 h-5" /> Settings
          </Link>

          {authUser && (
            <>
              <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-base-200">
                <User className="w-5 h-5" /> Profile
              </Link>

              <button
                onClick={logout}
                className="flex items-center gap-3 p-2 rounded-md text-red-500 hover:bg-base-200"
              >
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
