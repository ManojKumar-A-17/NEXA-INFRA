import { Star, MapPin, CheckCircle, Clock, Briefcase, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Contractor } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

const AVATAR_COLORS = [
  "bg-primary", "bg-secondary", "bg-info", "bg-success", "bg-warning",
];

interface ContractorCardProps {
  contractor: Contractor;
}

export const ContractorCard = ({ contractor }: ContractorCardProps) => {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    startDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorClass = AVATAR_COLORS[parseInt(contractor.id) % AVATAR_COLORS.length];
  const initials = contractor.businessName.split(' ').map(w => w[0]).join('').slice(0, 2);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please login to request a project");
      return;
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.budget) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create a new project request
      const storedProjects = localStorage.getItem("user_project_requests");
      const projectRequests = storedProjects ? JSON.parse(storedProjects) : [];
      
      const newProjectId = Date.now().toString();
      const newProject = {
        id: newProjectId,
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        location: contractor.location,
        userId: user?.id || "1",
        userName: user?.name || user?.email || "User",
        status: "pending",
        approvalStatus: "pending",
        startDate: formData.startDate || new Date().toISOString(),
        contractorId: null,
        createdAt: new Date().toISOString(),
        reviews: [],
      };

      // Save to localStorage
      projectRequests.push(newProject);
      localStorage.setItem("user_project_requests", JSON.stringify(projectRequests));

      setIsModalOpen(false);
      setFormData({ title: "", description: "", budget: "", startDate: "" });
      alert("✅ Project request submitted successfully! Admin will review it soon.");
    } catch (err: any) {
      setError(err.message || "Failed to submit project request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to={`/contractor/${contractor.id}`} className="group block">
        <div className="rounded-lg border border-border bg-card p-5 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
          <div className="flex items-start gap-4">
            <div className={`${colorClass} flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-primary-foreground`}>
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-semibold text-foreground truncate">
                  {contractor.businessName}
                </h3>
                {contractor.verified && (
                  <CheckCircle className="h-4 w-4 shrink-0 text-success" />
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {contractor.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {contractor.yearsExperience}y exp
                </span>
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{contractor.bio}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {contractor.specialties.slice(0, 3).map(s => (
              <span key={s} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {s}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(contractor.rating) ? 'fill-warning text-warning' : 'text-muted'}`} />
                ))}
              </div>
              <span className="text-sm font-medium">{contractor.rating}</span>
              <span className="text-xs text-muted-foreground">({contractor.reviewCount})</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {contractor.completedProjects} projects
            </span>
          </div>
        </div>
      </Link>

      {/* Request Project Button */}
      <Button 
        onClick={handleOpenModal}
        className="mt-3 w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
      >
        <Briefcase className="mr-2 h-4 w-4" />
        Request Project
      </Button>

      {/* Request Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-w-md w-full mx-4 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Request Project</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Project Title *</label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Building renovation"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project in detail..."
                  rows={4}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Budget (₹) *</label>
                  <Input
                    name="budget"
                    type="number"
                    value={formData.budget}
                    onChange={handleInputChange}
                    placeholder="100000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <Input
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/90 disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
