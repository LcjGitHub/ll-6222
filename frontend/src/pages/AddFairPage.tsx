import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { createFair, ValidationError } from "../api/client";
import type { FieldErrors } from "../types";

/**
 * 添加市集页面。
 *
 * 包含名称、日期、城市三个必填字段的表单，支持前端基础校验
 * 和后端字段级错误回显；提交成功后显示提示并自动跳转回列表页。
 */
export function AddFairPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const nameTouched = touched.name || !!serverErrors.name;
  const dateTouched = touched.date || !!serverErrors.date;
  const cityTouched = touched.city || !!serverErrors.city;

  const nameError = nameTouched && !name.trim()
    ? "市集名称不能为空"
    : serverErrors.name ?? "";
  const dateError = dateTouched && !date.trim()
    ? "举办日期不能为空"
    : serverErrors.date ?? "";
  const cityError = cityTouched && !city.trim()
    ? "举办城市不能为空"
    : serverErrors.city ?? "";

  const formValid = !!name.trim() && !!date.trim() && !!city.trim();

  const mutation = useMutation({
    mutationFn: createFair,
    onSuccess: () => {
      setShowSuccess(true);
    },
    onError: (err) => {
      if (err instanceof ValidationError) {
        setServerErrors(err.details);
      }
    },
  });

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["fairs"] });
        queryClient.invalidateQueries({ queryKey: ["cities"] });
        queryClient.invalidateQueries({ queryKey: ["stats"] });
        navigate("/");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, navigate, queryClient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, date: true, city: true });
    setServerErrors({});
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

      {showSuccess && (
        <Alert severity="success">市集创建成功，即将返回列表…</Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          <TextField
            label="市集名称"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (serverErrors.name) setServerErrors((s) => ({ ...s, name: "" }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            error={!!nameError}
            helperText={nameError}
            fullWidth
            required
            disabled={showSuccess || mutation.isPending}
          />
          <TextField
            label="举办日期"
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              if (serverErrors.date) setServerErrors((s) => ({ ...s, date: "" }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, date: true }))}
            error={!!dateError}
            helperText={dateError}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            disabled={showSuccess || mutation.isPending}
          />
          <TextField
            label="举办城市"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              if (serverErrors.city) setServerErrors((s) => ({ ...s, city: "" }));
            }}
            onBlur={() => setTouched((t) => ({ ...t, city: true }))}
            error={!!cityError}
            helperText={cityError}
            fullWidth
            required
            disabled={showSuccess || mutation.isPending}
          />

          {mutation.isError && !(mutation.error instanceof ValidationError) && (
            <Alert severity="error">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "提交失败，请重试"}
            </Alert>
          )}

          <Box>
            <Button
              type="submit"
              variant="contained"
              disabled={!formValid || mutation.isPending || showSuccess}
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
