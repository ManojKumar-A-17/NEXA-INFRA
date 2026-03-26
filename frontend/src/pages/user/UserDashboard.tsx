import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FolderKanban, MessageSquare, Wallet } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { workflowApi, type WorkflowProject } from "@/services/workflowApi";

const UserDashboard = () => {
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
    const activeProjects = projects.filter((project) => ["approved", "in_progress"].includes(project.status)).length;
    const pendingProjects = projects.filter((project) => project.approvalStatus === "pending").length;
    const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
    const openChats = projects.filter((project) => Boolean(project.conversationId)).length;

    return { activeProjects, pendingProjects, totalBudget, openChats };
  }, [projects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Client Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ""}. Manage requests, approvals, and contractor chats.
          </p>
        </div>
        <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => navigate("/user/request-contractor")}>
          Request Contractor
        </Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Active Projects" value={metrics.activeProjects} icon={FolderKanban} />
        <MetricCard title="Pending Approval" value={metrics.pendingProjects} icon={Clock} />
        <MetricCard title="Open Chats" value={metrics.openChats} icon={MessageSquare} />
        <MetricCard title="Requested Budget" value={new Intl.NumberFormat("en-IN").format(metrics.totalBudget)} icon={Wallet} />
      </div>

      <div className="rounded-lg border border-border bg-card p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold text-foreground">Recent Projects</h2>
          <Button variant="outline" size="sm" onClick={() => navigate("/user/projects")}>
            View All
          </Button>
        </div>
        <div className="mt-4 space-y-3">
          {projects.slice(0, 3).map((project) => (
            <div key={project._id} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{project.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {project.contractorId?.company || "Waiting for contractor mapping"}
                  </p>
                </div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{project.status.replace("_", " ")}</p>
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-sm text-muted-foreground">No projects yet. Submit your first request.</p>}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
