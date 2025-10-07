
import { Box, Typography } from '@mui/material';

interface PlaceholderProps {
  pageName: string;
}

export default function Placeholder({ pageName }: PlaceholderProps) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: '100%'
      }}
    >
      <Typography variant="h4">{pageName} Page Coming Soon</Typography>
    </Box>
  );
}
