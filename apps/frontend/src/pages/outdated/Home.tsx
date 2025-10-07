import { Box, Typography, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { HomeSearchField } from "../components/HomeSearchField";
import {
  LeftPanel,
  RightPanel,
  PanelsWrapper,
} from "../components/StyledPanels";
import { UpcomingMeetings } from "../components/UpcomingMeetings";
import { AgentsPanel } from "../components/AgentsPanel";

export default function Home() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 80px)",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        p: 3,
      }}
    >
      <Box mb={4} textAlign="center">
        <Typography variant="h4" sx={{ mb: 2 }}>
          Welcome back, Tom
        </Typography>
        <HomeSearchField
          placeholder="What can I help you with?"
          variant="outlined"
          size="small"
          sx={{
            width: "400px",
            maxWidth: "100%",
            bgcolor: "white",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <PanelsWrapper>
        <LeftPanel>
          <UpcomingMeetings />
        </LeftPanel>
        <RightPanel>
          <AgentsPanel />
        </RightPanel>
      </PanelsWrapper>
    </Box>
  );
}
