import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Lock, HelpCircle, ChevronRight, LogOut, Bell, Shield, CreditCard, X, Eye, EyeOff, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    createdAt: ""
  });

  // Load user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setProfileData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            createdAt: data.createdAt || ""
          });
        }
      } catch (err) {
        console.error("Failed to fetch user data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("token");

    // FULL app reset — kills all stale auth state
    window.location.replace("/login");
  };

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [notifications, setNotifications] = useState({
    push: true,
    email: false
  });

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone
        }),
      });

      if (res.ok) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully.",
        });
        setActiveModal(null);
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive"
      });
      return;
    }
    if (passwordData.new.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters.",
        variant: "destructive"
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.current,
          newPassword: passwordData.new,
        }),
      });

      if (res.ok) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
        setPasswordData({ current: "", new: "", confirm: "" });
        setActiveModal(null);
      } else {
        const error = await res.json();
        throw new Error(error.message || "Failed to change password");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to change password",
        variant: "destructive"
      });
    }
  };

  const handleEnable2FA = () => {
    toast({
      title: "2FA Enabled",
      description: "Two-factor authentication has been enabled for your account.",
    });
    setActiveModal(null);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Background with gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100/80 to-cyan-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading settings...</p>
          </div>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {activeModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setActiveModal(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                >
                  {/* Edit Profile Modal */}
                  {activeModal === "profile" && (
                    <>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h3 className="text-lg font-bold text-foreground">Edit Profile</h3>
                        <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex justify-center mb-4">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                            <User className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            placeholder="Enter your name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            placeholder="Enter your email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            placeholder="Enter your phone"
                          />
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setActiveModal(null)}>
                          Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Change Email Modal */}
                  {activeModal === "email" && (
                    <>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h3 className="text-lg font-bold text-foreground">Change Email</h3>
                        <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="p-4 bg-primary/5 rounded-xl">
                          <p className="text-sm text-muted-foreground">Current email</p>
                          <p className="font-medium text-foreground">{profileData.email}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newEmail">New Email Address</Label>
                          <Input
                            id="newEmail"
                            type="email"
                            placeholder="Enter new email"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          A verification link will be sent to your new email address.
                        </p>
                      </div>
                      <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setActiveModal(null)}>
                          Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleSaveProfile}>
                          Update Email
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Update Phone Modal */}
                  {activeModal === "phone" && (
                    <>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h3 className="text-lg font-bold text-foreground">Update Phone Number</h3>
                        <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="p-4 bg-primary/5 rounded-xl">
                          <p className="text-sm text-muted-foreground">Current phone</p>
                          <p className="font-medium text-foreground">{profileData.phone}</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPhone">New Phone Number</Label>
                          <Input
                            id="newPhone"
                            placeholder="+91 XXXXX XXXXX"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          An OTP will be sent to verify your new phone number.
                        </p>
                      </div>
                      <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setActiveModal(null)}>
                          Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleSaveProfile}>
                          Send OTP
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Change Password Modal */}
                  {activeModal === "password" && (
                    <>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h3 className="text-lg font-bold text-foreground">Change Password</h3>
                        <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentPass">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="currentPass"
                              type={showPassword ? "text" : "password"}
                              value={passwordData.current}
                              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newPass">New Password</Label>
                          <div className="relative">
                            <Input
                              id="newPass"
                              type={showNewPassword ? "text" : "password"}
                              value={passwordData.new}
                              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPass">Confirm New Password</Label>
                          <Input
                            id="confirmPass"
                            type="password"
                            value={passwordData.confirm}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                            placeholder="Confirm new password"
                          />
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className={passwordData.new.length >= 8 ? "text-success" : ""}>
                            {passwordData.new.length >= 8 ? <Check className="w-3 h-3 inline mr-1" /> : "• "}
                            At least 8 characters
                          </p>
                          <p className={/[A-Z]/.test(passwordData.new) ? "text-success" : ""}>
                            {/[A-Z]/.test(passwordData.new) ? <Check className="w-3 h-3 inline mr-1" /> : "• "}
                            One uppercase letter
                          </p>
                          <p className={/[0-9]/.test(passwordData.new) ? "text-success" : ""}>
                            {/[0-9]/.test(passwordData.new) ? <Check className="w-3 h-3 inline mr-1" /> : "• "}
                            One number
                          </p>
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setActiveModal(null)}>
                          Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleChangePassword}>
                          Update Password
                        </Button>
                      </div>
                    </>
                  )}

                  {/* 2FA Modal */}
                  {activeModal === "2fa" && (
                    <>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h3 className="text-lg font-bold text-foreground">Two-Factor Authentication</h3>
                        <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                          <Shield className="w-8 h-8 text-success" />
                        </div>
                        <div className="text-center">
                          <h4 className="font-semibold text-foreground mb-2">Secure Your Account</h4>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security by enabling two-factor authentication. You'll receive a verification code via SMS each time you sign in.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="2faPhone">Phone Number for 2FA</Label>
                          <Input
                            id="2faPhone"
                            defaultValue={profileData.phone}
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                      <div className="px-6 py-4 bg-muted/30 border-t border-border flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setActiveModal(null)}>
                          Cancel
                        </Button>
                        <Button className="flex-1" onClick={handleEnable2FA}>
                          Enable 2FA
                        </Button>
                      </div>
                    </>
                  )}

                  {/* Payment Methods Modal */}
                  {activeModal === "payment" && (
                    <>
                      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                        <h3 className="text-lg font-bold text-foreground">Payment Methods</h3>
                        <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                          <X className="w-5 h-5 text-muted-foreground" />
                        </button>
                      </div>
                      <div className="p-6 space-y-4">
                        {/* Saved Cards */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">
                                VISA
                              </div>
                              <div>
                                <p className="font-medium text-foreground">•••• •••• •••• 4532</p>
                                <p className="text-xs text-muted-foreground">Expires 12/25</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              Remove
                            </Button>
                          </div>
                          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                MC
                              </div>
                              <div>
                                <p className="font-medium text-foreground">•••• •••• •••• 8901</p>
                                <p className="text-xs text-muted-foreground">Expires 08/26</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                              Remove
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <CreditCard className="w-4 h-4 mr-2" />
                          Add New Card
                        </Button>
                      </div>
                      <div className="px-6 py-4 bg-muted/30 border-t border-border">
                        <Button className="w-full" onClick={() => setActiveModal(null)}>
                          Done
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <main className="container mx-auto px-4 pt-24 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 italic">
                Settings
              </h1>
              <p className="text-muted-foreground mb-8">
                Manage your account preferences and settings
              </p>

              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 p-6 mb-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">{profileData.name}</h2>
                    <p className="text-muted-foreground text-sm">
                      Member since {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" }) : "N/A"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={() => setActiveModal("profile")}
                  >
                    Edit Profile
                  </Button>
                </div>
              </motion.div>

              {/* Account Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 mb-6 overflow-hidden"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                  <h3 className="font-semibold text-foreground">Account Information</h3>
                </div>
                <div className="divide-y divide-border/50">
                  <div
                    onClick={() => setActiveModal("email")}
                    className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Linked Email</p>
                        <p className="text-sm text-muted-foreground">{profileData.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <span className="text-sm font-medium">Change</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div
                    onClick={() => setActiveModal("phone")}
                    className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Phone Number</p>
                        <p className="text-sm text-muted-foreground">{profileData.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <span className="text-sm font-medium">Update</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Security */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 mb-6 overflow-hidden"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                  <h3 className="font-semibold text-foreground">Security</h3>
                </div>
                <div className="divide-y divide-border/50">
                  <div
                    onClick={() => setActiveModal("password")}
                    className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Change Password</p>
                        <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <span className="text-sm font-medium">Update</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div
                    onClick={() => setActiveModal("2fa")}
                    className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Not enabled</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary">
                      <span className="text-sm font-medium">Enable</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Preferences */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 mb-6 overflow-hidden"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                  <h3 className="font-semibold text-foreground">Preferences</h3>
                </div>
                <div className="divide-y divide-border/50">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Push Notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Email Notifications</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Payment - Hidden for now */}
              {/* 
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 mb-6 overflow-hidden"
          >
            <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
              <h3 className="font-semibold text-foreground">Payment</h3>
            </div>
            <div
              onClick={() => setActiveModal("payment")}
              className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Saved Payment Methods</p>
                  <p className="text-sm text-muted-foreground">2 cards saved</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <span className="text-sm font-medium">Manage</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
          */}

              {/* Support Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50 mb-6 overflow-hidden"
              >
                <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                  <h3 className="font-semibold text-foreground">Help & Support</h3>
                </div>
                <div className="divide-y divide-border/50">
                  <a
                    href="mailto:support@trustac.in"
                    className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Email Support</p>
                        <p className="text-sm text-muted-foreground">support@trustac.in</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </a>
                  <a
                    href="tel:+918274949213"
                    className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Call Support</p>
                        <p className="text-sm text-muted-foreground">+91 8274949213</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </a>
                  <div className="flex items-center justify-between px-6 py-4 hover:bg-primary/5 transition-colors cursor-pointer">
                    <Link to="/faq-help" className="flex items-center gap-4 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">FAQ & Help Center</p>
                        <p className="text-sm text-muted-foreground">Browse common questions</p>
                      </div>
                    </Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </motion.div>

              {/* Logout Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full h-14 text-destructive border-destructive/30 hover:bg-destructive hover:text-white font-medium"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </Button>

              </motion.div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                TrustAC v1.0.0 • Terms of Service • Privacy Policy
              </p>
            </motion.div>
          </main>        </>)}

      <Footer />
    </div>
  );
};

export default Settings;