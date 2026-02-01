import { useState, useEffect } from "react";
import { AlertTriangle, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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

const AdminIssuesDashboard = () => {
    const { toast } = useToast();
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState("");
    const [adminNotes, setAdminNotes] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterSeverity, setFilterSeverity] = useState<string>("");
    const [filterType, setFilterType] = useState<string>("");

    useEffect(() => {
        fetchIssues();
    }, [filterStatus, filterSeverity, filterType]);

    const fetchIssues = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            let url = "http://localhost:5000/api/issues/admin/all";

            const params = new URLSearchParams();
            if (filterStatus) params.append("status", filterStatus);
            if (filterSeverity) params.append("severity", filterSeverity);
            if (filterType) params.append("issueType", filterType);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch issues");
            }

            const data = await response.json();
            setIssues(data);
        } catch (error) {
            toast({
                title: "Error Loading Issues",
                description:
                    error instanceof Error ? error.message : "Please try again",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        if (!selectedIssue || !newStatus) return;

        setIsUpdating(true);
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
                        status: newStatus,
                        adminNotes: adminNotes || undefined,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Failed to update issue");
            }

            toast({
                title: "✅ Issue Updated",
                description: `Status changed to ${newStatus}`,
                className: "bg-green-50 border-green-200",
            });

            setShowStatusModal(false);
            setNewStatus("");
            setAdminNotes("");
            fetchIssues();
        } catch (error) {
            toast({
                title: "Update Failed",
                description:
                    error instanceof Error ? error.message : "Please try again",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high":
                return "bg-red-100 text-red-800";
            case "medium":
                return "bg-amber-100 text-amber-800";
            case "low":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open":
                return "bg-blue-500";
            case "in-review":
                return "bg-amber-500";
            case "resolved":
                return "bg-green-500";
            case "closed":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "quality":
                return "bg-purple-100 text-purple-800";
            case "behavior":
                return "bg-red-100 text-red-800";
            case "billing":
                return "bg-green-100 text-green-800";
            case "safety":
                return "bg-orange-100 text-orange-800";
            case "other":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            Issues Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage customer reported issues and tickets
                        </p>
                    </div>
                    <Button
                        onClick={fetchIssues}
                        disabled={isLoading}
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </Button>
                </div>

                {/* Filters */}
                <div className="bg-card border border-border rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label className="text-sm font-medium mb-2 block">
                                Filter by Status
                            </Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in-review">In Review</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm font-medium mb-2 block">
                                Filter by Severity
                            </Label>
                            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Severities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Severities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm font-medium mb-2 block">
                                Filter by Type
                            </Label>
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Types</SelectItem>
                                    <SelectItem value="quality">Quality</SelectItem>
                                    <SelectItem value="behavior">Behavior</SelectItem>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="safety">Safety</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Issues List */}
                {issues.length === 0 ? (
                    <div className="text-center py-12 bg-card border border-border rounded-lg">
                        <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No issues found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {issues.map((issue) => (
                            <div
                                key={issue._id}
                                className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        {/* Title and Ticket ID */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-foreground">
                                                {issue.title}
                                            </h3>
                                            <Badge variant="outline" className="text-xs">
                                                {issue.ticketId}
                                            </Badge>
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <Badge className={getStatusColor(issue.status)}>
                                                {issue.status.charAt(0).toUpperCase() +
                                                    issue.status.slice(1)}
                                            </Badge>
                                            <Badge className={getSeverityColor(issue.severity)}>
                                                {issue.severity}
                                            </Badge>
                                            <Badge className={getTypeColor(issue.issueType)}>
                                                {issue.issueType}
                                            </Badge>
                                        </div>

                                        {/* Customer & Booking Info */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                            <div>
                                                <p className="text-muted-foreground">Customer</p>
                                                <p className="font-medium text-foreground">
                                                    {issue.user.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {issue.user.email}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Service</p>
                                                <p className="font-medium text-foreground">
                                                    {issue.booking.service?.name || "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Booking Date</p>
                                                <p className="font-medium text-foreground">
                                                    {issue.booking.date}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Reported</p>
                                                <p className="font-medium text-foreground">
                                                    {new Date(issue.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-foreground/80 bg-muted/30 p-2 rounded mb-2">
                                            {issue.description}
                                        </p>

                                        {/* Admin Notes */}
                                        {issue.adminNotes && (
                                            <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                                                <p className="text-xs font-semibold text-green-900">
                                                    Admin Notes:
                                                </p>
                                                <p className="text-sm text-green-800">
                                                    {issue.adminNotes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <Button
                                        onClick={() => {
                                            setSelectedIssue(issue);
                                            setNewStatus(issue.status);
                                            setAdminNotes(issue.adminNotes || "");
                                            setShowStatusModal(true);
                                        }}
                                        className="whitespace-nowrap"
                                    >
                                        Update Status
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Update Status Modal */}
            <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Update Issue Status</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Current Issue Info */}
                        {selectedIssue && (
                            <div className="bg-muted/50 rounded-lg p-3">
                                <p className="text-sm font-semibold text-foreground">
                                    {selectedIssue.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {selectedIssue.ticketId}
                                </p>
                            </div>
                        )}

                        {/* Status Selection */}
                        <div className="space-y-2">
                            <Label>New Status</Label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
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

                        {/* Admin Notes */}
                        <div className="space-y-2">
                            <Label>Admin Notes (optional)</Label>
                            <Textarea
                                placeholder="Add notes about the resolution, actions taken, etc."
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowStatusModal(false)}
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleStatusUpdate} disabled={isUpdating}>
                            {isUpdating ? "Updating..." : "Update Status"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminIssuesDashboard;
