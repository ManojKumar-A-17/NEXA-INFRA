import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, FolderKanban, MessageSquare, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { workflowApi, type WorkflowProject } from "@/services/workflowApi";

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<WorkflowProject[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjects(await workflowApi.getProjects());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      }
    };

    void loadProjects();
  }, []);

  const metrics = useMemo(() => {
    const activeProjects = projects.filter((project) => project.status === "in_progress").length;
    const approvedProjects = projects.filter((project) => project.status === "approved").length;
    const completedProjects = projects.filter((project) => project.status === "completed").length;
    const activeChats = projects.filter((project) => Boolean(project.conversationId)).length;

    return { activeProjects, approvedProjects, completedProjects, activeChats };
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Contractor Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ""}. Review assigned work and stay in touch with clients.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/contractor/projects")}>
          View Projects
        </Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Ready To Start" value={metrics.approvedProjects} icon={FolderKanban} />
        <MetricCard title="In Progress" value={metrics.activeProjects} icon={TrendingUp} />
        <MetricCard title="Completed" value={metrics.completedProjects} icon={CheckCircle} />
        <MetricCard title="Client Chats" value={metrics.activeChats} icon={MessageSquare} />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Assigned Work</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/contractor/chat")}>
            Open Messages
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {projects.slice(0, 4).map((project) => (
            <div key={project._id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{project.title}</p>
                  <p className="text-sm text-muted-foreground">{project.userId.name}</p>
                </div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{project.status.replace("_", " ")}</p>
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects have been assigned yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default ContractorDashboard;
