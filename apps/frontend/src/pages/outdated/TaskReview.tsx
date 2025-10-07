import React from "react";
import { Box, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SyncIcon from "@mui/icons-material/Sync";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useNavigate } from "react-router-dom";
import SearchField from "../components/common/SearchField";
import {
  PanelsWrapper,
  LeftPanel,
  RightPanel,
} from "../components/StyledPanels";
import TaskItem from "../components/common/TaskItem";
import { StandardPanel } from "../components/common/StandardPanel";
import ActionButton from "../components/common/ActionButton";
import ReviewContentPanel from "../components/ReviewContentPanel";
import { Task } from "../types/index";

const followUpTasks: Task[] = [
  {
    id: "follow-up-1",
    description: "Introduce Bill to tax specialist Warren Kemp via email",
    type: ["Email", "Follow-up"],
    owner: "Rialto",
    client: "B. Brighton",
    timeline: "ASAP",
    status: "WAITING",
  },
  {
    id: "follow-up-2",
    description: "Schedule follow-up meeting with Bill in the next two weeks",
    type: ["Scheduling"],
    owner: "Rialto",
    client: "B. Brighton",
    timeline: "ASAP",
    status: "WAITING",
  },
  {
    id: "follow-up-3",
    description: "Rebalance portfolio and increase exposure to tech",
    type: ["Investment"],
    owner: "Tom",
    client: "B. Brighton",
    timeline: "Aug 22",
    status: "WAITING",
  },
];

export default function TaskReview() {
  const navigate = useNavigate();

  const ReviewContent = () => <ReviewContentPanel content={meetingDetails} />;

  const FollowUpsContent = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {followUpTasks.map((task) => (
        <TaskItem key={task.description} task={task} />
      ))}
    </Box>
  );

  const recapActions = (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 1,
          px: 1,
          py: 0.5,
          cursor: "pointer",
        }}
      >
        <SyncIcon fontSize="small" />
        <Typography variant="body2">Sync CRM</Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 1,
          px: 1,
          py: 0.5,
          cursor: "pointer",
        }}
      >
        <AutoFixHighIcon fontSize="small" />
        <Typography variant="body2">Auto-Pilot</Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 1200, margin: "0 auto", width: "100%", p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
        <ActionButton
          onClick={() => navigate("/tasks")}
          sx={{
            minWidth: "auto",
            border: "none",
            p: 1,
            "&:hover": {
              border: "none",
              background: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <ArrowBackIcon /> All tasks
        </ActionButton>
        <Box sx={{ flexGrow: 1 }} />
        <SearchField placeholder="Search..." size="small" sx={{ width: 200 }} />
      </Box>

      <PanelsWrapper>
        <LeftPanel>
          <StandardPanel
            title="Recap of meeting with B. Brighton"
            actions={
              <Box sx={{ display: "flex", gap: 1 }}>
                <ActionButton onClick={() => {}}>Sync CRM</ActionButton>
                <ActionButton onClick={() => {}}>Auto-Pilot</ActionButton>
              </Box>
            }
          >
            <ReviewContent />
          </StandardPanel>
        </LeftPanel>

        <RightPanel>
          <StandardPanel
            title="Follow-ups"
            actions={
              <ActionButton onClick={() => {}}>Schedule tasks</ActionButton>
            }
          >
            <FollowUpsContent />
          </StandardPanel>
        </RightPanel>
      </PanelsWrapper>
    </Box>
  );
}

const meetingDetails = {
  title: "Portfolio Strategy & College Fund",
  date: "8/15/2025",
  attendees: "Bill Brighton, Tom Jones",
  notes: `
    Overview: <br><br>
    
    Bill initiated the discussion by expressing concerns about recent market volatility and its impact on his portfolio. The conversation naturally evolved into a review of his current investments and potential opportunities for rebalancing, with a special focus on securing funds for his daughter's upcoming college enrollment.  <br><br>
    
    Portfolio: <br><br>
    
    Tom and Bill discussed the impact of recent market fluctuations on his current asset allocation. They analyzed which positions were underperforming and identified opportunities for rebalancing.  <br><br>
    
    Rebalancing:  <br><br>
    
    Bill proposed shifting a portion of Tom's investments from low-yield bonds to select high-growth technology stocks. They agreed that Bill would sell approximately $50K of Vanguard bond holdings in the coming week to free up capital for these adjustments. <br><br>
    
    College Fund: <br><br>
    
    Bill emphasized the need to allocate funds for his daughter's college fund.
    The conversation included aligning the rebalancing strategy with the timeline for establishing a dedicated college fund account. <br><br>
    
    Taxes: <br><br>
    
    Bill expressed interest in connecting with the in-house tax specialist (Warren Kemp - warren.kemp@b2badvisors.com).
  `,
};
