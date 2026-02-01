import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ReportIssueModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    bookingService: string;
}

const issueTypes = [
    { value: "quality", label: "Poor Service Quality" },
    { value: "behavior", label: "Technician Behavior" },
    { value: "billing", label: "Billing Issue" },
    { value: "safety", label: "Safety Concern" },
    { value: "other", label: "Other" },
];

const severityLevels = [
    { value: "low", label: "Low - Minor inconvenience" },
    { value: "medium", label: "Medium - Moderate impact" },
    { value: "high", label: "High - Serious issue" },
];

const ReportIssueModal = ({
    isOpen,
    onClose,
    bookingId,
    bookingService,
}: ReportIssueModalProps) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [issueType, setIssueType] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState("medium");

    const handleSubmit = async () => {
        if (!issueType || !title || !description.trim()) {
            toast({
                title: "Please fill in all required fields",
                variant: "destructive",
            });
            return;
        }

        if (description.length < 20) {
            toast({
                title: "Description must be at least 20 characters",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:5000/api/issues", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bookingId,
                    issueType,
                    title,
                    description,
                    severity,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to report issue");
            }

            const data = await response.json();

            toast({
                title: "✅ Issue Reported Successfully",
                description: `Ticket ID: ${data.ticketId}. Our support team will review it shortly.`,
                className: "bg-green-50 border-green-200",
            });

            // Reset form
            setIssueType("");
            setTitle("");
            setDescription("");
            setSeverity("medium");
            onClose();
        } catch (error) {
            toast({
                title: "Failed to Report Issue",
                description:
                    error instanceof Error ? error.message : "Please try again",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="w-5 h-5" />
                        Report an Issue
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Booking Info */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                            <strong>Service:</strong> {bookingService}
                        </p>
                    </div>

                    {/* Issue Type */}
                    <div className="space-y-2">
                        <Label>Issue Type *</Label>
                        <RadioGroup value={issueType} onValueChange={setIssueType}>
                            {issueTypes.map((type) => (
                                <div key={type.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={type.value} id={type.value} />
                                    <Label
                                        htmlFor={type.value}
                                        className="cursor-pointer font-normal"
                                    >
                                        {type.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                            id="title"
                            placeholder="Brief summary of the issue"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Detailed Description * (minimum 20 characters)
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Please provide detailed information about the issue..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px] w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                            {description.length}/20 characters (minimum)
                        </p>
                    </div>

                    {/* Severity */}
                    <div className="space-y-2">
                        <Label>Severity Level</Label>
                        <RadioGroup value={severity} onValueChange={setSeverity}>
                            {severityLevels.map((level) => (
                                <div key={level.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={level.value} id={level.value} />
                                    <Label
                                        htmlFor={level.value}
                                        className="cursor-pointer font-normal"
                                    >
                                        {level.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                            💡 Our support team will review your report and get back to you
                            within 24 hours.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? "Submitting..." : "Submit Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ReportIssueModal;
