// src/pages/Profile.tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [theme, setTheme] = useState<"light" | "pastel" | "dark">("light");

  // Fetch user session
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
      else navigate("/"); // redirect if not logged in
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (!user) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="h-24 w-24">
          <AvatarFallback>
            {user.email?.charAt(0).toUpperCase() || "👤"}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-semibold">
          {user.user_metadata?.full_name || "User"}
        </h2>
        <p className="text-gray-500">🔥 Streak: 12 days</p>
        <p className="text-gray-400 text-sm">{user.email}</p>
      </div>

      {/* Theme Selector */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Theme</h3>
        <div className="flex space-x-3">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            Light
          </Button>
          <Button
            variant={theme === "pastel" ? "default" : "outline"}
            onClick={() => setTheme("pastel")}
          >
            Pastel
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            Dark
          </Button>
        </div>
      </div>

      {/* Account Settings */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Account Settings</h3>
        <div className="flex items-center justify-between">
          <span>Notifications</span>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
        <div className="flex items-center justify-between">
          <span>Privacy Mode</span>
          <Switch checked={privacyMode} onCheckedChange={setPrivacyMode} />
        </div>
      </div>

      {/* Logout */}
      <div className="text-center mt-6">
        <Button variant="destructive" onClick={handleLogout}>
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
