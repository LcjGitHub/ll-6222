import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { fetchFair, updateBooth } from "../api/client";
import type { Booth } from "../types";

interface EditingBooth {
  booth_number: string;
  work_name: string;
  sales_notes: string;
}

/**
 * 单届市集详情页（摊位 Table）。
 */
export function FairDetailPage() {
  const { id } = useParams<{ id: string }>();
  const fairId = Number(id);
  const queryClient = useQueryClient();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<EditingBooth | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fair", fairId],
    queryFn: () => fetchFair(fairId),
    enabled: Number.isFinite(fairId),
  });

  const updateMutation = useMutation({
    mutationFn: (params: { boothId: number; payload: EditingBooth }) =>
      updateBooth(params.boothId, params.payload),
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "保存成功",
        severity: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["fair", fairId] });
      setEditingId(null);
      setEditingData(null);
    },
    onError: (err: Error) => {
      setSnackbar({
        open: true,
        message: err.message || "保存失败",
        severity: "error",
      });
    },
  });

  const handleEdit = (booth: Booth) => {
    setEditingId(booth.id);
    setEditingData({
      booth_number: booth.booth_number,
      work_name: booth.work_name,
      sales_notes: booth.sales_notes,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleSave = () => {
    if (editingId === null || !editingData) return;
    updateMutation.mutate({ boothId: editingId, payload: editingData });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

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
                <TableCell width="25%">作品名</TableCell>
                <TableCell>销量备注</TableCell>
                <TableCell width="15%" align="right">
                  操作
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.booths.map((booth) => {
                const isEditing = editingId === booth.id;
                return (
                  <TableRow key={booth.id} hover>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          value={editingData?.booth_number ?? ""}
                          onChange={(e) =>
                            setEditingData((prev) =>
                              prev ? { ...prev, booth_number: e.target.value } : null
                            )
                          }
                        />
                      ) : (
                        booth.booth_number
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          value={editingData?.work_name ?? ""}
                          onChange={(e) =>
                            setEditingData((prev) =>
                              prev ? { ...prev, work_name: e.target.value } : null
                            )
                          }
                        />
                      ) : (
                        booth.work_name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          multiline
                          minRows={2}
                          value={editingData?.sales_notes ?? ""}
                          onChange={(e) =>
                            setEditingData((prev) =>
                              prev ? { ...prev, sales_notes: e.target.value } : null
                            )
                          }
                        />
                      ) : (
                        booth.sales_notes || "—"
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {isEditing ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={handleCancel}
                            disabled={updateMutation.isPending}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(booth)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
