import React, { useState } from "react";
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  Button,
  Chip,
  Card,
  Input,
  IconButton,
} from "@rialto/ui";
import { styled, useTheme } from '@mui/material/styles';
import {
  Add as AddIcon,
  KeyboardArrowRight as ArrowIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { keyframes } from '@mui/system';
import { useNavigate } from "react-router-dom";
import { TaxClient, ClientStatus, statusColors, nextActions } from "../types/tax";
import { mockClients } from "../mocks/taxData";

// Styled components using Rialto theme

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  display: 'flex',
  gap: theme.spacing(3),
}));

const StatCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  flex: 1,
}));

const StyledTableContainer = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  overflow: 'hidden',
}));

// Rotation animation for the gear
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export default function TaxClients() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [clients, setClients] = useState<TaxClient[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClientDialog, setNewClientDialog] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = () => {
    if (newClientName && newClientEmail) {
      const newClient: TaxClient = {
        id: `filing-${Date.now()}`,
        clientId: `client-${Date.now()}`,
        name: newClientName,
        email: newClientEmail,
        status: ClientStatus.Onboarding,
        lastUpdated: new Date().toISOString().split('T')[0],
        taxYear: 2024,
        assignedTo: "Agent Smith"
      };
      setClients([...clients, newClient]);
      setNewClientDialog(false);
      setNewClientName("");
      setNewClientEmail("");
    }
  };

  const getStatusChip = (status: ClientStatus) => {
    const colors = statusColors[status] || { bg: "grey.50", text: "grey.700", border: "grey.200" };
    return (
      <Tooltip title={nextActions[status]} arrow>
        <Chip
          label={status}
          variant="outlined"
          size="sm"
          sx={{ 
            backgroundColor: colors.bg,
            color: colors.text,
            borderColor: colors.border,
            fontWeight: theme.typography.fontWeightMedium,
            cursor: "help",
            '&:hover': {
              backgroundColor: colors.bg,
            }
          }}
        />
      </Tooltip>
    );
  };

  return (
    <Box sx={{ 
      padding: theme.spacing(3),
      backgroundColor: theme.palette.background.paper,
    }}>
      {/* Header */}
      <HeaderContainer>
        <Typography variant="h4">
          Tax Filing
        </Typography>
      </HeaderContainer>

      {/* Search Bar and New Filing Button */}
      <SearchContainer>
        <Box sx={{ display: 'flex', gap: theme.spacing(2), alignItems: 'center', justifyContent: 'space-between' }}>
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
            sx={{ 
              maxWidth: theme.spacing(62.5), // 500px
              flex: 1
            }}
          />
          <Button
            variant="primary"
            size="sm"
            startIcon={<AddIcon />}
            onClick={() => setNewClientDialog(true)}
          >
            New filing
          </Button>
        </Box>
      </SearchContainer>

      {/* Summary Stats */}
      <StatsContainer>
        <StatCard>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontFamily: theme.typography.fontFamily
            }}
          >
            Total Clients
          </Typography>
          <Typography 
            variant="h6"
            sx={{
              fontWeight: theme.typography.fontWeightBold,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {clients.length}
          </Typography>
        </StatCard>
        <StatCard>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontFamily: theme.typography.fontFamily
            }}
          >
            Ready for Review
          </Typography>
          <Typography 
            variant="h6"
            sx={{
              fontWeight: theme.typography.fontWeightBold,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {clients.filter(c => c.status === ClientStatus.ReadyToReview).length}
          </Typography>
        </StatCard>
        <StatCard>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontFamily: theme.typography.fontFamily
            }}
          >
            Returns Filed
          </Typography>
          <Typography 
            variant="h6"
            sx={{
              fontWeight: theme.typography.fontWeightBold,
              fontFamily: theme.typography.fontFamily
            }}
          >
            {clients.filter(c => c.status === ClientStatus.ReturnFiled).length}
          </Typography>
        </StatCard>
      </StatsContainer>

      {/* Clients Table */}
      <StyledTableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell>Tax Year</TableCell>
              <TableCell>Assigned To</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow
                key={client.id}
                sx={{ 
                  "&:hover": { bgcolor: theme.palette.action.hover },
                  cursor: "pointer"
                }}
                onClick={() => {
                  if (client.status === ClientStatus.Onboarding) {
                    navigate('/task-onboarding');
                  } else {
                    navigate(`/tax/${client.id}`);
                  }
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography 
                        variant="subtitle2"
                        sx={{
                          fontWeight: theme.typography.fontWeightMedium,
                          fontFamily: theme.typography.fontFamily
                        }}
                      >
                        {client.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          fontFamily: theme.typography.fontFamily
                        }}
                      >
                        {client.email}
                      </Typography>
                    </Box>
                    <IconButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tax/${client.id}/profile`);
                      }}
                    >
                      <PersonIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>{getStatusChip(client.status)}</TableCell>
                <TableCell>{client.lastUpdated}</TableCell>
                <TableCell>{client.taxYear}</TableCell>
                <TableCell>{client.assignedTo || "Unassigned"}</TableCell>
                <TableCell align="right">
                  {client.status === ClientStatus.Onboarding ? (
                    <Tooltip title="Onboarding in progress - Click to view">
                      <IconButton
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/task-onboarding');
                        }}
                        sx={{
                          animation: `${spin} 2s linear infinite`,
                          color: theme.palette.primary.main
                        }}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <IconButton
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tax/${client.id}/documents`);
                      }}
                    >
                      <ArrowIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Add Client Dialog */}
      <Dialog open={newClientDialog} onClose={() => setNewClientDialog(false)}>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 400 }}>
            <TextField
              fullWidth
              label="Client Name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewClientDialog(false)} variant="secondary">Cancel</Button>
          <Button 
            onClick={handleAddClient} 
            variant="primary"
            disabled={!newClientName || !newClientEmail}
          >
            Add Client
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}