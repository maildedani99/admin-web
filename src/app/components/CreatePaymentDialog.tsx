'use client';

import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, TextField, MenuItem, FormControl, InputLabel, Select,
  Alert, Button
} from '@mui/material';
import { fetcher } from '@/utils/fetcher';

export type CourseOpt = { id: number; name: string };

export type CreatePaymentDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Se invoca tras crear correctamente */
  onCreated?: (createdPayment?: any) => void | Promise<void>;
  /** Cliente al que se crea el pago */
  userId: number;
  /** JWT para la llamada */
  token: string;
  /** Cursos disponibles (si no se pasa, el diálogo los cargará solo) */
  courses?: CourseOpt[];
  /** Función para cargar cursos (si no la pasas, hará GET /courses) */
  fetchCourses?: () => Promise<CourseOpt[]>;
  /** Valores por defecto opcionales */
  defaultCourseId?: number | null;
  defaultAmountEUR?: number | string;
};

export default function CreatePaymentDialog(props: CreatePaymentDialogProps) {
  const {
    open, onClose, onCreated, userId, token,
    courses: coursesProp, fetchCourses, defaultCourseId, defaultAmountEUR
  } = props;

  const [courses, setCourses] = React.useState<CourseOpt[]>(coursesProp ?? []);
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    course_id: (defaultCourseId ?? '') as '' | number,
    amount_eur: (defaultAmountEUR ?? '') as string | number,
    status: 'pending' as 'pending' | 'paid' | 'canceled',
    method: '',
    paid_at: '',
    reference: '',
    notes: '',
  });

  React.useEffect(() => {
    setForm((f) => ({
      ...f,
      course_id: (defaultCourseId ?? '') as '' | number,
      amount_eur: (defaultAmountEUR ?? '') as string | number,
    }));
  }, [defaultCourseId, defaultAmountEUR]);

  const loadCourses = React.useCallback(async () => {
    try {
      if (coursesProp && coursesProp.length) return; // ya vienen del padre
      if (fetchCourses) {
        const arr = await fetchCourses();
        setCourses(arr);
        return;
      }
      // fallback por defecto
      const res = await fetcher(['courses', 'GET', { per_page: 100 }, token]);
      const arr = Array.isArray(res?.data) ? res.data
        : Array.isArray(res?.data?.data) ? res.data.data
        : Array.isArray(res) ? res : [];
      setCourses(arr.map((c: any) => ({ id: c.id, name: c.name })) as CourseOpt[]);
    } catch {
      setCourses([]);
    }
  }, [coursesProp, fetchCourses, token]);

  React.useEffect(() => {
    setError(null);
    if (open) void loadCourses();
  }, [open, loadCourses]);

  const reset = () => {
    setError(null);
    setCreating(false);
    setForm({
      course_id: (defaultCourseId ?? '') as '' | number,
      amount_eur: (defaultAmountEUR ?? '') as string | number,
      status: 'pending',
      method: '',
      paid_at: '',
      reference: '',
      notes: '',
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleClose = () => {
    if (!creating) {
      reset();
      onClose();
    }
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
      const res = await fetcher(['payments', 'POST', payload, token]);
      if (onCreated) await onCreated(res?.data ?? res);
      handleClose();
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
