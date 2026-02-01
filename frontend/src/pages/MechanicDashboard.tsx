import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, User, Phone, IndianRupee, Wrench, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

/* ================= TYPES ================= */

interface Booking {
  _id: string;
  service: { name: string; category: string; price: number };
  user: { name: string; phone: string };
  address: { address: string; pincode: string };
  schedule: { date: string; timeSlot: string };
  status: "pending" | "assigned" | "in-progress" | "completed";
}

/* ================= COMPONENT ================= */

export default function MechanicDashboard() {
  const [availableJobs, setAvailableJobs] = useState<Booking[]>([]);
  const [activeJobs, setActiveJobs] = useState<Booking[]>([]);
  const [completedJobs, setCompletedJobs] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Booking | null>(null);
  const [description, setDescription] = useState("");
  const [extraCharge, setExtraCharge] = useState("");
  const token = localStorage.getItem("token");

  // Load jobs
  const loadJobs = async () => {
    try {
      setLoading(true);
      const [openRes, myRes] = await Promise.all([
        fetch("http://localhost:5000/api/bookings/open", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("http://localhost:5000/api/bookings/mechanic", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const openJobs: Booking[] = openRes.ok ? await openRes.json() : [];
      const myJobs: Booking[] = myRes.ok ? await myRes.json() : [];
      setAvailableJobs(openJobs);
      setActiveJobs(myJobs.filter(j => j.status !== "completed"));
      setCompletedJobs(myJobs.filter(j => j.status === "completed"));
    } catch {
      toast({ title: "Failed to load jobs", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadJobs(); }, []);

  // Actions
  const takeJob = async (id: string) => {
    await fetch(`http://localhost:5000/api/bookings/${id}/accept`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    toast({ title: "Job Taken" });
    loadJobs();
  };
  const startWork = async (id: string) => {
    await fetch(`http://localhost:5000/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "in-progress" }),
    });
    loadJobs();
  };
  const completeJob = async () => {
    if (!selectedJob) return;
    await fetch(`http://localhost:5000/api/bookings/${selectedJob._id}/complete`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ description, extraCharge: Number(extraCharge || 0) }),
    });
    toast({ title: "Job Completed" });
    setSelectedJob(null);
    setDescription("");
    setExtraCharge("");
    loadJobs();
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <Tabs defaultValue="active" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="active"><Wrench className="inline mr-1" />Active</TabsTrigger>
          <TabsTrigger value="available"><User className="inline mr-1" />Available</TabsTrigger>
          <TabsTrigger value="completed"><CheckCircle2 className="inline mr-1" />Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <section className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-700"><Wrench /> Active Jobs <span className="text-base font-normal text-gray-500">({activeJobs.length})</span></h2>
            <div className="space-y-4">
              {activeJobs.length === 0 && <p className="text-gray-400">No active jobs.</p>}
              {activeJobs.map(job => (
                <motion.div key={job._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="shadow border border-indigo-100 rounded-xl hover:shadow-xl transition-all">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-bold text-lg text-indigo-800">{job.service.name}</div>
                        <Badge className={`capitalize ${job.status === "in-progress" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{job.status.replace("-", " ")}</Badge>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">{job.service.category}</div>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-2"><User className="w-4 h-4" /> {job.user.name}</div>
                        <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {job.user.phone}</div>
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job.address.address}</div>
                        <div className="flex items-center gap-2 font-semibold"><IndianRupee className="w-4 h-4" /> {job.service.price}</div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {job.status === "assigned" && (
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => startWork(job._id)}>Start Work</Button>
                        )}
                        {job.status === "in-progress" && (
                          <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => setSelectedJob(job)}>Complete Job</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </TabsContent>
        <TabsContent value="available">
          <section className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="text-xl font-bold mb-4 text-blue-700">Available Jobs</h2>
            <div className="space-y-4">
              {availableJobs.length === 0 && <p className="text-gray-400">No available jobs.</p>}
              {availableJobs.map(job => (
                <Card key={job._id} className="shadow border border-blue-100 rounded-xl hover:shadow-xl transition-all">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="font-bold text-blue-800 text-lg">{job.service.name}</div>
                    <div className="text-sm text-gray-500">{job.address.address}</div>
                    <div className="font-semibold text-blue-700">₹{job.service.price}</div>
                    <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => takeJob(job._id)}>Take Job</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </TabsContent>
        <TabsContent value="completed">
          <section className="bg-white rounded-2xl shadow-lg p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-700"><CheckCircle2 /> Completed Jobs</h2>
            <div className="space-y-4">
              {completedJobs.length === 0 && <p className="text-gray-400">No completed jobs yet.</p>}
              {completedJobs.map(job => (
                <Card key={job._id} className="shadow border border-green-100 rounded-xl hover:shadow-xl transition-all">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="font-semibold text-green-800">{job.service.name}</div>
                    <div className="text-sm text-gray-500">{job.user.name}</div>
                    <div className="font-bold text-green-600">₹{job.service.price}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
      {/* Complete Job Modal */}
      <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
          </DialogHeader>
          <Textarea placeholder="Work description" value={description} onChange={e => setDescription(e.target.value)} />
          <Input placeholder="Extra charge" value={extraCharge} onChange={e => setExtraCharge(e.target.value)} />
          <Button className="mt-2 bg-green-600 hover:bg-green-700 text-white" onClick={completeJob}>Submit</Button>
        </DialogContent>
      </Dialog>
    </div>
  );

  {/* ================= ACTIVE JOBS ================= */ }
  <section className="max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <Wrench /> Active Jobs ({activeJobs.length})
    </h2>

    <div className="grid md:grid-cols-2 gap-6">
      {activeJobs.map(job => (
        <motion.div key={job._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-xl border-l-4 border-indigo-500">
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between">
                <h3 className="font-bold">{job.service.name}</h3>
                <Badge>{job.status}</Badge>
              </div>

              <p className="text-sm text-gray-600">{job.service.category}</p>

              <div className="text-sm flex gap-2"><User /> {job.user.name}</div>
              <div className="text-sm flex gap-2"><Phone /> {job.user.phone}</div>
              <div className="text-sm flex gap-2"><MapPin /> {job.address.address}</div>
              <div className="text-sm font-semibold flex gap-2">
                <IndianRupee /> {job.service.price}
              </div>

              {job.status === "assigned" && (
                <Button onClick={() => startWork(job._id)}>Start Work</Button>
              )}

              {job.status === "in-progress" && (
                <Button onClick={() => setSelectedJob(job)}>Complete Job</Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {activeJobs.length === 0 && (
        <p className="text-gray-500">No active jobs.</p>
      )}
    </div>
  </section>

  {/* ================= AVAILABLE JOBS ================= */ }
  <section className="max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold mb-4">Available Jobs</h2>

    <div className="grid md:grid-cols-2 gap-4">
      {availableJobs.map(job => (
        <Card key={job._id} className="shadow">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <h4 className="font-bold">{job.service.name}</h4>
              <p className="text-sm">{job.address.address}</p>
              <p className="font-semibold">₹{job.service.price}</p>
            </div>
            <Button onClick={() => takeJob(job._id)}>Take Job</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>

  {/* ================= COMPLETED JOBS ================= */ }
  <section className="max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
      <CheckCircle2 /> Completed Jobs
    </h2>

    <div className="grid md:grid-cols-2 gap-4">
      {completedJobs.map(job => (
        <Card key={job._id} className="shadow">
          <CardContent className="p-4 flex justify-between">
            <div>
              <p className="font-semibold">{job.service.name}</p>
              <p className="text-sm text-gray-600">{job.user.name}</p>
            </div>
            <p className="font-bold text-green-600">₹{job.service.price}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  </section>

  {/* ================= COMPLETE MODAL ================= */ }
  <Dialog open={!!selectedJob} onOpenChange={() => setSelectedJob(null)}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Complete Job</DialogTitle>
      </DialogHeader>

      <Textarea
        placeholder="Work description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />

      <Input
        placeholder="Extra charge"
        value={extraCharge}
        onChange={e => setExtraCharge(e.target.value)}
      />

      <Button onClick={completeJob}>Submit</Button>
    </DialogContent>
  </Dialog>
}
