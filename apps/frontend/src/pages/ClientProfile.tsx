import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Button,
  TextField,
  Paper,
  Stack,
  Breadcrumbs,
  Link,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { TaxClient } from "../types/tax";
import { mockClients } from "../mocks/taxData";

export default function ClientProfile() {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<TaxClient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedClient, setEditedClient] = useState<TaxClient | null>(null);

  useEffect(() => {
    const foundClient = mockClients.find(c => c.id === clientId);
    if (foundClient) {
      setClient(foundClient);
      setEditedClient({ ...foundClient });
    }
  }, [clientId]);

  if (!client || !editedClient) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Client not found</Typography>
      </Box>
    );
  }

  const handleSave = () => {
    setClient({ ...editedClient });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedClient({ ...client });
    setIsEditing(false);
  };

  const handleFieldChange = (field: keyof TaxClient, value: any) => {
    setEditedClient(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate("/clients")}
          underline="hover"
          color="inherit"
        >
          Clients
        </Link>
        <Typography color="text.primary" variant="body2">
          {client.name} - Profile
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={() => navigate("/clients")}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={600}>
              {client.name} - Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tax Year {client.taxYear} • {client.email}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1}>
          {isEditing ? (
            <>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Stack>
      </Box>

      {/* Profile Information */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Client Information
        </Typography>

        <Stack spacing={3}>
          {/* Basic Information */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Basic Information
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Full Name"
                  value={editedClient.name || ""}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                />
                <TextField
                  label="Preferred Name"
                  value={editedClient.preferredName || ""}
                  onChange={(e) => handleFieldChange("preferredName", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                />
              </Box>
              
              <TextField
                label="Social Security Number"
                value={editedClient.ssn || ""}
                onChange={(e) => handleFieldChange("ssn", e.target.value)}
                disabled={!isEditing}
                placeholder="XXX-XX-XXXX"
                fullWidth
              />
            </Stack>
          </Box>

          <Divider />

          {/* Contact Information */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Contact Information
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Email Address"
                  value={editedClient.email || ""}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  disabled={!isEditing}
                  type="email"
                  fullWidth
                />
                <TextField
                  label="Phone Number"
                  value={editedClient.phone || ""}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                />
              </Box>

              <TextField
                label="Address"
                value={editedClient.address || ""}
                onChange={(e) => handleFieldChange("address", e.target.value)}
                disabled={!isEditing}
                multiline
                rows={2}
                fullWidth
              />

              <TextField
                label="Communication Preference"
                value={editedClient.communicationPreference || "email"}
                onChange={(e) => handleFieldChange("communicationPreference", e.target.value)}
                disabled={!isEditing}
                select
                fullWidth
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
                <MenuItem value="text">Text Message</MenuItem>
              </TextField>
            </Stack>
          </Box>

          <Divider />

          {/* Emergency Contact */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Emergency Contact
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Emergency Contact Name"
                  value={editedClient.emergencyContact || ""}
                  onChange={(e) => handleFieldChange("emergencyContact", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                />
                <TextField
                  label="Emergency Contact Phone"
                  value={editedClient.emergencyPhone || ""}
                  onChange={(e) => handleFieldChange("emergencyPhone", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                />
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Tax Information */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Tax Information
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label="Tax Year"
                  value={editedClient.taxYear || ""}
                  onChange={(e) => handleFieldChange("taxYear", parseInt(e.target.value))}
                  disabled={!isEditing}
                  type="number"
                  fullWidth
                />
                <TextField
                  label="Assigned To"
                  value={editedClient.assignedTo || ""}
                  onChange={(e) => handleFieldChange("assignedTo", e.target.value)}
                  disabled={!isEditing}
                  fullWidth
                />
              </Box>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Quick Actions */}
      <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(`/clients/${clientId}/documents`)}
        >
          View Documents
        </Button>
      </Box>
    </Box>
  );
}