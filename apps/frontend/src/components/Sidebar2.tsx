import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import GridViewIcon from "@mui/icons-material/GridView";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DescriptionIcon from "@mui/icons-material/Description";
import TimelineIcon from "@mui/icons-material/Timeline";
import BarChartIcon from "@mui/icons-material/BarChart";
import IntegrationInstructionsIcon from "@mui/icons-material/IntegrationInstructions";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpIcon from "@mui/icons-material/Help";

const StyledDrawer = styled(Drawer)({
  "& .MuiDrawer-paper": {
    width: 240,
    backgroundColor: "#fff",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    position: "static",
    height: "100vh",
    borderRadius: 0,
  },
});

const CategoryTitle = styled(Typography)({
  color: "#999",
  fontSize: "0.875rem",
  fontWeight: 500,
  padding: "16px 16px 8px",
});

const StyledListItemButton = styled(ListItemButton)({
  padding: "8px 16px",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
});

const SubListItem = styled(ListItemButton)({
  padding: "6px 16px 6px 56px",
  color: "#666",
  "& .MuiListItemText-primary": {
    fontSize: "13px",
  },
});

const HighlightedListItem = styled(StyledListItemButton)({
  backgroundColor: "rgba(0, 0, 0, 0.04)",
});

export function Sidebar2() {
  return (
    <StyledDrawer variant="permanent">
      <Box sx={{ py: 1, px: 1, bgcolor: "white" }}>
        <Typography variant="h6" sx={{ px: 1, color: "#666" }}>
          Agent Builder
        </Typography>

        <List>
          <HighlightedListItem>
            <ListItemIcon>
              <GridViewIcon />
            </ListItemIcon>
            <ListItemText primary="Templates" />
          </HighlightedListItem>

          <StyledListItemButton>
            <ListItemIcon>
              <SmartToyIcon />
            </ListItemIcon>
            <ListItemText primary="Agents" />
          </StyledListItemButton>
          <SubListItem>
            <ListItemText primary="Onboarding" />
          </SubListItem>
          <SubListItem>
            <ListItemText primary="Scheduling" />
          </SubListItem>
          <SubListItem>
            <ListItemText primary="Lead Gen" />
          </SubListItem>

          <StyledListItemButton>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText primary="Documents" />
          </StyledListItemButton>
        </List>

        <CategoryTitle>Monitor</CategoryTitle>
        <List>
          <StyledListItemButton>
            <ListItemIcon>
              <TimelineIcon />
            </ListItemIcon>
            <ListItemText primary="Activity Center" />
          </StyledListItemButton>

          <StyledListItemButton>
            <ListItemIcon>
              <BarChartIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" />
          </StyledListItemButton>
        </List>

        <CategoryTitle>Account</CategoryTitle>
        <List>
          <StyledListItemButton>
            <ListItemIcon>
              <IntegrationInstructionsIcon />
            </ListItemIcon>
            <ListItemText primary="Integrations" />
          </StyledListItemButton>

          <StyledListItemButton>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </StyledListItemButton>

          <StyledListItemButton>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </StyledListItemButton>
        </List>
      </Box>
    </StyledDrawer>
  );
}
