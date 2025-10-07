import {
  Drawer,
  Box,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { createRialtoTheme } from "@rialto/theme";
import { useLocation, useNavigate } from "react-router-dom";
import { IconButton } from "@rialto/ui";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SettingsIcon from "@mui/icons-material/Settings";

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: theme.spacing(18.75), // 150px
    backgroundColor: theme.palette.background.default,
    borderRight: `1px solid ${theme.palette.divider}`,
    display: "flex",
    flexDirection: "column",
  },
}));

const Logo = styled("img")(({ theme }) => ({
  height: 40,
  margin: `${theme.spacing(3)} auto ${theme.spacing(8)}`, // 24px auto 64px
  width: 40,
  objectFit: "contain",
}));

const ProfileImage = styled("img")(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: "50%",
  margin: theme.spacing(2, 'auto'),
  cursor: "pointer",
  objectFit: "cover",
  border: `2px solid ${theme.palette.divider}`,
}));


export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = createRialtoTheme();

  const menuItems = [
    { text: "Agent", icon: <SmartToyIcon />, url: "/" },
    { text: "Tax", icon: <ReceiptIcon />, url: "/tax" },
    { text: "Tasks", icon: <AssignmentIcon />, url: "/tasks" },
    { text: "Setup", icon: <SettingsIcon />, url: "/agents" },
  ];

  return (
    <StyledDrawer variant="permanent" anchor="left">
      <Logo src="/acacia_logo.png" alt="Acacia Logo" />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: theme.spacing(3) }}>
        {menuItems.map((item) => {
          const isSelected = location.pathname === item.url ||
            (item.url === "/tax" && location.pathname.startsWith("/tax")) ||
            (item.url === "/" && location.pathname.startsWith("/task"));

          return (
            <Box key={item.text} sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.25,
              p: theme.spacing(1),
              px: theme.spacing(2),
              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 0.2s ease-in-out'
            }}>
              <IconButton
                variant="ghost"
                size="lg"
                onClick={() => navigate(item.url)}
                sx={{
                  color: isSelected
                    ? theme.palette.primary.main
                    : theme.palette.text.disabled
                }}
              >
                {item.icon}
              </IconButton>
              <Typography sx={{
                textAlign: 'center',
                color: isSelected
                  ? theme.palette.primary.main
                  : theme.palette.text.disabled,
                fontSize: theme.typography.caption.fontSize,
                lineHeight: theme.typography.caption.lineHeight,
                fontWeight: isSelected
                  ? theme.typography.fontWeightMedium
                  : theme.typography.fontWeightRegular
              }}>
                {item.text}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <ProfileImage
        src="/ProfilePicture.png"
        alt="Profile"
        onClick={() => navigate('/profile')}
      />
    </StyledDrawer>
  );
}
