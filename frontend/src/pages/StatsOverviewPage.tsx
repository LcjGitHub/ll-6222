import AssessmentIcon from "@mui/icons-material/Assessment";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import StorefrontIcon from "@mui/icons-material/Storefront";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "../api/client";

export function StatsOverviewPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const renderContent = () => {
    if (isError) {
      return (
        <Alert severity="error">
          {error instanceof Error ? error.message : "未知错误"}
        </Alert>
      );
    }
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      );
    }
    if (!data) {
      return null;
    }
    return (
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Card variant="outlined" sx={{ flex: 1, minWidth: 220 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    市集总数
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {data.fair_count}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ flex: 1, minWidth: 220 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <StorefrontIcon color="secondary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    摊位总数
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {data.booth_count}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <LocationCityIcon color="action" />
              <Typography variant="h6" fontWeight={600}>
                各城市举办次数
              </Typography>
            </Stack>
            {data.city_counts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                暂无城市数据
              </Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {data.city_counts.map((item) => (
                  <Chip
                    key={item.city}
                    label={`${item.city} · ${item.count} 届`}
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    );
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          统计概览
        </Typography>
        <Typography variant="body2" color="text.secondary">
          市集与摊位数据汇总
        </Typography>
      </Box>
      {renderContent()}
    </Stack>
  );
}
