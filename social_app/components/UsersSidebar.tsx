"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

export default function UsersSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div
      className={`glass-panel fixed right-4 xl:right-8 top-[100px] h-[calc(100vh-120px)] z-40 transition-all duration-300 flex flex-col rounded-2xl shrink-0 overflow-hidden ${isCollapsed ? "w-16" : "w-64"
        }`}
    >
      {/* subtle gradient overlay for premium glass feel */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-transparent" />

      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
        {!isCollapsed && (
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Discover
          </h2>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-md hover:bg-white/10 transition ${isCollapsed ? "mx-auto" : ""
            }`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-5 h-5 text-primary" />
          ) : (
            <ChevronRight className="w-5 h-5 text-primary" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-2 px-2">
        {loading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          !isCollapsed && (
            <div className="p-4 text-center text-sm text-slate-400">
              No users found.
            </div>
          )
        ) : (
          <div className="flex flex-col gap-1">
            {users.map((user: any) => (
              <Link
                href={`/profile/${user.id}`}
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                title={user.username}
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-white/10 text-primary flex items-center justify-center font-semibold shrink-0 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition">
                  {user.username.charAt(0).toUpperCase()}
                </div>

                {/* User Info */}
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}