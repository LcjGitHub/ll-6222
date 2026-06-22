import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Link as RouterLink } from "react-router-dom";
import { fetchFairs } from "../api/client";

/**
 * 市集列表页。
 */
export function FairListPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fairs"],
    queryFn: fetchFairs,
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : "未知错误"}
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={700}>
        市集列表
      </Typography>
      <Typography variant="body2" color="text.secondary">
        共 {data?.length ?? 0} 届 · 点击查看摊位备忘
      </Typography>

      {data?.map((fair) => (
        <Card key={fair.id} variant="outlined">
          <CardActionArea component={RouterLink} to={`/fairs/${fair.id}`}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {fair.name}
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CalendarMonthIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(fair.date).format("YYYY年M月D日")}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {fair.city}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Stack>
  );
}
