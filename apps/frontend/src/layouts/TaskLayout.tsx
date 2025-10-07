import { Box } from '@mui/material';
import { Sidebar } from '../components/Sidebar';
import { ConversationList } from '../components/ConversationList';
import { styled } from '@mui/material/styles';
import { Outlet } from 'react-router-dom';
import React, { useState } from 'react';

const LayoutRoot = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '100vh',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

const TaskListPanel = styled(Box)(({ theme }) => ({
  width: theme.spacing(60),
  height: '100vh',
  backgroundColor: theme.palette.background.paper,
  marginLeft: theme.spacing(18.75), // Match sidebar width
  flexShrink: 0,
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  height: '100vh',
  overflow: 'hidden',
  boxSizing: 'border-box',
  backgroundColor: theme.palette.background.paper,
}));

export function TaskLayout() {
  return (
    <LayoutRoot>
      <Sidebar />
      
      <TaskListPanel>
        <ConversationList />
      </TaskListPanel>
      
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutRoot>
  );
} 