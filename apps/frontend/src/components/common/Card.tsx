import { Paper, Box } from "@mui/material";
import { styled } from "@mui/material/styles";

export const Card = styled(Paper)`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
`;

export const CardHeader = styled(Box)`
  flex: 0 0 auto;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  margin: 0 24px;
`;

export const CardBody = styled(Box)`
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 24px;
`;
