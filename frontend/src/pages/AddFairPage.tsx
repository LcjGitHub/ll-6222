import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { createFair } from "../api/client";

export function AddFairPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const nameError = touched.name && !name.trim() ? "市集名称不能为空" : "";
  const dateError = touched.date && !date.trim() ? "举办日期不能为空" : "";
  const cityError = touched.city && !city.trim() ? "举办城市不能为空" : "";
  const formValid = !!name.trim() && !!date.trim() && !!city.trim();

  const mutation = useMutation({
    mutationFn: createFair,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      navigate("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, date: true, city: true });
    if (!formValid) return;
    mutation.mutate({ name: name.trim(), date: date.trim(), city: city.trim() });
  };

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

      <Typography variant="h5" fontWeight={700}>
        添加市集
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            label="市集名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            error={!!nameError}
            helperText={nameError}
            fullWidth
            required
          />
          <TextField
            label="举办日期"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, date: true }))}
            error={!!dateError}
            helperText={dateError}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="举办城市"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, city: true }))}
            error={!!cityError}
            helperText={cityError}
            fullWidth
            required
          />

          {mutation.isError && (
            <Typography variant="body2" color="error">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "提交失败，请重试"}
            </Typography>
          )}

          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={mutation.isPending}
              startIcon={mutation.isPending ? <CircularProgress size={18} /> : undefined}
            >
              {mutation.isPending ? "提交中…" : "提交"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
