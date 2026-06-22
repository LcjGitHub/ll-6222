import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { fetchCities, fetchFairs } from "../api/client";

export function FairListPage() {
  const [city, setCity] = useState("");

  const { data: cities } = useQuery({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fairs", city],
    queryFn: () => fetchFairs(city || undefined),
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
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5" fontWeight={700}>
            市集列表
          </Typography>
          <Typography variant="body2" color="text.secondary">
            共 {data?.length ?? 0} 届 · 点击查看摊位备忘
          </Typography>
        </Box>
        <Button
          variant="contained"
          component={RouterLink}
          to="/fairs/new"
        >
          添加市集
        </Button>
      </Stack>

      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>城市筛选</InputLabel>
        <Select
          value={city}
          label="城市筛选"
          onChange={(e) => setCity(e.target.value)}
        >
          <MenuItem value="">全部城市</MenuItem>
          {cities?.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
