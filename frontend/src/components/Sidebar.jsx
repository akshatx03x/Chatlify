import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside
      className="
        h-full border-r border-base-300 flex flex-col transition-all duration-200
        w-16 sm:w-20 md:w-60 lg:w-72 bg-base-200
      "
    >
      {/* Header */}
      <div className="border-b border-base-300 w-full p-3 sm:p-5">
        {authUser && (
          <div className="mb-4">
            <div className="flex items-center gap-2  sm:gap-3">
              <img
                src={authUser.profilePic || '/avatar.png'}
                alt={authUser.fullName}
                className="size-8 sm:size-10 rounded-full object-cover"
              />

              {/* Profile Info (Hidden on very small screens) */}
              <button
                onClick={() => navigate('/profile')}
                className="text-left hidden sm:block"
              >
                <div className="text-base sm:text-lg font-bold text-gray-300 truncate">
                  {authUser.fullname}
                </div>
                <div className="text-xs sm:text-sm font-semibold truncate text-zinc-400">
                  You
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Contacts Title */}
        <div className="flex items-center gap-2">
          <Users className="size-5 sm:size-6" />
          <span className="font-medium hidden md:block">Contacts</span>
        </div>

        {/* Online Filter */}
        <div className="mt-2 sm:mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-xs sm:checkbox-sm"
            />
            <span className="text-xs sm:text-sm">Show online only</span>
          </label>
          <span className="text-[10px] sm:text-xs text-zinc-500">
            ({Math.max(onlineUsers.length - 1, 0)} online)
          </span>
        </div>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full py-2 sm:py-3 px-1 sm:px-0">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg
              hover:bg-base-300 transition-colors
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }`}
          >
            {/* Avatar */}
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.fullname}
                className="size-10 sm:size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-2.5 sm:size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User Info (Hidden on tiny screens) */}
            <div className="hidden sm:block text-left min-w-0">
              <div className="font-medium text-sm sm:text-base truncate">
                {user.fullname}
              </div>
              <div className="text-xs sm:text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {/* No Users Message */}
        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4 text-sm sm:text-base">
            No online users
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
