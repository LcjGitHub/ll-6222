import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link as RouterLink, useParams } from "react-router-dom";
import { fetchFair } from "../api/client";

/**
 * 单届市集详情页（摊位 Table）。
 */
export function FairDetailPage() {
  const { id } = useParams<{ id: string }>();
  const fairId = Number(id);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fair", fairId],
    queryFn: () => fetchFair(fairId),
    enabled: Number.isFinite(fairId),
  });

  if (!Number.isFinite(fairId)) {
    return <Alert severity="warning">无效的市集 ID</Alert>;
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : "加载失败"}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{ alignSelf: "flex-start" }}
      >
        返回列表
      </Button>

      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {data.name}
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CalendarMonthIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {dayjs(data.date).format("YYYY年M月D日")}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <LocationOnIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {data.city}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          摊位备忘
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="15%">摊位号</TableCell>
                <TableCell width="30%">作品名</TableCell>
                <TableCell>销量备注</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.booths.map((booth) => (
                <TableRow key={booth.id} hover>
                  <TableCell>{booth.booth_number}</TableCell>
                  <TableCell>{booth.work_name}</TableCell>
                  <TableCell>{booth.sales_notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Stack>
  );
}
