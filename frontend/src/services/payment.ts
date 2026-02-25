import { apiClient } from './api';
import { Payment, PaymentStatus, PaymentProof, PaymentVerification } from '../types';

// ============================= PAYMENT SERVICE =============================

class PaymentService {
  // ============================= USER PAYMENT METHODS =============================
  
  // Get payment for a project
  async getPaymentByProject(projectId: string): Promise<Payment> {
    try {
      return await apiClient.get(`/payments/project/${projectId}`);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get payment information');
    }
  }

  // Submit payment proof
  async uploadPaymentProof(paymentId: string, proofData: {
    payment_screenshot?: File;
    transaction_id?: string;
    bank_reference?: string;
    notes?: string;
  }): Promise<Payment> {
    try {
      const formData = new FormData();
      
      if (proofData.payment_screenshot) {
        formData.append('payment_screenshot', proofData.payment_screenshot);
      }
      if (proofData.transaction_id) {
        formData.append('transaction_id', proofData.transaction_id);
      }
      if (proofData.bank_reference) {
        formData.append('bank_reference', proofData.bank_reference);
      }
      if (proofData.notes) {
        formData.append('notes', proofData.notes);
      }

      const response = await apiClient.client.post(
        `/payments/${paymentId}/proof`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      
      return response.data.data;
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to upload payment proof');
    }
  }

  // Get user's payment history
  async getUserPayments(userId?: string): Promise<Payment[]> {
    try {
      const url = userId ? `/payments/user/${userId}` : '/payments/my-payments';
      return await apiClient.get(url);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get payment history');
    }
  }

  // ============================= SUPER ADMIN PAYMENT METHODS =============================

  // Get all payments (Super Admin only)
  async getAllPayments(filters?: {
    status?: PaymentStatus;
    page?: number;
    size?: number;
    search?: string;
  }): Promise<{
    items: Payment[];
    total: number;
    page: number;
    size: number;
    pages: number;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.size) params.append('size', filters.size.toString());
      if (filters?.search) params.append('search', filters.search);
      
      return await apiClient.get(`/admin/payments?${params.toString()}`);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get all payments');
    }
  }

  // Get payments pending verification
  async getPaymentsPendingVerification(): Promise<Payment[]> {
    try {
      return await apiClient.get('/admin/payments/pending-verification');
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get pending payments');
    }
  }

  // Verify payment (Super Admin only)
  async verifyPayment(paymentId: string, verification: PaymentVerification): Promise<Payment> {
    try {
      return await apiClient.post(`/admin/payments/${paymentId}/verify`, verification);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to verify payment');
    }
  }

  // Approve payment (Super Admin only)
  async approvePayment(paymentId: string, notes?: string): Promise<Payment> {
    try {
      return await apiClient.post(`/admin/payments/${paymentId}/approve`, { 
        verification_notes: notes 
      });
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to approve payment');
    }
  }

  // Reject payment (Super Admin only)
  async rejectPayment(paymentId: string, reason: string): Promise<Payment> {
    try {
      return await apiClient.post(`/admin/payments/${paymentId}/reject`, { 
        verification_notes: reason 
      });
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to reject payment');
    }
  }

  // Send OTP for payment confirmation (Super Admin only)
  async sendPaymentConfirmationOtp(paymentId: string): Promise<{ message: string }> {
    try {
      return await apiClient.post(`/admin/payments/${paymentId}/send-otp`);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to send OTP');
    }
  }

  // Confirm payment with OTP (Super Admin only)
  async confirmPaymentWithOtp(paymentId: string, otp: string): Promise<Payment> {
    try {
      return await apiClient.post(`/admin/payments/${paymentId}/confirm-otp`, { otp });
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to confirm payment with OTP');
    }
  }

  // ============================= PAYMENT ANALYTICS =============================

  // Get payment analytics (Super Admin only)
  async getPaymentAnalytics(period?: '7d' | '30d' | '90d' | '1y'): Promise<{
    total_revenue: number;
    pending_amount: number;
    confirmed_amount: number;
    rejected_amount: number;
    status_breakdown: Record<PaymentStatus, number>;
    monthly_trend: Array<{ month: string; amount: number }>;
  }> {
    try {
      const params = period ? `?period=${period}` : '';
      return await apiClient.get(`/admin/analytics/payments${params}`);
    } catch (error: unknown) {
      throw new Error(error.response?.data?.detail || 'Failed to get payment analytics');
    }
  }

  // ============================= UTILITY METHODS =============================

  // Check if payment can be processed for project assignment
  isPaymentConfirmedForAssignment(payment: Payment): boolean {
    return payment.payment_status === 'ADVANCE_CONFIRMED';
  }

  // Get payment status color
  getPaymentStatusColor(status: PaymentStatus): string {
    switch (status) {
      case 'INITIATED':
        return 'text-gray-600';
      case 'PROOF_UPLOADED':
        return 'text-blue-600';
      case 'UNDER_VERIFICATION':
        return 'text-yellow-600';
      case 'ADVANCE_CONFIRMED':
        return 'text-green-600';
      case 'REJECTED':
        return 'text-red-600';
      case 'REFUNDED':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  }

  // Get payment status badge variant
  getPaymentStatusVariant(status: PaymentStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'ADVANCE_CONFIRMED':
        return 'default';
      case 'UNDER_VERIFICATION':
        return 'secondary';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'outline';
    }
  }

  // Calculate payment progress
  calculatePaymentProgress(payment: Payment): number {
    const statusOrder: PaymentStatus[] = [
      'INITIATED',
      'PROOF_UPLOADED', 
      'UNDER_VERIFICATION',
      'ADVANCE_CONFIRMED'
    ];
    
    const currentIndex = statusOrder.indexOf(payment.payment_status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  }

  // Format payment amount
  formatPaymentAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // Validate payment proof
  validatePaymentProof(proof: Partial<PaymentProof>): string[] {
    const errors: string[] = [];
    
    if (!proof.transaction_id && !proof.bank_reference) {
      errors.push('Either transaction ID or bank reference is required');
    }
    
    if (proof.transaction_id && proof.transaction_id.length < 5) {
      errors.push('Transaction ID must be at least 5 characters');
    }
    
    return errors;
  }

  // Check if user can upload payment proof
  canUploadPaymentProof(payment: Payment): boolean {
    return ['INITIATED', 'REJECTED'].includes(payment.payment_status);
  }

  // Check if Super Admin can verify payment
  canVerifyPayment(payment: Payment): boolean {
    return ['PROOF_UPLOADED', 'UNDER_VERIFICATION'].includes(payment.payment_status);
  }

  // Get next required action for payment
  getNextAction(payment: Payment, userRole: 'USER' | 'SUPER_ADMIN'): string {
    if (userRole === 'USER') {
      switch (payment.payment_status) {
        case 'INITIATED':
          return 'Upload payment proof';
        case 'PROOF_UPLOADED':
          return 'Waiting for verification';
        case 'UNDER_VERIFICATION':
          return 'Payment under review';
        case 'REJECTED':
          return 'Resubmit payment proof';
        case 'ADVANCE_CONFIRMED':
          return 'Payment confirmed';
        default:
          return 'Contact support';
      }
    } else {
      switch (payment.payment_status) {
        case 'PROOF_UPLOADED':
          return 'Review payment proof';
        case 'UNDER_VERIFICATION':
          return 'Complete verification';
        case 'ADVANCE_CONFIRMED':
          return 'Payment verified';
        default:
          return 'Monitor payment';
      }
    }
  }
}

// Create singleton instance
export const paymentService = new PaymentService();
