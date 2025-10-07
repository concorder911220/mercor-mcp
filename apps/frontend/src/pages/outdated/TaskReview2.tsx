import React, { useState } from "react";
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
} from "../components/StyledPanels6040";
import TaskItem from "../components/common/TaskItem";
import { StandardPanel } from "../components/common/StandardPanel";
import ActionButton from "../components/common/ActionButton";
import { ReviewDataPanel } from "../components/ReviewDataPanel";
import { Task } from "../types/index";
import { ConfirmDialog } from "../components/common/ConfirmDialog";

const followUpTasks: Task[] = [
  {
    id: "follow-up-4",
    description:
      "Configure scenarios for a market downturn, larger than expected living expenses and graduate school",
    type: ["Financial Planning"],
    owner: "Rialto",
    client: "L. Mahon",
    timeline: "ASAP",
    status: "WAITING",
  },
  {
    id: "follow-up-5",
    description:
      "Review and finalize the financial plan for Linda prior to meeting on Jun. 15",
    type: ["Financial Planning", "Review"],
    owner: "T. Jones",
    client: "L. Mahon",
    timeline: "Jun 15",
    status: "WAITING",
  },
];

export default function TaskReview2() {
  const navigate = useNavigate();
  const [isAutoPilotEnabled, setIsAutoPilotEnabled] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isScheduleDisabled, setIsScheduleDisabled] = useState(false);
  const [localDataInput, setLocalDataInput] = useState(dataInput);

  const handleSyncCRM = () => {
    const updatedData = JSON.parse(JSON.stringify(localDataInput));
    updatedData["Self & Family"]["Retirement Age"].Certainty = 1;
    updatedData["Net worth"]["Savings"].Certainty = 1;
    updatedData["Income"]["Social security at 65"].Certainty = 1;
    updatedData["Liabilities"]["Chicago Mortgage"].Certainty = 1;
    setLocalDataInput(updatedData);
    setIsAutoPilotEnabled(true);
  };

  const handleAutoPilot = () => {
    setConfirmDialogOpen(true);
  };

  const handleConfirmAutoPilot = () => {
    setIsAutoPilotEnabled(true);
    setConfirmDialogOpen(false);
  };
  const ReviewContent = () => <ReviewDataPanel content={dataInput} />;

  const FollowUpsContent = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {followUpTasks.map((task) => (
        <TaskItem key={task.description} task={task} />
      ))}
    </Box>
  );

  return (
    <Box
      sx={{
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        p: 3,
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
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
            title="Sync Linda Mahon's base facts"
            actions={
              <Box sx={{ display: "flex", gap: 1 }}>
                <ActionButton
                  onClick={handleSyncCRM}
                  disabled={isAutoPilotEnabled}
                  sx={{
                    "&.Mui-disabled": {
                      borderColor: "#E0E0E0",
                      color: "#9E9E9E",
                    },
                  }}
                >
                  Sync eMoney
                </ActionButton>
                <ActionButton
                  onClick={handleAutoPilot}
                  disabled={isAutoPilotEnabled}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: "hsl(48,33%,97%)",
                    "&:hover": {
                      backgroundColor: "hsl(48,33%,94%)",
                    },
                    "&.Mui-disabled": {
                      borderColor: "#E0E0E0",
                      color: "#9E9E9E",
                    },
                  }}
                >
                  <img
                    src={new URL("/logo.png", import.meta.url).href}
                    alt="Logo"
                    style={{ width: 16, height: 16 }}
                  />
                  Auto-Pilot
                </ActionButton>
              </Box>
            }
          >
            <ReviewContent />
          </StandardPanel>
        </LeftPanel>

        <RightPanel>
          <StandardPanel
            title="Next steps"
            actions={
              <Box sx={{ pr: 1 }}>
                <ActionButton
                  onClick={() => setIsScheduleDisabled(true)}
                  disabled={isScheduleDisabled}
                  sx={{
                    "&.Mui-disabled": {
                      borderColor: "#E0E0E0",
                      color: "#9E9E9E",
                    },
                  }}
                >
                  Schedule tasks
                </ActionButton>
              </Box>
            }
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, pr: 1 }}
            >
              <Box sx={{ width: "95%" }}>
                <FollowUpsContent />
              </Box>
            </Box>
          </StandardPanel>
        </RightPanel>
      </PanelsWrapper>
      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmAutoPilot}
      />
    </Box>
  );
}

const dataInput = {
  "Self & Family": {
    Name: {
      Value: "Linda Mahon",
      Source: "Intro call",
      Link: "/clients",
      Certainty: 1,
    },
    Gender: {
      Value: "Female",
      Source: "Intro call",
      Link: "/clients",
      Certainty: 1,
    },
    "Date of Birth": {
      Value: "6/15/1973",
      Source: "Intake form",
      Link: "/clients",
      Certainty: 1,
    },
    "Retirement Age": {
      Value: "65",
      Source: "Intake form",
      Link: "/clients",
      Certainty: 0.75,
    },
    "Life Expectancy": {
      Value: "90",
      Source: "Assumptions",
      Link: "/clients",
      Certainty: 1,
    },
    "Special Needs": {
      Value: "No",
      Source: "Assumptions",
      Link: "/clients",
      Certainty: 1,
    },
    "In Good Health": {
      Value: "Yes",
      Source: "Assumptions",
      Link: "/clients",
      Certainty: 1,
    },
  },
  "Financial Priorities": {
    "Priority 1": {
      Value: "Retire as early as possible",
      Source: "Intro call",
      Link: "/clients",
      Certainty: 1,
    },
    "Priority 2": {
      Value: "Financial confidence through a plan",
      Source: "Intro call",
      Link: "/clients",
      Certainty: 1,
    },
    "Priority 3": {
      Value: "A retreat to make family memories",
      Source: "Intro call",
      Link: "/clients",
      Certainty: 1,
    },
  },
  "Financial goals": {
    "Goal 1": {
      Value: "Retirement: Linda would like to retire at 65",
      Source: "Intake form",
      Link: "/clients",
      Certainty: 1,
    },
    "Goal 2": {
      Value: "Barney College $50,000 needed from 2025 to 2029",
      Source: "Intake form",
      Link: "/clients",
      Certainty: 1,
    },
    "Goal 3": {
      Value:
        "Leave to heirs. Barney and Robin would like to leave $1 million to their heirs",
      Source: "Intake form",
      Link: "/clients",
      Certainty: 1,
    },
  },
  "Net worth": {
    Checking: {
      Value: "$200,000",
      Source: "Schwab",
      Link: "/clients",
      Certainty: 1,
    },
    Savings: {
      Value: "$200,000",
      Source: "Fidelity",
      Link: "/clients",
      Certainty: 0.75,
    },
    "401(k)": {
      Value: "$150,000",
      Source: "Vanguard",
      Link: "/clients",
      Certainty: 1,
    },
    "Life Policy": {
      Value: "$800,000",
      Source: "Northwestern",
      Link: "/clients",
      Certainty: 1,
    },
    "Chicago Home": {
      Value: "$750,000",
      Source: "JPM Mortgages",
      Link: "/clients",
      Certainty: 1,
    },
    "Mercedes SUV": {
      Value: "$40,000",
      Source: "Wells Fargo Auto",
      Link: "/clients",
      Certainty: 1,
    },
  },
  Liabilities: {
    "Chicago Mortgage": {
      Value: "$300,000",
      Source: "JPM Mortgages",
      Link: "/clients",
      Certainty: 0.75,
    },
  },
  Total: {
    "Net Worth": {
      Value: "$2,500,000",
      Source: "Calculated",
      Link: "/clients",
      Certainty: 1,
    },
  },
  Income: {
    "Linda's income": {
      Value: "400,000",
      Source: "W2",
      Link: "/clients",
      Certainty: 1,
    },
    "Social security at 65": {
      Value: "$30,000",
      Source: "W2",
      Link: "/clients",
      Certainty: 0.75,
    },
  },
  Expenses: {
    "Living Expenses": {
      Value: "$120,000",
      Source: "Chase Credit",
      Link: "/clients",
      Certainty: 1,
    },
    Liabilities: {
      Value: "$30,0000",
      Source: "JPM Mortgage",
      Link: "/clients",
      Certainty: 1,
    },
    Education: {
      Value: "$15,000",
      Source: "Intake form",
      Link: "/clients",
      Certainty: 1,
    },
    Other: {
      Value: "$12,000",
      Source: "Intake form",
      Link: "/clients",
      Certainty: 1,
    },
    Insurance: {
      Value: "$15,000",
      Source: "Liberty Mutual",
      Link: "/clients",
      Certainty: 1,
    },
  },
  Savings: {
    "Employee contributions": {
      Value: "7% of salary",
      Source: "Intake form",
      Link: "/clients",
      Certainty: 1,
    },
    "Employer contribution": {
      Value: "3.5% of salary",
      Source: "Intake form",
      Link: "/clients",
      Certainty: 1,
    },
  },
  "Asset allocation - Current": {
    Stocks: {
      Value: "40%",
      Source: "Details",
      Link: "/clients",
      Certainty: 1,
    },
    Bonds: {
      Value: "10%",
      Source: "Details",
      Link: "/clients",
      Certainty: 1,
    },
    "Real Estate": {
      Value: "50%",
      Source: "Details",
      Link: "/clients",
      Certainty: 1,
    },
  },
  "Asset Allocation - Recommended": {
    Stocks: {
      Value: "30%",
      Source: "Details",
      Link: "/clients",
      Certainty: 1,
    },
    Bonds: {
      Value: "20%",
      Source: "Details",
      Link: "/clients",
      Certainty: 1,
    },
    "Real Estate": {
      Value: "50%",
      Source: "Details",
      Link: "/clients",
      Certainty: 1,
    },
  },
  Protection: {
    "Life insurance": {
      Value: "$200,000",
      Source: "Allstate",
      Link: "/clients",
      Certainty: 1,
    },
    "Disability insurance": {
      Value: "50% of income",
      Source: "Liberty Mutual",
      Link: "/clients",
      Certainty: 1,
    },
    "Property insurance": {
      Value: "Chicago Home",
      Source: "Allstate",
      Link: "/clients",
      Certainty: 1,
    },
    "Medical insurance": {
      Value: "$0 deductible",
      Source: "Liberty Mutual",
      Link: "/clients",
      Certainty: 1,
    },
  },
};
