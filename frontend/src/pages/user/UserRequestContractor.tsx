import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { workflowApi } from "@/services/workflowApi";

const UserRequestContractor = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [projectType, setProjectType] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    estimatedDuration: "",
    location: "",
    timeline: "",
    requirements: "",
    notes: "",
  });
  const preferredContractorId = searchParams.get("contractorId");
  const preferredContractorName = searchParams.get("contractorName");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const preferredContractorNote = preferredContractorName
        ? `Preferred contractor from browse flow: ${preferredContractorName}${preferredContractorId ? ` (${preferredContractorId})` : ""}`
        : "";
      const submittedNotes = [form.notes.trim(), preferredContractorNote].filter(Boolean).join("\n\n");

      await workflowApi.createProject({
        title: form.title.trim(),
        description: form.description.trim(),
        type: projectType,
        budget: Number(form.budget),
        estimatedDuration: Number(form.estimatedDuration),
        location: form.location.trim(),
        timeline: form.timeline.trim(),
        requirements: form.requirements
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        notes: submittedNotes || undefined,
      });

      toast({
        title: "Request submitted",
        description: "Your project is waiting for admin approval and contractor mapping.",
      });
      navigate("/user/projects");
    } catch (err) {
      toast({
        title: "Unable to submit request",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Request A Contractor</h1>
        <p className="text-sm text-muted-foreground">
          Share your project details and the admin will review and map the right contractor.
        </p>
      </div>

      {preferredContractorName && (
        <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-4 text-sm">
          <p className="font-medium text-foreground">Preferred contractor</p>
          <p className="text-muted-foreground">
            {preferredContractorName} will be included in the request notes for admin review.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-lg border border-border bg-card p-6 shadow-card">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-secondary" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Project Details</h2>
        </div>

        <div className="space-y-1.5">
          <Label>Project Title</Label>
          <Input
            placeholder="e.g., Full house interior renovation"
            required
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Project Type</Label>
          <Select value={projectType} onValueChange={setProjectType}>
            <SelectTrigger>
              <SelectValue placeholder="Select project type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="remodeling">Remodeling</SelectItem>
              <SelectItem value="plumbing">Plumbing</SelectItem>
              <SelectItem value="electrical">Electrical</SelectItem>
              <SelectItem value="roofing">Roofing</SelectItem>
              <SelectItem value="landscaping">Landscaping</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            placeholder="Describe the work, current site condition, and what outcome you want."
            rows={4}
            required
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Budget (INR)</Label>
            <Input
              type="number"
              min="1"
              placeholder="e.g., 350000"
              required
              value={form.budget}
              onChange={(event) => setForm((current) => ({ ...current, budget: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Estimated Duration (days)</Label>
            <Input
              type="number"
              min="1"
              placeholder="e.g., 45"
              required
              value={form.estimatedDuration}
              onChange={(event) => setForm((current) => ({ ...current, estimatedDuration: event.target.value }))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Location</Label>
            <Input
              placeholder="e.g., Chennai, Tamil Nadu"
              required
              value={form.location}
              onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Preferred Timeline</Label>
            <Input
              placeholder="e.g., Start next month and finish in 8 weeks"
              required
              value={form.timeline}
              onChange={(event) => setForm((current) => ({ ...current, timeline: event.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Requirements</Label>
          <Textarea
            placeholder="Write one requirement per line."
            rows={4}
            value={form.requirements}
            onChange={(event) => setForm((current) => ({ ...current, requirements: event.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Additional Notes</Label>
          <Textarea
            placeholder="Any access restrictions, preferred brands, or important site notes..."
            rows={3}
            value={form.notes}
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            disabled={submitting || !projectType}
          >
            {submitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserRequestContractor;
