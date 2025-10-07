import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Chip,
  Button,
  IconButton,
  Alert,
  Stack,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Visibility as ViewIcon,
  Email as EmailIcon,
  CheckCircle as CheckIcon,
  AccountBalanceWallet as WalletIcon,
  CreditCard as CardIcon,
  Description as DocumentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

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
  },
  {
    id: 'txn-003',
    vendor: 'Wellfound (AngelList) refund',
    invoiceNumber: 'X9C0REFK-0001',
    receiptNumber: '3765-8377',
    date: '14 Jul 2025',
    period: 'Credit issued for earlier Promoted Job Plan',
    amount: -350.00,
    paymentMethod: 'Credit (refund)',
    source: 'Outlook Email',
    reason: 'Shows the plan was refunded; important to offset the original invoice amount in QuickBooks.',
    status: 'pending'
  },
  {
    id: 'txn-004',
    vendor: 'Wellfound (AngelList) – earlier payment',
    invoiceNumber: 'X9C0REFK-0001',
    receiptNumber: '2982-7333',
    date: '11 Jul 2025',
    period: 'Same plan as the refunded one',
    amount: 350.00,
    paymentMethod: 'Visa 6040',
    source: 'Outlook Email',
    reason: 'This is the initial payment for the plan later refunded. Recording both the payment and the refund ensures the net effect is zero.',
    status: 'reviewed'
  },
  {
    id: 'txn-005',
    vendor: 'Cognition AI Inc.',
    invoiceNumber: 'QUVOOZK7-0001',
    receiptNumber: '2627-0485',
    date: '25 Jun 2025',
    period: 'ACUs Package',
    amount: 20.00,
    paymentMethod: 'Link digital wallet',
    source: 'Outlook Email',
    reason: 'Contains Stripe invoice and receipt attachments; should be entered as a software usage expense in QuickBooks.',
    status: 'processed'
  },
  {
    id: 'txn-006',
    vendor: 'GitHub (Team Plan)',
    invoiceNumber: 'ch_3RwprzJFr6CCHwIi1gyokz4s',
    receiptNumber: '',
    date: '16 Aug 2025',
    period: 'Aug 4 – Sep 3, 2025',
    amount: 20.00,
    paymentMethod: 'Visa ending 6167',
    source: 'Outlook Email',
    reason: 'Receipt email shows monthly subscription and payment details; no attachment but should be recorded as a SaaS expense.',
    status: 'pending'
  },
  {
    id: 'txn-007',
    vendor: 'Microsoft',
    invoiceNumber: 'G105572066',
    receiptNumber: '',
    date: '06 Aug 2025',
    period: 'Billing period 6 Aug 2025',
    amount: 177.00,
    paymentMethod: 'Due Aug 7, 2025',
    source: 'Outlook Email',
    reason: 'Contains invoice numbers, amounts, and due dates; represents accounts payable that should be recorded in QuickBooks.',
    status: 'pending'
  },
  {
    id: 'txn-008',
    vendor: 'Microsoft',
    invoiceNumber: 'G104988881',
    receiptNumber: '',
    date: '01 Jul 2025',
    period: '1 Jul–31 Jul 2025',
    amount: 61.72,
    paymentMethod: 'Due Aug 5, 2025',
    source: 'Outlook Email',
    reason: 'Contains invoice numbers, amounts, and due dates; represents accounts payable that should be recorded in QuickBooks.',
    status: 'pending'
  }
];

const statusColors = {
  pending: 'warning',
  reviewed: 'info', 
  processed: 'success'
} as const;

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions] = useState<Transaction[]>(mockTransactions);

  const getStatusChip = (status: Transaction['status']) => {
    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={statusColors[status]}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };

  const formatCurrency = (amount: number) => {
    const formatted = Math.abs(amount).toFixed(2);
    return amount < 0 ? `-$${formatted}` : `$${formatted}`;
  };

  const getPaymentIcon = (paymentMethod: string) => {
    if (paymentMethod.toLowerCase().includes('visa') || paymentMethod.toLowerCase().includes('card')) {
      return <CardIcon fontSize="small" />;
    } else if (paymentMethod.toLowerCase().includes('wallet') || paymentMethod.toLowerCase().includes('link')) {
      return <WalletIcon fontSize="small" />;
    }
    return null;
  };

  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const reviewedCount = transactions.filter(t => t.status === 'reviewed').length;
  const processedCount = transactions.filter(t => t.status === 'processed').length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate("/")}
          underline="hover"
          color="inherit"
        >
          Home
        </Link>
        <Typography color="text.primary" variant="body2">
          Transactions
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/")}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              Email Transactions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transactions extracted from Outlook emails
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<EmailIcon />}
            onClick={() => {/* Handle sync emails */}}
          >
            Sync Emails
          </Button>
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => {/* Handle process all */}}
          >
            Process All
          </Button>
        </Stack>
      </Box>

      {/* Pending Transactions Alert */}
      {pendingCount > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2">
            {pendingCount} transaction{pendingCount !== 1 ? 's' : ''} pending review and processing to QuickBooks.
          </Typography>
        </Alert>
      )}

      {/* Transaction Summary */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Total Transactions
            </Typography>
            <Typography variant="h6">
              {transactions.length}
            </Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Pending Review
            </Typography>
            <Typography variant="h6" color="warning.main">
              {pendingCount}
            </Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Total Amount
            </Typography>
            <Typography variant="h6" color={totalAmount < 0 ? "error.main" : "success.main"}>
              {formatCurrency(totalAmount)}
            </Typography>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              Processed
            </Typography>
            <Typography variant="h6" color="success.main">
              {processedCount}
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* Transactions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendor</TableCell>
              <TableCell>Invoice / Receipt</TableCell>
              <TableCell>Date & Period</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Log</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow
                key={transaction.id}
                sx={{ 
                  "&:hover": { bgcolor: "action.hover" }
                }}
              >
                <TableCell>
                  <Typography variant="subtitle2">{transaction.vendor}</Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {transaction.invoiceNumber}
                    </Typography>
                    {transaction.receiptNumber && (
                      <Typography variant="caption" color="text.secondary">
                        Receipt: {transaction.receiptNumber}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {transaction.date}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transaction.period}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    color={transaction.amount < 0 ? "error.main" : "success.main"}
                  >
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {getPaymentIcon(transaction.paymentMethod)}
                    <Typography variant="body2">
                      {transaction.paymentMethod}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={<EmailIcon />}
                    label={transaction.source}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.7rem" }}
                  />
                </TableCell>
                <TableCell>{getStatusChip(transaction.status)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (transaction.id === 'txn-001') {
                        navigate('/task-transaction');
                      }
                    }}
                    sx={{ 
                      color: transaction.id === 'txn-001' ? 'primary.main' : 'text.disabled',
                      '&:hover': {
                        backgroundColor: transaction.id === 'txn-001' ? 'action.hover' : 'transparent'
                      }
                    }}
                    disabled={transaction.id !== 'txn-001'}
                  >
                    <DocumentIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    startIcon={<ViewIcon />}
                    onClick={() => navigate(`/transactions/${transaction.id}`)}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}