'use client';

import * as React from 'react';
import {
  Paper, Stack, Typography, Box, Table, TableHead, TableRow, TableCell, TableBody,
  Alert, CircularProgress, Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import { fetcher } from '@/utils/fetcher';

type Payment = {
  id: number;
  course_id: number | null;
  course?: { id: number; name: string } | null;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'paid' | 'canceled';
  method?: string | null;
  paid_at?: string | null;
  reference?: string | null;
  created_at?: string | null;
  notes?: string | null;
};

type CourseOpt = { id: number; name: string };

type Props = {
  userId: number; // cliente
  token: string;  // JWT (crear requiere admin según tus rutas)
};

/* --------------------------- helpers formato --------------------------- */

const eur = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const fmtEUR = (cents: number) => eur.format((cents ?? 0) / 100);

function fmtDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Europe/Madrid',
    }).format(d);
  } catch {
    return iso;
  }
}

function StatusChip({ status }: { status: Payment['status'] }) {
  const map: Record<Payment['status'], { label: string; color: 'success'|'warning'|'error' }> = {
    pending:  { label: 'Pendiente', color: 'warning' },
    paid:     { label: 'Pagado',    color: 'success' },
    canceled: { label: 'Anulado',   color: 'error'   },
  };
  const { label, color } = map[status];
  return <Chip size="small" label={label} color={color} />;
}

/* --------------------------------- main -------------------------------- */

export default function ClientPaymentsList({ userId, token }: Props) {
  const mounted = React.useRef(false);

  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading]   = React.useState(true);
  const [err, setErr]           = React.useState<string | null>(null);

  // dialog crear
  const [openCreate, setOpenCreate] = React.useState(false);

  const safe = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (v: React.SetStateAction<T>) => { if (mounted.current) setter(v); };

  const _setPayments = safe(setPayments);
  const _setLoading  = safe(setLoading);
  const _setErr      = safe(setErr);

  const extractPaymentsArray = (res: any): Payment[] => {
    const list = Array.isArray(res) ? res : (res?.data?.data ?? res?.data ?? res?.items ?? []);
    return (Array.isArray(list) ? list : []) as Payment[];
  };

  const load = React.useCallback(async () => {
    _setLoading(true); _setErr(null);
    try {
      const res = await fetcher(['payments', 'GET', { client_id: userId, per_page: 100 }, token]);
      _setPayments(extractPaymentsArray(res));
    } catch (e: any) {
      _setErr(e?.message || 'No se pudieron cargar los pagos');
    } finally {
      _setLoading(false);
    }
  }, [userId, token]);

  React.useEffect(() => {
    mounted.current = true;
    void load();
    return () => { mounted.current = false; };
  }, [load]);

  return (
    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'common.white', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
          Pagos
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenCreate(true)}>
          Añadir
        </Button>
      </Stack>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { bgcolor: 'grey.200', color: '#111', fontWeight: 600 } }}>
              <TableCell width={80}>ID</TableCell>
              <TableCell>Curso</TableCell>
              <TableCell align="right" width={140}>Importe</TableCell>
              <TableCell width={120}>Estado</TableCell>
              <TableCell width={120}>Método</TableCell>
              <TableCell width={180}>Fecha pago</TableCell>
              <TableCell width={160}>Ref</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <CircularProgress size={18} /> Cargando…
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {!loading && payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} sx={{ color: 'text.secondary' }}>
                  Sin pagos.
                </TableCell>
              </TableRow>
            )}

            {!loading && payments.map((p) => (
              <TableRow
                key={p.id}
                hover
                sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' }, '&:hover': { bgcolor: 'grey.100' } }}
              >
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.course?.name ?? '—'}</TableCell>
                <TableCell align="right">{fmtEUR(p.amount_cents)}</TableCell>
                <TableCell><StatusChip status={p.status} /></TableCell>
                <TableCell>{p.method ?? '—'}</TableCell>
                <TableCell>{fmtDate(p.paid_at)}</TableCell>
                <TableCell>{p.reference ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      {/* diálogo inline */}
      <CreatePaymentDialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={async () => { setOpenCreate(false); await load(); }}
        userId={userId}
        token={token}
      />
    </Paper>
  );
}

/* ----------------------- Diálogo Crear Pago (inline) ---------------------- */

function CreatePaymentDialog({
  open, onClose, onCreated, userId, token,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
  userId: number;
  token: string;
}) {
  const [creating, setCreating] = React.useState(false);
  const [error, setError]       = React.useState<string | null>(null);
  const [courses, setCourses]   = React.useState<CourseOpt[]>([]);

  const [form, setForm] = React.useState({
    course_id: '' as '' | number,
    amount_eur: '',
    status: 'pending' as 'pending' | 'paid' | 'canceled',
    method: '',
    paid_at: '',
    reference: '',
    notes: '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const reset = () => {
    setError(null);
    setCreating(false);
    setForm({
      course_id: '',
      amount_eur: '',
      status: 'pending',
      method: '',
      paid_at: '',
      reference: '',
      notes: '',
    });
  };

  React.useEffect(() => {
    if (!open) { reset(); return; }
    // cargar cursos al abrir
    (async () => {
      try {
        const res = await fetcher(['courses', 'GET', { per_page: 100 }, token]);
        const arr = Array.isArray(res?.data) ? res.data
          : Array.isArray(res?.data?.data) ? res.data.data
          : Array.isArray(res) ? res : [];
        setCourses(arr.map((c: any) => ({ id: c.id, name: c.name })) as CourseOpt[]);
      } catch {
        setCourses([]);
      }
    })();
  }, [open, token]);

  const handleClose = () => {
    if (!creating) { onClose(); }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount_cents = Math.round(Number(String(form.amount_eur).replace(',', '.')) * 100);
    if (!amount_cents || amount_cents < 1) {
      setError('Indica un importe válido');
      return;
    }

    const payload: any = {
      client_id: userId,
      course_id: form.course_id === '' ? null : Number(form.course_id),
      amount_cents,
      currency: 'EUR',
      status: form.status,
      method: form.method || null,
      reference: form.reference || null,
      notes: form.notes || null,
    };
    if (form.status === 'paid') {
      payload.paid_at = form.paid_at ? new Date(form.paid_at).toISOString() : new Date().toISOString();
    }

    try {
      setCreating(true);
      await fetcher(['payments', 'POST', payload, token]);
      await onCreated();
    } catch (e: any) {
      setError(e?.message || 'No se pudo crear el pago');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Crear pago</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack component="form" onSubmit={onSubmit} spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="course-label">Curso (opcional)</InputLabel>
            <Select
              labelId="course-label"
              label="Curso (opcional)"
              name="course_id"
              value={form.course_id === '' ? '' : String(form.course_id)}
              onChange={(e) => {
                const v = e.target.value === '' ? '' : Number(e.target.value);
                setForm((s) => ({ ...s, course_id: v }));
              }}
            >
              <MenuItem value="">— Sin curso —</MenuItem>
              {courses.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Importe (€)"
            name="amount_eur"
            value={form.amount_eur}
            onChange={onChange}
            inputProps={{ inputMode: 'decimal' }}
            required
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="status-label">Estado</InputLabel>
            <Select
              labelId="status-label"
              label="Estado"
              name="status"
              value={form.status}
              onChange={onChange}
              required
            >
              <MenuItem value="pending">pending</MenuItem>
              <MenuItem value="paid">paid</MenuItem>
              <MenuItem value="canceled">canceled</MenuItem>
            </Select>
          </FormControl>

          {form.status === 'paid' && (
            <TextField
              label="Fecha de pago"
              name="paid_at"
              type="datetime-local"
              value={form.paid_at}
              onChange={onChange}
              fullWidth
              helperText="Si lo dejas vacío, se usará el momento actual"
            />
          )}

          <TextField label="Método (opcional)" name="method" value={form.method} onChange={onChange} fullWidth />
          <TextField label="Referencia (opcional)" name="reference" value={form.reference} onChange={onChange} fullWidth />
          <TextField label="Notas (opcional)" name="notes" value={form.notes} onChange={onChange} fullWidth multiline minRows={2} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={creating}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" disabled={creating}>
          {creating ? 'Creando…' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
