import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { deleteFair, fetchFair, updateBooth, ValidationError } from "../api/client";
import type { Booth, FieldErrors } from "../types";

interface EditingBooth {
  id: number;
  old_booth_number: string;
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
  const navigate = useNavigate();

  const [editing, setEditing] = useState<EditingBooth | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["fair", fairId],
    queryFn: () => fetchFair(fairId),
    enabled: Number.isFinite(fairId),
  });

  const updateMutation = useMutation({
    mutationFn: (params: {
      fairId: number;
      oldBoothNumber: string;
      payload: {
        booth_number: string;
        work_name: string;
        sales_notes: string;
      };
    }) => updateBooth(params.fairId, params.oldBoothNumber, params.payload),
    onSuccess: () => {
      setSnackbar({
        open: true,
        message: "保存成功",
        severity: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["fair", fairId] });
      setEditing(null);
      setTouched({});
      setServerErrors({});
    },
    onError: (err: Error) => {
      if (err instanceof ValidationError) {
        setServerErrors(err.details);
      } else {
        setSnackbar({
          open: true,
          message: err.message || "保存失败",
          severity: "error",
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteFair(fairId),
    onSuccess: (res) => {
      setSnackbar({
        open: true,
        message: res.message,
        severity: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["fairs"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.removeQueries({ queryKey: ["fair", fairId] });
      setDeleteDialogOpen(false);
      setTimeout(() => navigate("/"), 500);
    },
    onError: (err: Error) => {
      setSnackbar({
        open: true,
        message: err.message || "删除失败",
        severity: "error",
      });
      setDeleteDialogOpen(false);
    },
  });

  const handleEdit = (booth: Booth) => {
    if (editing !== null) return;
    setEditing({
      id: booth.id,
      old_booth_number: booth.booth_number,
      booth_number: booth.booth_number,
      work_name: booth.work_name,
      sales_notes: booth.sales_notes,
    });
    setTouched({});
    setServerErrors({});
  };

  const handleCancel = () => {
    setEditing(null);
    setTouched({});
    setServerErrors({});
  };

  const boothNumberTouched = touched.booth_number || !!serverErrors.booth_number;
  const workNameTouched = touched.work_name || !!serverErrors.work_name;

  const boothNumberError =
    editing && boothNumberTouched && !editing.booth_number.trim()
      ? "摊位号不能为空"
      : serverErrors.booth_number ?? "";
  const workNameError =
    editing && workNameTouched && !editing.work_name.trim()
      ? "作品名不能为空"
      : serverErrors.work_name ?? "";

  const formValid =
    editing !== null &&
    !!editing.booth_number.trim() &&
    !!editing.work_name.trim();

  const handleSave = () => {
    if (!editing) return;
    setTouched({ booth_number: true, work_name: true });
    setServerErrors({});
    if (!formValid) return;
    updateMutation.mutate({
      fairId,
      oldBoothNumber: editing.old_booth_number,
      payload: {
        booth_number: editing.booth_number.trim(),
        work_name: editing.work_name.trim(),
        sales_notes: editing.sales_notes,
      },
    });
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
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
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
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
            disabled={editing !== null || deleteMutation.isPending}
          >
            删除市集
          </Button>
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
                const isEditing = editing?.id === booth.id;
                return (
                  <TableRow key={booth.id} hover>
                    <TableCell>
                      {isEditing ? (
                        <TextField
                          size="small"
                          fullWidth
                          required
                          label="摊位号"
                          value={editing.booth_number}
                          onChange={(e) => {
                            setEditing((prev) =>
                              prev ? { ...prev, booth_number: e.target.value } : null,
                            );
                            if (serverErrors.booth_number)
                              setServerErrors((s) => ({ ...s, booth_number: "" }));
                          }}
                          onBlur={() => setTouched((t) => ({ ...t, booth_number: true }))}
                          error={!!boothNumberError}
                          helperText={boothNumberError}
                          disabled={updateMutation.isPending}
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
                          required
                          label="作品名"
                          value={editing.work_name}
                          onChange={(e) => {
                            setEditing((prev) =>
                              prev ? { ...prev, work_name: e.target.value } : null,
                            );
                            if (serverErrors.work_name)
                              setServerErrors((s) => ({ ...s, work_name: "" }));
                          }}
                          onBlur={() => setTouched((t) => ({ ...t, work_name: true }))}
                          error={!!workNameError}
                          helperText={workNameError}
                          disabled={updateMutation.isPending}
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
                          label="销量备注"
                          value={editing.sales_notes}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev ? { ...prev, sales_notes: e.target.value } : null,
                            )
                          }
                          disabled={updateMutation.isPending}
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
                            disabled={updateMutation.isPending || !formValid}
                            aria-label="保存"
                          >
                            {updateMutation.isPending ? (
                              <CircularProgress size={16} />
                            ) : (
                              <CheckIcon fontSize="small" />
                            )}
                          </IconButton>
                          <IconButton
                            size="small"
                            color="default"
                            onClick={handleCancel}
                            disabled={updateMutation.isPending}
                            aria-label="取消"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      ) : (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(booth)}
                          disabled={editing !== null}
                          aria-label={`编辑摊位 ${booth.booth_number}`}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteMutation.isPending && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <DialogContentText>
            确定要删除市集「{data?.name}」吗？此操作将同时删除该届市集的全部 {data?.booths.length ?? 0} 个摊位记录，且无法恢复。
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteMutation.isPending}
          >
            取消
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            startIcon={
              deleteMutation.isPending ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteIcon fontSize="small" />
              )
            }
          >
            {deleteMutation.isPending ? "删除中..." : "确认删除"}
          </Button>
        </DialogActions>
      </Dialog>

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
