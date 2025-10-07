import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { UserInput } from '../components/UserInput';
import { FileUploadResponse } from '../redux/data-types/message';
import { components } from '../types/backend-schema';
import { Card, IconButton, Modal, Button, Select } from '@rialto/ui';
import SettingsIcon from '@mui/icons-material/Settings';

const StyledContainer = styled(Box)(({ theme }) => ({
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: '30vh',
  paddingLeft: theme.spacing(5),
  paddingRight: theme.spacing(5),
  backgroundColor: theme.palette.background.paper,
}));

const InputContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: theme.spacing(180),
}));

const CardsContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: theme.spacing(180),
  marginTop: theme.spacing(4),
  display: 'flex',
  paddingTop: '2vh',
  gap: theme.spacing(4),
  alignItems: 'stretch',
  justifyContent: 'center',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  flex: 1,
  minHeight: theme.spacing(25),
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

export default function Planning() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [taxFilingModalOpen, setTaxFilingModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');

  const customers = [
    { value: 'linda-mack', label: 'Linda Mack' }
  ];

  const handleSendMessage = (message: string, fileUploads?: FileUploadResponse[]) => {
    if (message.trim() || (fileUploads && fileUploads.length > 0)) {
      // Navigate to new task with the initial message and file uploads
      navigate('/task/new', {
        state: {
          initialMessage: message,
          fileUploads: fileUploads
        }
      });
    }
  };

  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'tax':
        setTaxFilingModalOpen(true);
        break;
      case 'projects':
        handleSendMessage('Show me my recent projects');
        break;
      case 'resources':
        handleSendMessage('Show me planning resources and help guides');
        break;
    }
  };

  const handleStartTaxFiling = () => {
    if (selectedCustomer) {
      const customerName = customers.find(c => c.value === selectedCustomer)?.label;
      const message = `Agent Template Trigger: Start tax filing for ${customerName}

1. Create a client folder in Dropbox for document storage
2. Update the client record in Salesforce with current tax year information
3. Draft an email with a link to the client folder via Outlook`;
      setTaxFilingModalOpen(false);
      handleSendMessage(message);
    }
  };

  const handleCloseModal = () => {
    setTaxFilingModalOpen(false);
    setSelectedCustomer('');
  };

  return (
    <StyledContainer>
      <Typography variant="h2" sx={{ mb: theme.spacing(4), fontWeight: theme.typography.fontWeightMedium }}>
        What can I help you with?
      </Typography>

      <InputContainer>
        <UserInput onSendMessage={handleSendMessage} />
      </InputContainer>

      <CardsContainer>
        <StyledCard onClick={() => handleCardClick('tax')}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: theme.spacing(1) }}>
            <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium, color: theme.palette.text.secondary }}>
              Start tax filing
            </Typography>
            <IconButton variant="ghost" size="md" sx={{ color: theme.palette.text.secondary }}>
              <SettingsIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Set up client for tax season and send them their organizer
          </Typography>
        </StyledCard>

        <StyledCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: theme.spacing(1) }}>
            <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium, color: theme.palette.text.secondary }}>
              Validate tax docs
            </Typography>
            <IconButton variant="ghost" size="md" sx={{ color: theme.palette.text.secondary }}>
              <SettingsIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Screen received tax documents and identify issues
          </Typography>
        </StyledCard>

        <StyledCard>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: theme.spacing(1) }}>
            <Typography variant="body1" sx={{ fontWeight: theme.typography.fontWeightMedium, color: theme.palette.text.secondary }}>
              Run diagnostic
            </Typography>
            <IconButton variant="ghost" size="md" sx={{ color: theme.palette.text.secondary }}>
              <SettingsIcon />
            </IconButton>
          </Box>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Review completed return and ensure it passes all tests
          </Typography>
        </StyledCard>
      </CardsContainer>

      <Modal
        open={taxFilingModalOpen}
        onClose={handleCloseModal}
        title="Start tax filing"
      >
        <Box sx={{ p: theme.spacing(3), minWidth: theme.spacing(50) }}>
          <Typography variant="body1" sx={{ mb: theme.spacing(3), lineHeight: 1.6 }}>
            This workflow will help you get started with tax filing for your client. We'll:
          </Typography>

          <Box component="ul" sx={{ mb: theme.spacing(3), pl: theme.spacing(2) }}>
            <Typography component="li" variant="body2" sx={{ mb: theme.spacing(1) }}>
              Create a client folder in Dropbox for document storage
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: theme.spacing(1) }}>
              Update the client record in Salesforce with current tax year information
            </Typography>
            <Typography component="li" variant="body2">
              Send the client organizer via Outlook to collect necessary documents
            </Typography>
          </Box>

          <Box sx={{ mb: theme.spacing(3) }}>
            <Typography variant="body2" sx={{ mb: theme.spacing(1), fontWeight: theme.typography.fontWeightMedium }}>
              Select Customer:
            </Typography>
            <Select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value as string)}
              options={customers}
              placeholder="Choose a customer..."
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing(2) }}>
            <Button variant="ghost" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStartTaxFiling}
              disabled={!selectedCustomer}
            >
              Start
            </Button>
          </Box>
        </Box>
      </Modal>
    </StyledContainer>
  );
} 