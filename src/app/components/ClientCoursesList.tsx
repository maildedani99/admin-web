// src/components/ClientCoursesList.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Typography, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { fetcher } from '@/utils/fetcher';

type CourseDTO = { id: number; name: string; price_cents?: number | null };
type BalanceRow = {
  course_id: number;
  course: string;
  price_cents: number;
  paid_cents: number;
  remaining_cents: number;
  is_paid: boolean;
};
type BalancePayload = { courses: BalanceRow[] };

function centsToEUR(cents?: number | null) {
  const n = Number(cents ?? 0);
  return (n / 100).toFixed(2);
}
function eurToCents(eur: string | number) {
  const v = typeof eur === 'string' ? eur.replace(',', '.') : eur;
  const n = Number(v || 0);
  return Math.round(n * 100);
}

type Props = {
  userId: number;
  token: string | null;
  onChanged?: () => void;
};

export default function ClientCoursesList({ userId, token, onChanged }: Props) {
  const [courses, setCourses] = useState<CourseDTO[]>([]);
  const [balance, setBalance] = useState<BalancePayload | null>(null);
  const [open, setOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  // modal state (sin buscador)
  const [courseOptions, setCourseOptions] = useState<CourseDTO[]>([]);
  const [selCourseId, setSelCourseId] = useState<number | ''>('');
  const [priceEur, setPriceEur] = useState('');
  const [status, setStatus] = useState<'active' | 'completed' | 'cancelled'>('active');
  const [saving, setSaving] = useState(false);

  const loadUserCourses = async () => {
    if (!token) return;
    setLoadingList(true);
    try {
      const user = await fetcher([`users/${userId}`, 'GET', null, token]);
      setCourses((user?.courses ?? []) as CourseDTO[]);
    } catch {
      /* noop */
    } finally {
      setLoadingList(false);
    }

    try {
      const res = await fetcher([`users/${userId}/balances`, 'GET', null, token]);
      setBalance((res?.data ?? res) as BalancePayload);
    } catch {
      setBalance(null);
    }
  };

  useEffect(() => {
    void loadUserCourses();
  }, [userId, token]);

  const balMap = useMemo(() => {
    const m = new Map<number, BalanceRow>();
    (balance?.courses ?? []).forEach(b => m.set(b.course_id, b));
    return m;
  }, [balance]);

  const openModal = async () => {
    setOpen(true);
    if (!token) return;
    try {
      // Carga simple sin q/buscador
      const r = await fetcher([`courses`, 'GET', { per_page: 100 }, token]);
      const items = (r?.data?.data ?? r?.data ?? r) as any[];
      setCourseOptions(
        Array.isArray(items)
          ? items.map((c: any) => ({ id: c.id, name: c.name, price_cents: c.price_cents }))
          : []
      );
    } catch {
      setCourseOptions([]);
    }
  };

  const submit = async () => {
    if (!token || !selCourseId) return;
    setSaving(true);
    try {
      await fetcher([
        `courses/${selCourseId}/enroll`,
        'POST',
        { user_id: userId, status, price_cents: priceEur ? eurToCents(priceEur) : null },
        token,
      ]);
      setOpen(false);
      setSelCourseId('');
      setPriceEur('');
      setStatus('active');
      await loadUserCourses();
      onChanged?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>Cursos inscritos</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openModal}>
          Añadir curso
        </Button>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width={90} sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Nombre</TableCell>
              <TableCell align="right" width={120} sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Precio (€)</TableCell>
              <TableCell align="right" width={120} sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Pagado (€)</TableCell>
              <TableCell align="right" width={130} sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Pendiente (€)</TableCell>
              <TableCell align="center" width={120} sx={{ bgcolor: 'grey.50', fontWeight: 600 }}>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(!courses || courses.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {loadingList ? 'Cargando…' : 'Sin cursos.'}
                </TableCell>
              </TableRow>
            )}
            {courses.map((c) => {
              const b = balMap.get(c.id);
              const price = b?.price_cents ?? c.price_cents ?? 0;
              const paid = b?.paid_cents ?? 0;
              const remaining = Math.max(0, price - paid);
              const isPaid = b?.is_paid ?? (price > 0 && paid >= price);
              return (
                <TableRow key={c.id} hover sx={{ '&:hover': { bgcolor: 'grey.100' } }}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell align="right">{centsToEUR(price)}</TableCell>
                  <TableCell align="right">{centsToEUR(paid)}</TableCell>
                  <TableCell align="right">{centsToEUR(remaining)}</TableCell>
                  <TableCell align="center">
                    {isPaid ? (
                      <Chip icon={<CheckCircleIcon />} label="Pagado" color="success" size="small" />
                    ) : (
                      <Chip icon={<HourglassBottomIcon />} label="Pendiente" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal (sin buscador) */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>Añadir curso</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              required
              label="Curso*"
              value={selCourseId}
              onChange={(e) => {
                const v = e.target.value;
                setSelCourseId(v === '' ? '' : Number(v));
              }}
            >
              {courseOptions.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}{c.price_cents ? ` — ${centsToEUR(c.price_cents)} €` : ''}
                </MenuItem>
              ))}
            </TextField>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Precio personalizado (opcional)"
                value={priceEur}
                onChange={(e) => setPriceEur(e.target.value)}
                fullWidth
                InputProps={{ endAdornment: <span style={{ paddingRight: 8 }}>€</span> as any }}
              />
              <TextField
                select
                label="Estado matrícula"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                fullWidth
              >
                <MenuItem value="active">activa</MenuItem>
                <MenuItem value="completed">completada</MenuItem>
                <MenuItem value="cancelled">cancelada</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>Cancelar</Button>
          <Button variant="contained" onClick={submit} disabled={!selCourseId || saving}>
            {saving ? 'Asignando…' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
