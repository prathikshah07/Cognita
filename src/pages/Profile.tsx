import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/signin");
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="h-24 w-24">
          <AvatarFallback>{user?.email ? getInitials(user.email) : "U"}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-semibold">{user?.email}</h2>
        <p className="text-gray-500">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
      </div>

      {/* Theme Selector */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Theme</h3>
        <div className="flex space-x-3">
          <Button variant="outline">Light</Button>
          <Button variant="outline">Pastel</Button>
          <Button variant="outline">Dark</Button>
        </div>
      </div>

      {/* Account Settings */}
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Account Settings</h3>
        <div className="flex items-center justify-between">
          <span>Notifications</span>
          <Switch />
        </div>
        <div className="flex items-center justify-between">
          <span>Privacy Mode</span>
          <Switch />
        </div>
      </div>

      <div className="text-center mt-6">
        <Button variant="destructive" onClick={handleSignOut}>Log Out</Button>
      </div>
    </div>
  );
};

export default Profile;
