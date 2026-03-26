import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { workflowApi, type WorkflowProject } from "@/services/workflowApi";

const FILTERS = ["ALL", "pending", "approved", "in_progress", "completed", "cancelled", "disputed"] as const;

const statusLabel = (status: WorkflowProject["status"] | "ALL") => {
  if (status === "ALL") {
    return "All";
  }

  return status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const UserProjects = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [projects, setProjects] = useState<WorkflowProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        setProjects(await workflowApi.getProjects());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    void loadProjects();
  }, []);

  const filteredProjects = useMemo(
    () => projects.filter((project) => filter === "ALL" || project.status === filter),
    [filter, projects]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">My Projects</h1>
        <p className="text-sm text-muted-foreground">
          Track request approvals, mapped contractors, and your live project conversations.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Button
            key={item}
            variant={filter === item ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(item)}
          >
            {statusLabel(item)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading your projects...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No projects found for this filter.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <div key={project._id} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{statusLabel(project.status)}</p>
                </div>
                <p className="text-sm font-medium text-foreground">{currency(project.budget)}</p>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{project.description}</p>

              <div className="mt-4 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Type:</span> {project.type}</p>
                <p><span className="text-muted-foreground">Location:</span> {project.location}</p>
                <p><span className="text-muted-foreground">Timeline:</span> {project.timeline}</p>
                <p>
                  <span className="text-muted-foreground">Contractor:</span>{" "}
                  {project.contractorId?.company || project.contractorId?.userId?.name || "Waiting for admin mapping"}
                </p>
              </div>

              {project.approvalStatus === "rejected" && project.rejectionReason && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  Rejected: {project.rejectionReason}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                {project.conversationId && (
                  <Button variant="outline" onClick={() => navigate(`/user/chat?conversation=${project.conversationId}`)}>
                    Open Chat
                  </Button>
                )}
                {!project.conversationId && (
                  <Button variant="outline" disabled>
                    Chat opens after approval
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserProjects;
