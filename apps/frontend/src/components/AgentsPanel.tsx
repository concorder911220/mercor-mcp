import React from "react";
import { Box, Typography } from "@mui/material";
import TaskItem from "./common/TaskItem";
import { Card, CardHeader, CardBody } from "./common/Card";
import ActionDropdown from "./common/ActionDropdown";
import { Task } from "../types/index";

const forReviewTasks: Task[] = [
  {
    id: "agent-task-1",
    description: "Recap portfolio strategy meeting & follow-ups",
    type: ["Meeting notes", "Follow-ups"],
    owner: "Rialto",
    client: "B. Brighton",
    timeline: "ASAP",
    status: "WAITING",
  },
  {
    id: "agent-task-2",
    description: "Introduce J. Marshall to tax specialist Warren Kemp",
    type: ["People"],
    owner: "Rialto",
    client: "J. Marshall",
    timeline: "May 20",
    status: "WAITING",
  },
  {
    id: "agent-task-3",
    description: "Review financial plan incl. retirements and investments",
    type: ["Financial Planning", "Data processing"],
    owner: "Rialto",
    client: "R. McKenzie",
    timeline: "May 25",
    status: "WAITING",
  },
  {
    id: "agent-task-4",
    description: "Review this week's leads report and confirm outreach",
    type: ["Business Dev."],
    owner: "Rialto",
    client: "New clients",
    timeline: "May 27",
    status: "WAITING",
  },
];

export function AgentsPanel() {
  return (
    <Card>
      <CardHeader>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Agent Tasks</Typography>
          <ActionDropdown
            label="For Review"
            options={[
              { label: "All Statuses", onClick: () => {} },
              { label: "For Review", onClick: () => {} },
              { label: "In Progress", onClick: () => {} },
              { label: "Complete", onClick: () => {} },
            ]}
          />
        </Box>
      </CardHeader>
      <CardBody
        sx={{
          maxHeight: 500,
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: 8,
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: (theme) => theme.palette.grey[200],
            borderRadius: 3,
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {forReviewTasks.map((task) => (
            <TaskItem key={task.description} task={task} />
          ))}
        </Box>
      </CardBody>
    </Card>
  );
}
