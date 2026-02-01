import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Calendar, Users, AlertTriangle, LogOut,
  Phone, MapPin, Clock, CheckCircle2, User, Wrench, Eye,
  UserCheck, UserX, Star, MessageCircle, ChevronRight,
  IndianRupee, Camera, FileText, X, Search, Filter,
  TrendingUp, AlertCircle, Briefcase, Shield, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

type ActiveSection = "dashboard" | "bookings" | "technicians" | "issues";

interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  appliance: string;
  service: string;
  status: "confirmed" | "assigned" | "in-progress" | "completed" | "cancelled";
  scheduledDate: string;
  scheduledTime: string;
  assignedTechnician?: string;
  price: number;
  beforePhotos?: string[];
  afterPhotos?: string[];
  technicianNotes?: string;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: "active" | "suspended";
  rating: { average: number; count: number } | number;
  totalJobs: number;
  completedJobs: number;
  activeJobs: number;
  joinedDate: string;
  specialization: string[];
}

interface Issue {
  _id: string;
  ticketId: string;
  issueType: "quality" | "behavior" | "billing" | "safety" | "other";
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  status: "open" | "in-review" | "resolved" | "closed";
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  booking: {
    _id: string;
    service: {
      name: string;
      price: number;
      originalPrice: number;
      duration: string;
    };
    date: string;
    time: string;
  };
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showIssueStatusModal, setShowIssueStatusModal] = useState(false);
  const [newIssueStatus, setNewIssueStatus] = useState("");
  const [issueAdminNotes, setIssueAdminNotes] = useState("");
  const [isUpdatingIssue, setIsUpdatingIssue] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(false);

  // Verify admin access on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      navigate("/login", { replace: true });
      return;
    }

    // Prevent back button navigation
    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    // Add initial pushState to prevent going back
    window.history.pushState(null, "", window.location.href);

    // Listen for back button clicks
    window.addEventListener("popstate", preventBack);

    return () => {
      window.removeEventListener("popstate", preventBack);
    };
  }, [navigate]);

  // Fetch bookings from API
  useEffect(() => {
    const loadBookings = async () => {
      setIsLoadingBookings(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast({
            title: "Not authenticated",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch("http://localhost:5000/api/bookings/admin/all", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch bookings: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        // Transform backend data to Booking interface
        const transformedBookings = data.map((b: any) => ({
          id: b._id ? b._id.slice(-8).toUpperCase() : "N/A",
          fullId: b._id || "",
          customerName: b.user?.name || "Unknown",
          customerPhone: b.user?.phone || "N/A",
          address: b.address?.address || b.address || "N/A",
          appliance: typeof b.service === "object" ? b.service?.name : (b.service || "N/A"),
          service: typeof b.service === "object" ? b.service?.name : (b.service || "N/A"),
          status: b.status === "pending" ? "confirmed" : (b.status || "confirmed"),
          scheduledDate: b.schedule?.date ? new Date(b.schedule.date).toLocaleDateString() : "N/A",
          scheduledTime: b.schedule?.timeSlot || "N/A",
          price: b.service?.price || 0,
          mechanic: b.mechanic || null,
        }));
        setBookings(transformedBookings);
      } catch (error) {
        console.error("Error loading bookings:", error);
        toast({
          title: "Error Loading Bookings",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
        // Use fallback bookings
        setBookings([]);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    loadBookings();
  }, []);

  // Sample Data - kept as fallback
  const fallbackBookings: Booking[] = [
    {
      id: "BK-001",
      customerName: "Rahul Sharma",
      customerPhone: "+91 98765 43210",
      address: "B-204, Sunshine Apartments, Sector 45, Gurugram",
      appliance: "Split AC",
      service: "Deep Cleaning",
      status: "in-progress",
      scheduledDate: "Today",
      scheduledTime: "10:00 AM - 12:00 PM",
      assignedTechnician: "Ramesh Kumar",
      price: 499,
      technicianNotes: "Cleaned filters and checked gas levels. Working fine now."
    },
    {
      id: "BK-002",
      customerName: "Priya Patel",
      customerPhone: "+91 87654 32109",
      address: "Flat 12, Green Valley Society, Noida",
      appliance: "Refrigerator",
      service: "Gas Refilling",
      status: "confirmed",
      scheduledDate: "Today",
      scheduledTime: "2:00 PM - 4:00 PM",
      price: 599
    },
    {
      id: "BK-003",
      customerName: "Amit Kumar",
      customerPhone: "+91 76543 21098",
      address: "House 45, DLF Phase 3, Gurugram",
      appliance: "Washing Machine",
      service: "Drum Repair",
      status: "assigned",
      scheduledDate: "Today",
      scheduledTime: "4:00 PM - 6:00 PM",
      assignedTechnician: "Suresh Yadav",
      price: 799
    },
    {
      id: "BK-004",
      customerName: "Sneha Gupta",
      customerPhone: "+91 65432 10987",
      address: "A-101, Palm Heights, Dwarka",
      appliance: "Window AC",
      service: "Installation",
      status: "completed",
      scheduledDate: "Yesterday",
      scheduledTime: "9:00 AM - 11:00 AM",
      assignedTechnician: "Ramesh Kumar",
      price: 999,
      technicianNotes: "Installation completed successfully. Tested all functions.",
      beforePhotos: ["before1.jpg"],
      afterPhotos: ["after1.jpg"]
    },
    {
      id: "BK-005",
      customerName: "Vikram Singh",
      customerPhone: "+91 54321 09876",
      address: "Plot 23, Vasant Kunj, Delhi",
      appliance: "Split AC",
      service: "Compressor Repair",
      status: "completed",
      scheduledDate: "Yesterday",
      scheduledTime: "3:00 PM - 5:00 PM",
      assignedTechnician: "Mohit Verma",
      price: 1499,
      technicianNotes: "Replaced faulty capacitor. Compressor working fine."
    }
  ];


  // Fetch technicians from API
  useEffect(() => {
    const loadTechnicians = async () => {
      setIsLoadingTechnicians(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5000/api/users?role=technician", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch technicians: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }

        // Use stats from backend API
        const technicianStats = data.map((t: any) => ({
          id: t._id || "N/A",
          name: t.name || "Unknown",
          phone: t.phone || "N/A",
          email: t.email || "N/A",
          status: t.status || "active",
          rating: t.rating || { average: 0, count: 0 },
          totalJobs: t.totalBookings || 0,
          completedJobs: t.completedBookings || 0,
          activeJobs: t.activeBookings || 0,
          joinedDate: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "N/A",
          specialization: t.specialization || [],
        }));

        setTechnicians(technicianStats);
      } catch (error) {
        console.error("Error loading technicians:", error);
        toast({
          title: "Error Loading Technicians",
          description: error instanceof Error ? error.message : "Please try again",
          variant: "destructive",
        });
        setTechnicians([]);
      } finally {
        setIsLoadingTechnicians(false);
      }
    };

    // Only load technicians if bookings are already loaded
    if (bookings.length > 0) {
      loadTechnicians();
    }
  }, [bookings]);

  // Load issues function (can be called from useEffect or refresh button)
  const fetchIssues = async () => {
    setIsLoadingIssues(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/issues/admin/all", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch issues: ${response.status}`);
      }

      const data = await response.json();
      setIssues(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading issues:", error);
      toast({
        title: "Error Loading Issues",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIssues([]);
    } finally {
      setIsLoadingIssues(false);
    }
  };

  // Fetch issues from API when component mounts or section changes
  useEffect(() => {
    if (activeSection === "issues" || activeSection === "dashboard") {
      fetchIssues();
    }
  }, [activeSection]);

  const handleUpdateIssueStatus = async () => {
    if (!selectedIssue || !newIssueStatus) return;

    setIsUpdatingIssue(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:5000/api/issues/${selectedIssue._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newIssueStatus,
            adminNotes: issueAdminNotes || undefined,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update issue");
      }

      toast({
        title: "✅ Issue Updated",
        description: `Status changed to ${newIssueStatus}`,
        variant: "default",
      });

      setShowIssueStatusModal(false);
      setNewIssueStatus("");
      setIssueAdminNotes("");
      fetchIssues();
    } catch (error) {
      toast({
        title: "Update Failed",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingIssue(false);
    }
  };

  const stats = {
    ongoingJobs: bookings.filter(b => b.status === "in-progress").length,
    completedJobs: bookings.filter(b => b.status === "completed").length,
    openIssues: issues.filter(i => i.status !== "resolved" && i.status !== "closed").length
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed": return "bg-blue-100 text-blue-700 border-blue-200";
      case "assigned": return "bg-purple-100 text-purple-700 border-purple-200";
      case "in-progress": return "bg-amber-100 text-amber-700 border-amber-200";
      case "completed": return "bg-green-100 text-green-700 border-green-200";
      case "cancelled": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusLabel = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed": return "Confirmed";
      case "assigned": return "Assigned";
      case "in-progress": return "In Progress";
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };

  const getSeverityColor = (severity: Issue["severity"]) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      case "low": return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };



  const getIssueStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-700 border-red-200";
      case "in-review":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Time slot mapping for display (same as MyBookings page)
  const timeSlotMap: Record<string, string> = {
    "morning-1": "8:00 AM",
    "morning-2": "9:00 AM",
    "morning-3": "10:00 AM",
    "morning-4": "11:00 AM",
    "afternoon-1": "12:00 PM",
    "afternoon-2": "2:00 PM",
    "afternoon-3": "3:00 PM",
    "afternoon-4": "4:00 PM",
    "evening-1": "5:00 PM",
    "evening-2": "6:00 PM",
  };

  const formatTimeSlot = (timeSlotId: string): string => {
    return timeSlotMap[timeSlotId] || timeSlotId;
  };

  const handleAssignTechnician = (technicianName: string) => {
    toast({
      title: "Technician Assigned",
      description: `${technicianName} has been assigned to the booking.`
    });
    setShowAssignModal(false);
  };

  const handleToggleTechnicianStatus = (technician: Technician) => {
    const newStatus = technician.status === "active" ? "suspended" : "active";
    toast({
      title: `Technician ${newStatus === "active" ? "Activated" : "Suspended"}`,
      description: `${technician.name} has been ${newStatus}.`
    });
  };

  const handleResolveIssue = (issue: Issue) => {
    toast({
      title: "Issue Resolved",
      description: `Issue #${issue.ticketId} has been marked as resolved.`
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully."
    });
    navigate("/login");
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "technicians", label: "Technicians", icon: Users },
    { id: "issues", label: "Issues", icon: AlertTriangle, badge: stats.openIssues },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex" >
      {/* Sidebar */}
      < aside className="w-64 bg-white border-r border-blue-100 hidden lg:flex flex-col shadow-sm" >
        <div className="p-6 border-b border-blue-100">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">TrustAC</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as ActiveSection)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50 hover:text-gray-900"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <Badge className="ml-auto bg-red-500 text-white text-xs shadow-md">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside >

      {/* Mobile Header */}
      < div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-blue-100 z-50 shadow-sm" >
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Admin</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-red-600 hover:text-red-700">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex overflow-x-auto px-2 pb-2 gap-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as ActiveSection)}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg whitespace-nowrap text-xs font-medium transition-all duration-200 ${isActive
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                  : "bg-blue-50 text-gray-600 hover:bg-blue-100"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {item.badge && item.badge > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div >

      {/* Main Content */}
      < main className="flex-1 lg:p-8 p-4 pt-40 lg:pt-8 overflow-auto" >
        <AnimatePresence mode="wait">
          {/* Dashboard Section */}
          {activeSection === "dashboard" && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of today's operations</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md">
                        <Wrench className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.ongoingJobs}</p>
                        <p className="text-sm text-gray-600">Ongoing Jobs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.completedJobs}</p>
                        <p className="text-sm text-gray-600">Completed Jobs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-white border-red-200 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-md">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{stats.openIssues}</p>
                        <p className="text-sm text-gray-600">Open Issues</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Bookings */}
              <Card className="bg-card border-none shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Bookings</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary"
                      onClick={() => setActiveSection("bookings")}
                    >
                      View All <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bookings.slice(0, 4).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">{booking.appliance} • {booking.service}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(booking.status)} border`}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Open Issues */}
              {stats.openIssues > 0 && (
                <Card className="bg-card border-none shadow-sm border-l-4 border-l-destructive">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Open Issues
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary"
                        onClick={() => setActiveSection("issues")}
                      >
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {issues.filter(i => i.status !== "resolved").slice(0, 2).map((issue) => (
                      <div
                        key={issue._id}
                        className="p-3 bg-destructive/5 rounded-xl"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-foreground">{issue.user.name}</p>
                          <Badge className={`${getSeverityColor(issue.severity)} border text-xs`}>
                            {issue.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{issue.description}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Bookings Section */}
          {activeSection === "bookings" && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Bookings</h1>
                <p className="text-gray-600 mt-1">Manage all customer bookings</p>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by customer or booking ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bookings List */}
              {isLoadingBookings ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : filteredBookings.length === 0 ? (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No bookings found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="bg-white border-blue-100 hover:border-blue-300 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => {
                        setSelectedBooking(booking);
                        setShowBookingDetails(true);
                      }}>
                        <CardContent className="p-5">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            {/* Customer Info */}
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-semibold text-gray-900">{booking.customerName}</p>
                                  <Badge className={`${getStatusColor(booking.status)} border text-xs`}>
                                    {getStatusLabel(booking.status)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{booking.customerPhone}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                  <span className="px-2.5 py-1 bg-blue-100 rounded-lg">{booking.appliance}</span>
                                  <span>•</span>
                                  <span>{booking.service}</span>
                                </div>
                              </div>
                            </div>

                            {/* Schedule & Address */}
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-foreground">{booking.scheduledDate}, {formatTimeSlot(booking.scheduledTime)}</span>
                              </div>
                              <div className="flex items-start gap-2 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <span className="text-muted-foreground line-clamp-1">{booking.address}</span>
                              </div>
                              {booking.assignedTechnician && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Wrench className="w-4 h-4 text-primary" />
                                  <span className="text-primary font-medium">{booking.assignedTechnician}</span>
                                </div>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowBookingDetails(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                                <span className="hidden sm:inline">Details</span>
                              </Button>
                              {booking.status === "confirmed" && (
                                <Button
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowAssignModal(true);
                                  }}
                                >
                                  <UserCheck className="w-4 h-4" />
                                  <span className="hidden sm:inline">Assign</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Technicians Section */}
          {activeSection === "technicians" && (
            <motion.div
              key="technicians"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Technicians</h1>
                <p className="text-gray-600 mt-1">Manage your service technicians</p>
              </div>

              {isLoadingTechnicians ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : technicians.length === 0 ? (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-12 text-center">
                    <Users className="w-12 h-12 mx-auto text-blue-300 mb-3" />
                    <p className="text-gray-600">No technicians found</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {technicians.map((technician, index) => (
                    <motion.div
                      key={technician.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`bg-white border-blue-200 hover:border-blue-400 shadow-md hover:shadow-lg transition-all duration-300 ${technician.status === "suspended" ? "opacity-60" : ""
                        }`}>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                              <User className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900">{technician.name}</h3>
                                <Badge className={`${technician.status === "active"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                                  } border`}>
                                  {technician.status === "active" ? "Active" : "Suspended"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{technician.phone}</p>
                              <p className="text-sm text-muted-foreground">{technician.email}</p>

                              <div className="flex flex-wrap gap-1 mt-2">
                                {technician.specialization && technician.specialization.length > 0 ? (
                                  technician.specialization.map((spec) => (
                                    <span key={spec} className="px-2 py-0.5 bg-muted rounded text-xs">
                                      {spec}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-muted-foreground">No specialization</span>
                                )}
                              </div>

                              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border">
                                <div className="text-center">
                                  <p className="text-lg font-bold text-foreground">{technician.totalJobs}</p>
                                  <p className="text-xs text-muted-foreground">Total Jobs</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-bold text-green-600">{technician.completedJobs}</p>
                                  <p className="text-xs text-muted-foreground">Completed</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    <span className="text-lg font-bold text-foreground">{typeof technician.rating === "object" ? technician.rating.average : technician.rating}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">Rating</p>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Button size="sm" variant="outline" className="flex-1 gap-1">
                                  <Phone className="w-4 h-4" />
                                  Call
                                </Button>
                                <Button
                                  size="sm"
                                  variant={technician.status === "active" ? "destructive" : "default"}
                                  className="flex-1 gap-1"
                                  onClick={() => handleToggleTechnicianStatus(technician)}
                                >
                                  {technician.status === "active" ? (
                                    <>
                                      <UserX className="w-4 h-4" />
                                      Suspend
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="w-4 h-4" />
                                      Activate
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Issues Section */}
          {activeSection === "issues" && (
            <motion.div
              key="issues"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Issues & Complaints</h1>
                  <p className="text-gray-600 mt-1">Handle customer reported issues</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchIssues}
                  disabled={isLoadingIssues}
                  className="gap-2"
                >
                  {isLoadingIssues ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  Refresh
                </Button>
              </div>

              {isLoadingIssues ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : issues.length === 0 ? (
                <Card className="bg-card border-none shadow-sm">
                  <CardContent className="p-12 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No issues reported yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* Open Issues Section */}
                  <div className="mb-8">
                    <h2 className="text-lg font-bold mb-2">Open Issues</h2>
                    {issues.filter(i => i.status === "open").length === 0 && (
                      <p className="text-muted-foreground mb-4">No open issues.</p>
                    )}
                    {issues.filter(i => i.status === "open").map((issue, index) => (
                      <motion.div
                        key={issue._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-card border-none shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge className={`${getSeverityColor(issue.severity)} border text-xs`}>
                                    {issue.severity} severity
                                  </Badge>
                                  <Badge className={`${getIssueStatusColor(issue.status)} border text-xs`}>
                                    {issue.status.replace("-", " ")}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {issue.ticketId}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(issue.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{issue.title}</h3>
                                <p className="text-sm text-foreground mb-2">
                                  <strong>Customer:</strong> {issue.user.name}
                                </p>
                                <p className="text-sm text-muted-foreground mb-2">
                                  <strong>Phone:</strong> {issue.user.phone}
                                </p>
                                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg mb-2">
                                  {issue.description}
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <strong>Service:</strong> {issue.booking?.service?.name || "N/A"} - {issue.booking?.date || "N/A"}
                                </p>
                                {issue.adminNotes && (
                                  <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                                    <p className="text-xs font-semibold text-green-900">Admin Notes:</p>
                                    <p className="text-sm text-green-800">{issue.adminNotes}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 w-full max-w-[220px]">
                                <Button
                                  size="default"
                                  variant="outline"
                                  className="flex-1 gap-1 py-2 text-base"
                                  onClick={() => window.location.href = `tel:${issue.user.phone}`}
                                >
                                  <Phone className="w-4 h-4" />
                                  Call
                                </Button>
                                <Button
                                  size="default"
                                  className="flex-1 gap-1 py-2 text-base bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedIssue(issue);
                                    setNewIssueStatus("resolved");
                                    setIssueAdminNotes(issue.adminNotes || "");
                                    setShowIssueStatusModal(true);
                                  }}
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  Mark Resolved
                                </Button>
                                <Button
                                  size="default"
                                  className="flex-1 gap-1 py-2 text-base bg-red-600 hover:bg-red-700 text-white"
                                  onClick={async () => {
                                    setSelectedIssue(issue);
                                    setNewIssueStatus("closed");
                                    setIssueAdminNotes(issue.adminNotes || "");
                                    setShowIssueStatusModal(true);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                  Close
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  {/* Resolved Issues Section */}
                  <div>
                    <h2 className="text-lg font-bold mb-2">Resolved Issues</h2>
                    {issues.filter(i => i.status === "resolved").length === 0 && (
                      <p className="text-muted-foreground mb-4">No resolved issues.</p>
                    )}
                    {issues.filter(i => i.status === "resolved").map((issue, index) => (
                      <motion.div
                        key={issue._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="bg-card border-none shadow-sm opacity-75">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <Badge className={`${getSeverityColor(issue.severity)} border text-xs`}>
                                    {issue.severity} severity
                                  </Badge>
                                  <Badge className={`${getIssueStatusColor(issue.status)} border text-xs`}>
                                    {issue.status.replace("-", " ")}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {issue.ticketId}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(issue.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">{issue.title}</h3>
                                <p className="text-sm text-foreground mb-2">
                                  <strong>Customer:</strong> {issue.user.name}
                                </p>
                                <p className="text-sm text-muted-foreground mb-2">
                                  <strong>Phone:</strong> {issue.user.phone}
                                </p>
                                <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg mb-2">
                                  {issue.description}
                                </p>
                                <p className="text-xs text-muted-foreground mb-2">
                                  <strong>Service:</strong> {issue.booking?.service?.name || "N/A"} - {issue.booking?.date || "N/A"}
                                </p>
                                {issue.adminNotes && (
                                  <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                                    <p className="text-xs font-semibold text-green-900">Admin Notes:</p>
                                    <p className="text-sm text-green-800">{issue.adminNotes}</p>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col gap-2 w-full max-w-[220px]">
                                <Button
                                  size="default"
                                  variant="outline"
                                  className="flex-1 gap-1 py-2 text-base"
                                  onClick={() => window.location.href = `tel:${issue.user.phone}`}
                                >
                                  <Phone className="w-4 h-4" />
                                  Call
                                </Button>
                                <Button
                                  size="default"
                                  className="flex-1 gap-1 py-2 text-base bg-red-600 hover:bg-red-700 text-white"
                                  onClick={async () => {
                                    setSelectedIssue(issue);
                                    setNewIssueStatus("closed");
                                    setIssueAdminNotes(issue.adminNotes || "");
                                    setShowIssueStatusModal(true);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                  Close
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main >

      {/* Booking Details Modal */}
      < Dialog open={showBookingDetails} onOpenChange={setShowBookingDetails} >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-blue-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900 text-xl">Booking Details - <span className="text-blue-600">{selectedBooking?.id}</span></DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide">Name</p>
                    <p className="font-medium text-gray-900 mt-1">{selectedBooking.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide">Phone</p>
                    <p className="font-medium text-gray-900 mt-1">{selectedBooking.customerPhone}</p>
                  </div>
                  <div className="col-span-full">
                    <p className="text-gray-600 text-xs uppercase tracking-wide">Address</p>
                    <p className="font-medium text-gray-900 mt-1 bg-white p-3 rounded-lg border border-blue-200">{selectedBooking.address || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600" />
                  Service Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide">Appliance</p>
                    <p className="font-medium text-gray-900 mt-1">{selectedBooking.appliance}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide">Service</p>
                    <p className="font-medium text-gray-900 mt-1">{selectedBooking.service}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide">Schedule</p>
                    <p className="font-medium text-gray-900 mt-1">{selectedBooking.scheduledDate}, {formatTimeSlot(selectedBooking.scheduledTime)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs uppercase tracking-wide">Amount</p>
                    <p className="font-medium text-blue-600 text-lg mt-1">₹{selectedBooking.price}</p>
                  </div>
                </div>
              </div>

              {/* Technician Info */}
              {selectedBooking.assignedTechnician && (
                <div className="bg-primary/5 rounded-xl p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Assigned Technician
                  </h4>
                  <p className="font-medium text-primary">{selectedBooking.assignedTechnician}</p>
                </div>
              )}

              {/* Technician Notes */}
              {selectedBooking.technicianNotes && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Technician Notes
                  </h4>
                  <p className="text-sm text-foreground">{selectedBooking.technicianNotes}</p>
                </div>
              )}

              {/* Photos */}
              {(selectedBooking.beforePhotos || selectedBooking.afterPhotos) && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Work Photos
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBooking.beforePhotos && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Before</p>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <Camera className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                    {selectedBooking.afterPhotos && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">After</p>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                          <Camera className="w-8 h-8 text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog >

      {/* Assign Technician Modal */}
      < Dialog open={showAssignModal} onOpenChange={setShowAssignModal} >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {technicians.filter(t => t.status === "active").map((technician) => (
              <button
                key={technician.id}
                className="w-full p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors text-left"
                onClick={() => handleAssignTechnician(technician.name)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{technician.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {typeof technician.rating === "object" ? technician.rating.average : technician.rating} • {technician.activeJobs} active jobs
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog >

      {/* Update Issue Status Modal */}
      < Dialog open={showIssueStatusModal} onOpenChange={setShowIssueStatusModal} >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Issue Status</DialogTitle>
          </DialogHeader>

          {selectedIssue && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-semibold text-foreground">{selectedIssue.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{selectedIssue.ticketId}</p>
                <p className="text-sm text-foreground mt-2">👤 {selectedIssue.user.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                <Select value={newIssueStatus} onValueChange={setNewIssueStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-review">In Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Admin Notes</label>
                <Textarea
                  placeholder="Add notes about the resolution..."
                  value={issueAdminNotes}
                  onChange={(e) => setIssueAdminNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowIssueStatusModal(false)}
              disabled={isUpdatingIssue}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateIssueStatus}
              disabled={isUpdatingIssue}
            >
              {isUpdatingIssue ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  );
};

export default AdminDashboard;
