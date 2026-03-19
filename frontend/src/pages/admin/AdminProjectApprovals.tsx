import { useEffect, useState } from "react";
import { PageHeader } from "@/pages/admin";
import { MOCK_CONTRACTORS, MOCK_PROJECTS } from "@/data/mock";
import { Check, X, AlertCircle, Loader, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface PendingProject {
  _id: string;
  title: string;
  description: string;
  budget: number;
  userId: { name: string; email: string };
  location: string;
  createdAt: string;
  approvalStatus: "pending" | "approved" | "rejected";
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AdminProjectApprovals = () => {
  const [projects, setProjects] = useState<PendingProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});

  // Mock users for different user IDs
  const mockUsers: Record<string, { name: string; email: string }> = {
    '1': { name: 'Rajesh Kumar', email: 'rajesh@example.com' },
    '2': { name: 'Priya Sharma', email: 'priya@example.com' },
    '3': { name: 'Arjun Kumar', email: 'arjun@example.com' },
    '5': { name: 'Deepak Iyer', email: 'deepak@example.com' },
    '6': { name: 'Ananya Patel', email: 'ananya@example.com' },
  };

  const token = localStorage.getItem('nexa_auth_token');

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get projects from localStorage (user requests)
      const storedProjects = localStorage.getItem("user_project_requests");
      const userRequests = storedProjects ? JSON.parse(storedProjects) : [];

      console.log("Mock projects:", MOCK_PROJECTS.length);
      console.log("User requests from localStorage:", userRequests.length);
      console.log("User requests data:", userRequests);

      // Combine all projects
      const allProjects = [
        ...MOCK_PROJECTS.map(p => ({
          ...p,
          source: 'mock'
        })),
        ...userRequests.map(p => ({
          ...p,
          source: 'user'
        }))
      ];

      // Filter for pending projects
      const mockPendingProjects: PendingProject[] = allProjects
        .filter(p => !p.contractorId && p.source !== 'approved')
        .map(p => {
          const userId = p.userId?.toString() || '3';
          const userInfo = mockUsers[userId] || { name: p.userName, email: `user${userId}@example.com` };
          
          return {
            _id: p.id,
            title: p.title,
            description: p.description,
            budget: p.budget,
            userId: userInfo,
            location: p.location || "India",
            createdAt: p.startDate || p.createdAt || new Date().toISOString(),
            approvalStatus: "pending" as const,
          };
        });

      console.log("Pending projects to display:", mockPendingProjects);
      setProjects(mockPendingProjects);
    } catch (err: any) {
      console.error("Error fetching projects:", err);
      setError(err.response?.data?.message || "Failed to load pending projects");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (projectId: string) => {
    const project = projects.find(p => p._id === projectId);
    if (!project) return;

    try {
      setApproving(projectId);

      // Pick a random contractor to assign
      const randomContractor = MOCK_CONTRACTORS[Math.floor(Math.random() * MOCK_CONTRACTORS.length)];

      // Get the original project from localStorage or mock
      const storedProjects = localStorage.getItem("user_project_requests");
      const userRequests = storedProjects ? JSON.parse(storedProjects) : [];
      
      const originalProject = userRequests.find(p => p.id === projectId) || 
                             MOCK_PROJECTS.find(p => p.id === projectId);

      if (!originalProject) {
        setError("Project not found");
        return;
      }

      // Create a conversation between user and contractor
      const conversations = localStorage.getItem("conversations") || JSON.stringify([]);
      const conversationsList = JSON.parse(conversations);
      
      const newConversation = {
        id: `conv-${Date.now()}`,
        projectId: projectId,
        userId: originalProject.userId,
        userName: originalProject.userName,
        contractorId: randomContractor.userId,
        contractorName: randomContractor.businessName,
        messages: [],
        createdAt: new Date().toISOString(),
      };

      conversationsList.push(newConversation);
      localStorage.setItem("conversations", JSON.stringify(conversationsList));

      // Update the project with contractor and approval
      const updatedUserRequests = userRequests.map(p => 
        p.id === projectId 
          ? {
              ...p,
              contractorId: randomContractor.id,
              approvalStatus: "approved",
              status: "active",
              conversationId: newConversation.id,
              approvedAt: new Date().toISOString(),
            }
          : p
      );

      localStorage.setItem("user_project_requests", JSON.stringify(updatedUserRequests));

      // Update state to remove from pending
      setProjects(projects.filter(p => p._id !== projectId));
      setApproving(null);
      
      alert(`✅ Project approved and assigned to ${randomContractor.businessName}!\n\nA chat has been created for both the user and contractor to communicate.`);
    } catch (err: any) {
      console.error("Error approving project:", err);
      setError(err.message || "Failed to approve project");
      setApproving(null);
    }
  };

  const handleReject = async (projectId: string) => {
    const reason = rejectionReasons[projectId];
    if (!reason || !reason.trim()) {
      setError("Please provide a rejection reason");
      return;
    }

    try {
      setApproving(projectId);

      // Get the original project from localStorage or mock
      const storedProjects = localStorage.getItem("user_project_requests");
      const userRequests = storedProjects ? JSON.parse(storedProjects) : [];
      
      // Update the project with rejection status
      const updatedUserRequests = userRequests.map(p => 
        p.id === projectId 
          ? {
              ...p,
              approvalStatus: "rejected",
              status: "cancelled",
              rejectionReason: reason,
              rejectedAt: new Date().toISOString(),
            }
          : p
      );

      localStorage.setItem("user_project_requests", JSON.stringify(updatedUserRequests));

      // Update state to remove from pending
      setProjects(projects.filter(p => p._id !== projectId));
      setRejectionReasons(prev => {
        const updated = { ...prev };
        delete updated[projectId];
        return updated;
      });
      setApproving(null);

      alert(`❌ Project rejected.\n\nReason: ${reason}`);
    } catch (err: any) {
      console.error("Error rejecting project:", err);
      setError(err.message || "Failed to reject project");
      setApproving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Project Approvals"
          description="Review and approve user project requests"
        />
        <div className="text-center py-12">
          <Loader className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground mt-2">Loading pending projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Project Approvals"
          description="Review and approve user project requests"
        />
        <Button
          onClick={fetchPendingProjects}
          disabled={loading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-900 font-medium">Error</p>
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <p className="text-lg font-medium text-foreground">All caught up!</p>
          <p className="text-muted-foreground mt-1">No pending project approvals at this time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project._id} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
                {/* Project Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget</p>
                      <p className="font-semibold text-foreground">₹{project.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-semibold text-foreground">{project.location}</p>
                    </div>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-border">
                    <div>
                      <p className="text-muted-foreground text-xs">User</p>
                      <p className="font-medium text-foreground">{project.userId.name}</p>
                      <p className="text-xs text-muted-foreground">{project.userId.email}</p>
                    </div>
                  </div>
                </div>

                {/* Approval Action */}
                <div className="space-y-3">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm font-medium text-green-900 mb-2">✓ Approve Request</p>
                    <p className="text-xs text-green-800 mb-3">
                      Automatically assign a contractor and create a chat channel
                    </p>
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 gap-2"
                      onClick={() => handleApprove(project._id)}
                      disabled={approving === project._id}
                    >
                      <Check className="h-4 w-4" />
                      {approving === project._id ? "Approving..." : "Approve & Assign"}
                    </Button>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-sm font-medium text-red-900 mb-2">✕ Reject Request</p>
                    <textarea
                      placeholder="Enter rejection reason..."
                      value={rejectionReasons[project._id] || ""}
                      onChange={(e) =>
                        setRejectionReasons(prev => ({
                          ...prev,
                          [project._id]: e.target.value,
                        }))
                      }
                      className="w-full text-xs p-2 border border-red-200 rounded mb-2 bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-300"
                      rows={2}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50 gap-2"
                      onClick={() => handleReject(project._id)}
                      disabled={approving === project._id}
                    >
                      <X className="h-4 w-4" />
                      {approving === project._id ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Submitted: {new Date(project.createdAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProjectApprovals;
