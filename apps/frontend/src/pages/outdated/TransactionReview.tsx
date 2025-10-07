import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography,
  Button,
  Stack,
  TextField,
  Breadcrumbs,
  Link,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";

interface Transaction {
  id: string;
  vendor: string;
  invoiceNumber: string;
  receiptNumber?: string;
  date: string;
  period: string;
  amount: number;
  paymentMethod: string;
  source: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'processed';
}

interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: number;
  validated: boolean;
  corrected: boolean;
}

const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    vendor: 'Anthropic, PBC (Claude AI)',
    invoiceNumber: 'UU2RMADE-0002',
    receiptNumber: '2869-4573-4270',
    date: '10 Aug 2025',
    period: 'Aug 10 to Sept 10',
    amount: 100.00,
    paymentMethod: 'Visa ending 6040',
    source: 'Outlook Email',
    reason: 'Forwarded to QuickBooks; includes Stripe invoice/receipt attachments. Needs to be recorded as an expense.',
    status: 'pending'
  },
  {
    id: 'txn-002',
    vendor: 'Wellfound (formerly AngelList Talent)',
    invoiceNumber: 'X9C0REFK-0002',
    receiptNumber: '2506-9697',
    date: '11 Jul 2025',
    period: 'Jul 11 – Aug 11, 2025',
    amount: 350.00,
    paymentMethod: 'Visa 6040',
    source: 'Outlook Email',
    reason: 'Contains invoice and receipt PDFs; should be uploaded to QuickBooks as a subscription expense.',
    status: 'pending'
  }
];

export default function TransactionReview() {
  const navigate = useNavigate();
  const { transactionId } = useParams<{ transactionId: string }>();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Find transaction
    const foundTransaction = mockTransactions.find(t => t.id === transactionId);
    const transactionIndex = mockTransactions.findIndex(t => t.id === transactionId);

    if (foundTransaction) {
      setTransaction(foundTransaction);
      setTransactions(mockTransactions);
      setCurrentIndex(transactionIndex);
      
      // Load extracted data - using first transaction data for demonstration
      if (transactionId === 'txn-001') {
        const extractedFields: ExtractedField[] = [
          {
            id: 'vendor',
            label: 'Vendor',
            value: foundTransaction.vendor,
            confidence: 0.98,
            validated: true,
            corrected: false,
          },
          {
            id: 'invoiceNumber',
            label: 'Invoice Number',
            value: foundTransaction.invoiceNumber,
            confidence: 0.95,
            validated: true,
            corrected: false,
          },
          {
            id: 'amount',
            label: 'Amount',
            value: foundTransaction.amount.toFixed(2),
            confidence: 0.99,
            validated: true,
            corrected: false,
          },
          {
            id: 'date',
            label: 'Date',
            value: foundTransaction.date,
            confidence: 0.97,
            validated: true,
            corrected: false,
          },
          {
            id: 'paymentMethod',
            label: 'Payment Method',
            value: foundTransaction.paymentMethod,
            confidence: 0.93,
            validated: true,
            corrected: false,
          },
        ];
        setFields(extractedFields);
      }
    }
  }, [transactionId]);

  if (!transaction) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Transaction not found</Typography>
      </Box>
    );
  }

  const handleFieldChange = (fieldId: string, value: string) => {
    setFields(prevFields =>
      prevFields.map(field =>
        field.id === fieldId
          ? { ...field, value, corrected: true, validated: true }
          : field
      )
    );
  };

  const handleApprove = async () => {
    setUploading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Update transaction status
    setTransaction({ ...transaction, status: 'processed' });
    
    // Go to next transaction
    if (currentIndex < transactions.length - 1) {
      const nextTransaction = transactions[currentIndex + 1];
      navigate(`/transactions/${nextTransaction.id}`);
    } else {
      navigate(`/transactions`);
    }
    setUploading(false);
  };

  const handleReject = async () => {
    if (rejectReason) {
      setUploading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update transaction status
      setTransaction({ ...transaction, status: 'pending' });
      setRejectDialog(false);
      setRejectReason("");
      
      // Go back to transactions page
      navigate(`/transactions`);
      setUploading(false);
    }
  };

  const navigateToTransaction = (index: number) => {
    if (index >= 0 && index < transactions.length) {
      const txn = transactions[index];
      navigate(`/transactions/${txn.id}`);
    }
  };

  const allFieldsValidated = fields.every(field => field.validated);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
        <Breadcrumbs sx={{ mb: 1 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/")}
            underline="hover"
            color="inherit"
          >
            Home
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate(`/transactions`)}
            underline="hover"
            color="inherit"
          >
            Transactions
          </Link>
          <Typography color="text.primary" variant="body2">
            {transaction.vendor}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={() => navigate(`/transactions`)}>
              <BackIcon />
            </IconButton>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {transaction.vendor} - Review
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Transaction {currentIndex + 1} of {transactions.length}
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<PrevIcon />}
              onClick={() => navigateToTransaction(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            <Button
              size="small"
              endIcon={<NextIcon />}
              onClick={() => navigateToTransaction(currentIndex + 1)}
              disabled={currentIndex === transactions.length - 1}
            >
              Next
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: Document Viewer */}
        <Box sx={{ width: "50%", p: 2, overflow: "auto" }}>
          <Paper sx={{ height: "100%", bgcolor: "grey.100", p: 2, position: "relative" }}>
            <Box sx={{ position: "relative", height: "100%" }}>
              <iframe
                src="/Rippling sample invoice.pdf"
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="Invoice Preview"
              />
            </Box>
          </Paper>
        </Box>

        {/* Right: Extracted Fields */}
        <Box sx={{ width: "50%", p: 2, overflow: "auto", borderLeft: 1, borderColor: "divider" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Extracted Transaction Fields
          </Typography>

          {fields.length === 0 ? (
            <Alert severity="info">
              No fields extracted from this transaction yet.
            </Alert>
          ) : (
            <Stack spacing={2}>
              {fields.map((field) => (
                <Box
                  key={field.id}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: field.confidence < 0.92 ? "warning.main" : "divider",
                    borderRadius: 1,
                    bgcolor: field.confidence < 0.92 ? "warning.light" : "background.paper",
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {field.label}
                    </Typography>
                    <Chip
                      label={`${(field.confidence * 100).toFixed(0)}%`}
                      size="small"
                      color={field.confidence > 0.95 ? "success" : field.confidence > 0.90 ? "warning" : "error"}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    variant="standard"
                    value={field.value || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    sx={{
                      "& .MuiInput-underline:before": {
                        borderBottom: field.corrected ? "2px solid" : "1px solid",
                        borderColor: field.corrected ? "primary.main" : "divider",
                      },
                    }}
                  />
                  {field.corrected && (
                    <Typography variant="caption" color="primary.main" sx={{ mt: 0.5 }}>
                      Value corrected
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          )}

          {/* Transaction Summary */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Transaction Summary
            </Typography>
            <Box sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Invoice #:</Typography>
                  <Typography variant="body2">{transaction.invoiceNumber}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Period:</Typography>
                  <Typography variant="body2">{transaction.period}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Source:</Typography>
                  <Typography variant="body2">{transaction.source}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Chip 
                    label={transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                    size="small"
                    color={transaction.status === 'processed' ? 'success' : 'warning'}
                  />
                </Box>
              </Stack>
            </Box>
          </Box>

          {/* Validation Status */}
          {fields.length > 0 && (
            <Alert 
              severity={allFieldsValidated ? "success" : "warning"} 
              sx={{ mt: 3 }}
            >
              {allFieldsValidated
                ? "All fields validated - ready to approve"
                : "Some fields need validation"
              }
            </Alert>
          )}
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
        {uploading && <LinearProgress sx={{ mb: 2 }} />}
        
        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="outlined"
            color="error"
            startIcon={<RejectIcon />}
            onClick={() => setRejectDialog(true)}
            disabled={uploading}
          >
            Reject Transaction
          </Button>
          
          <Button
            variant="contained"
            color="success"
            startIcon={<ApproveIcon />}
            endIcon={currentIndex < transactions.length - 1 ? <NextIcon /> : null}
            onClick={handleApprove}
            disabled={uploading || !allFieldsValidated}
          >
            {currentIndex < transactions.length - 1 ? "Approve & Next" : "Approve"}
          </Button>
        </Stack>
      </Box>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)}>
        <DialogTitle>Reject Transaction</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Please provide a reason for rejecting this transaction.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="e.g., Incorrect amount, missing information, duplicate entry..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleReject} 
            color="error" 
            variant="contained"
            disabled={!rejectReason}
          >
            Reject Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}