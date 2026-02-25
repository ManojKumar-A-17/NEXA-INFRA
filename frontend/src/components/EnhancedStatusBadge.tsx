import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ProjectStatus, PaymentStatus, ContractorStatus, ReviewStatus, DisputeStatus } from "@/types";

// ============================= STATUS BADGE VARIANTS =============================

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 border",
  {
    variants: {
      variant: {
        // Project Statuses
        REQUESTED: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        PAYMENT_PENDING: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        ADVANCE_CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
        CONTRACTOR_ASSIGNED: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
        IN_PROGRESS: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
        COMPLETED: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        REVIEW_PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        CLOSED: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
        DISPUTED: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        
        // Payment Statuses
        INITIATED: "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100",
        PROOF_UPLOADED: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        UNDER_VERIFICATION: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
        REJECTED: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        REFUNDED: "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100",
        
        // Contractor Statuses
        PENDING: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
        ACTIVE: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        SUSPENDED: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        
        // Review Statuses
        APPROVED: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        FLAGGED: "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
        
        // Dispute Statuses
        OPEN: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        UNDER_REVIEW: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        RESOLVED: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        
        // Generic Statuses
        success: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        warning: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        error: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        info: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
        default: "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

// ============================= STATUS LABELS =============================

const STATUS_LABELS: Record<string, string> = {
  // Project Status Labels
  REQUESTED: "Requested",
  PAYMENT_PENDING: "Payment Pending",
  ADVANCE_CONFIRMED: "Payment Confirmed",
  CONTRACTOR_ASSIGNED: "Contractor Assigned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REVIEW_PENDING: "Review Pending",
  CLOSED: "Closed",
  DISPUTED: "Disputed",
  
  // Payment Status Labels
  INITIATED: "Initiated",
  PROOF_UPLOADED: "Proof Uploaded",
  UNDER_VERIFICATION: "Under Verification",
  ADVANCE_CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
  REFUNDED: "Refunded",
  
  // Contractor Status Labels
  PENDING: "Pending Approval",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  
  // Review Status Labels
  APPROVED: "Approved",
  FLAGGED: "Flagged",
  
  // Dispute Status Labels
  OPEN: "Open",
  UNDER_REVIEW: "Under Review",
  RESOLVED: "Resolved",
  
  // Generic Labels
  success: "Success",
  warning: "Warning",
  error: "Error",
  info: "Info",
  default: "Default",
};

// ============================= STATUS ICONS =============================

const STATUS_ICONS: Record<string, string> = {
  // Project Status Icons
  REQUESTED: "📝",
  PAYMENT_PENDING: "💳",
  ADVANCE_CONFIRMED: "✅",
  CONTRACTOR_ASSIGNED: "👷",
  IN_PROGRESS: "🚧",
  COMPLETED: "🏆",
  REVIEW_PENDING: "⭐",
  CLOSED: "📋",
  DISPUTED: "⚠️",
  
  // Payment Status Icons
  INITIATED: "💰",
  PROOF_UPLOADED: "📄",
  UNDER_VERIFICATION: "⏳",
  REJECTED: "❌",
  REFUNDED: "💸",
  
  // Contractor Status Icons
  PENDING: "⏱️",
  ACTIVE: "✅",
  SUSPENDED: "🚫",
  
  // Review Status Icons
  APPROVED: "✅",
  FLAGGED: "🚩",
  
  // Dispute Status Icons
  OPEN: "🔴",
  UNDER_REVIEW: "🔍",
  RESOLVED: "✅",
};

// ============================= COMPONENT PROPS =============================

type StatusType = ProjectStatus | PaymentStatus | ContractorStatus | ReviewStatus | DisputeStatus | 
  'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  status: StatusType;
  className?: string;
  label?: string;
  showIcon?: boolean;
  animate?: boolean;
}

// ============================= COMPONENT =============================

export const StatusBadge = ({ 
  status, 
  className, 
  label, 
  showIcon = false, 
  animate = false,
  size = "md"
}: StatusBadgeProps) => {
  const displayLabel = label || STATUS_LABELS[status] || status;
  const icon = showIcon ? STATUS_ICONS[status] : null;
  
  return (
    <span 
      className={cn(
        statusBadgeVariants({ variant: status as keyof typeof statusBadgeVariants.variants.variant, size }), 
        animate && "animate-pulse",
        className
      )}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {displayLabel}
    </span>
  );
};

// ============================= UTILITY FUNCTIONS =============================

// Get status priority for sorting
export const getStatusPriority = (status: StatusType): number => {
  const priorities: Record<string, number> = {
    // Project priorities (workflow order)
    REQUESTED: 1,
    PAYMENT_PENDING: 2,
    ADVANCE_CONFIRMED: 3,
    CONTRACTOR_ASSIGNED: 4,
    IN_PROGRESS: 5,
    COMPLETED: 6,
    REVIEW_PENDING: 7,
    CLOSED: 8,
    DISPUTED: 10, // High priority for disputes
    
    // Payment priorities
    INITIATED: 1,
    PROOF_UPLOADED: 2,
    UNDER_VERIFICATION: 3,
    ADVANCE_CONFIRMED: 4,
    REJECTED: 9,
    REFUNDED: 8,
    
    // Default
    default: 0,
  };
  
  return priorities[status] || 0;
};

// Check if status indicates completion
export const isCompleteStatus = (status: StatusType): boolean => {
  return ['COMPLETED', 'CLOSED', 'RESOLVED', 'ADVANCE_CONFIRMED', 'APPROVED'].includes(status);
};

// Check if status indicates an error state
export const isErrorStatus = (status: StatusType): boolean => {
  return ['REJECTED', 'DISPUTED', 'SUSPENDED', 'FLAGGED', 'error'].includes(status);
};

// Check if status indicates a pending state
export const isPendingStatus = (status: StatusType): boolean => {
  return ['PENDING', 'PAYMENT_PENDING', 'REVIEW_PENDING', 'UNDER_VERIFICATION', 'UNDER_REVIEW'].includes(status);
};

// Get status color class for custom styling
export const getStatusColorClass = (status: StatusType): string => {
  if (isCompleteStatus(status)) return 'text-green-600';
  if (isErrorStatus(status)) return 'text-red-600';
  if (isPendingStatus(status)) return 'text-yellow-600';
  return 'text-blue-600';
};