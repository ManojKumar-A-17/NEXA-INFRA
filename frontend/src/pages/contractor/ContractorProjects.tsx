import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { workflowApi, type WorkflowProject } from "@/services/workflowApi";

const FILTERS = ["ALL", "approved", "in_progress", "completed"] as const;

const label = (status: WorkflowProject["status"] | "ALL") => {
  if (status === "ALL") {
    return "All";
  }

  return status.replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const ContractorProjects = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [projects, setProjects] = useState<WorkflowProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      setProjects(await workflowApi.getProjects());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load assigned projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProjects();
  }, []);

  const filteredProjects = useMemo(
    () => projects.filter((project) => filter === "ALL" || project.status === filter),
    [filter, projects]
  );

  const updateStatus = async (projectId: string, status: WorkflowProject["status"]) => {
    try {
      setUpdatingId(projectId);
      const updated = await workflowApi.updateProjectStatus(projectId, status);
      setProjects((current) => current.map((project) => (project._id === projectId ? updated : project)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Assigned Projects</h1>
        <p className="text-sm text-muted-foreground">
          Review mapped client work, update status, and jump into project conversations.
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
            {label(item)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground">
          Loading assigned projects...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No assigned projects found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProjects.map((project) => (
            <div key={project._id} className="rounded-lg border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{label(project.status)}</p>
                </div>
                <p className="text-sm text-muted-foreground">{project.userId.name}</p>
              </div>

              <p className="mt-3 text-sm text-muted-foreground">{project.description}</p>

              <div className="mt-4 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Location:</span> {project.location}</p>
                <p><span className="text-muted-foreground">Duration:</span> {project.estimatedDuration} days</p>
                <p><span className="text-muted-foreground">Timeline:</span> {project.timeline}</p>
                <p><span className="text-muted-foreground">Progress:</span> {project.progress}%</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.status === "approved" && (
                  <Button disabled={updatingId === project._id} onClick={() => void updateStatus(project._id, "in_progress")}>
                    Start Project
                  </Button>
                )}
                {project.status === "in_progress" && (
                  <Button disabled={updatingId === project._id} onClick={() => void updateStatus(project._id, "completed")}>
                    Mark Completed
                  </Button>
                )}
                {project.conversationId && (
                  <Button variant="outline" onClick={() => navigate(`/contractor/chat?conversation=${project.conversationId}`)}>
                    Open Chat
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

export default ContractorProjects;
