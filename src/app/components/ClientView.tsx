'use client';

import { useEffect, useState, useCallback, ChangeEvent } from 'react';
import {
  Box, Card, CardHeader, CardContent, CardActions,
  Grid, TextField, Button, Stack, Divider, Switch, FormControlLabel, Alert,
  MenuItem, Typography
} from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { fetcher } from '@/utils/fetcher';
import { getClientToken } from '@/lib/auth-client';
import ClientCoursesList from './ClientCoursesList';
import ClientPaymentsList from './ClientPaymentsList';

type Role = 'admin' | 'teacher' | 'client';
type Status = 'active' | 'pending' | 'blocked';

type UserDTO = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  country: string | null;
  dni: string | null;
  role: Role;
  isActive: boolean;
  status: Status;
};

const ROLE_OPTIONS: Role[] = ['admin', 'teacher', 'client'];
const STATUS_OPTIONS: Status[] = ['active', 'pending', 'blocked'];

type Props = { id: number | string };

function normalizeFromApi(u: any): UserDTO {
  return {
    id: Number(u?.id),
    firstName: u?.firstName ?? '',
    lastName:  u?.lastName  ?? '',
    email:     u?.email     ?? '',
    phone:     u?.phone     ?? null,
    address:   u?.address   ?? null,
    city:      u?.city      ?? null,
    postalCode:u?.postalCode?? null,
    country:   u?.country   ?? null,
    dni:       u?.dni       ?? null,
    role:      (u?.role as Role) ?? 'client',
    isActive:  !!u?.isActive,
    status:    (u?.status as Status) ?? 'pending',
  };
}

const toNull = (v: any) => {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
};

export default function ClientView({ id }: Props) {
  const token = getClientToken();
  const [data, setData] = useState<UserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setErr('No autenticado.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    setOk(null);
    try {
      const res = await fetcher([`users/${id}`, 'GET', null, token]);
      setData(normalizeFromApi(res));
    } catch (e: any) {
      setErr(e?.message || 'No se pudo cargar el usuario');
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { void load(); }, [load]);

  const setField =
    <K extends keyof UserDTO>(key: K) =>
    (ev: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setData((d) => (d ? { ...d, [key]: ev.target.value } as UserDTO : d));

  const setBool =
    (key: keyof UserDTO) =>
    (_ev: ChangeEvent<HTMLInputElement>, checked: boolean) =>
      setData((d) => (d ? { ...d, [key]: checked } as UserDTO : d));

  const handleCancel = () => { setEdit(false); void load(); };

  const handleSave = async () => {
    if (!data || !token) return;
    setSaving(true);
    setErr(null);
    setOk(null);
    try {
      const payload: Record<string, any> = {
        firstName: toNull(data.firstName),
        lastName:  toNull(data.lastName),
        email:     toNull(data.email)?.toLowerCase(),
        phone:     toNull(data.phone),
        address:   toNull(data.address),
        city:      toNull(data.city),
        postalCode:toNull(data.postalCode),
        country:   toNull(data.country),
        dni:       toNull(data.dni),
        role:      data.role,
        isActive:  !!data.isActive,
        status:    data.status,
      };

      Object.keys(payload).forEach(
        (k) => payload[k] == null && delete payload[k]
      );

      const updated = await fetcher([`users/${id}`, 'PUT', payload, token]);
      setData(normalizeFromApi(updated));
      setEdit(false);
      setOk('Usuario actualizado');
    } catch (e: any) {
      const apiErrors = e?.errors;
      const msg = apiErrors
        ? Object.entries(apiErrors)
            .map(([k, v]: any) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
            .join(' · ')
        : (e?.message || 'Error guardando usuario');
      setErr(msg);
    } finally { setSaving(false); }
  };

  if (!token) {
    return <Alert severity="error">No autenticado. Inicia sesión de nuevo.</Alert>;
  }

  if (loading) return <Box sx={{ p: 2 }}>Cargando…</Box>;

  return (
    <Card
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        borderRadius: 3,
        bgcolor: 'common.white',
        color: 'text.primary',
        boxShadow: 0,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardHeader
        title="Cliente"
        sx={{
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '.MuiCardHeader-title': {
            fontSize: 22,
            fontWeight: 700,
            color: 'text.primary',
          },
        }}
      />

      <CardContent sx={{ pt: 2 }}>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        {ok && <Alert severity="success" sx={{ mb: 2 }}>{ok}</Alert>}

        <Typography
          variant="subtitle1"
          sx={{ mb: 1.5, fontWeight: 700, color: 'text.primary' }}
        >
          Datos del cliente
        </Typography>

        {/* ==== GRID CORREGIDO ==== */}
                {/* Datos del cliente */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Nombre"
              fullWidth
              value={data?.firstName ?? ''}
              onChange={setField('firstName')}
              InputProps={{ readOnly: !edit }}
              sx={{
                '& .MuiInputBase-root': { bgcolor: 'common.white' },
                ...(edit && {
                  '& .MuiOutlinedInput-root': {
                    boxShadow: '0 0 0 1px rgba(239,68,68,.35) inset',
                  },
                }),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Apellidos"
              fullWidth
              value={data?.lastName ?? ''}
              onChange={setField('lastName')}
              InputProps={{ readOnly: !edit }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'common.white' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label="Email"
              fullWidth
              value={data?.email ?? ''}
              onChange={setField('email')}
              InputProps={{ readOnly: !edit }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'common.white' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="DNI/NIE"
              fullWidth
              value={data?.dni ?? ''}
              onChange={setField('dni')}
              InputProps={{ readOnly: !edit }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'common.white' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Teléfono"
              fullWidth
              value={data?.phone ?? ''}
              onChange={setField('phone')}
              InputProps={{ readOnly: !edit }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'common.white' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Ciudad"
              fullWidth
              value={data?.city ?? ''}
              onChange={setField('city')}
              InputProps={{ readOnly: !edit }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'common.white' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="CP"
              fullWidth
              value={data?.postalCode ?? ''}
              onChange={setField('postalCode')}
              InputProps={{ readOnly: !edit }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'common.white' } }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Dirección"
              fullWidth
              value={data?.address ?? ''}
              onChange={setField('address')}
              InputProps={{ readOnly: !edit }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'common.white' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="País"
              fullWidth
              value={data?.country ?? ''}
              onChange={setField('country')}
              InputProps={{ readOnly: !edit }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'common.white' } }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Rol"
              select
              fullWidth
              value={data?.role ?? 'client'}
              onChange={setField('role')}
              disabled={!edit}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'common.white' } }}
            >
              {ROLE_OPTIONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Status"
              select
              fullWidth
              value={data?.status ?? 'active'}
              onChange={setField('status')}
              disabled={!edit}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'common.white' } }}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={!!data?.isActive}
                  onChange={setBool('isActive')}
                  disabled={!edit}
                />
              }
              label="Activo"
            />
          </Grid>
        </Grid>


        <Divider sx={{ my: 3 }} />

        <ClientCoursesList
          userId={Number(id)}
          token={token}
          onChanged={() => {
            void load();
          }}
        />

        <Divider sx={{ my: 3 }} />

        <ClientPaymentsList userId={Number(id)} token={token} />
      </CardContent>

      <CardActions
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" spacing={1} ml="auto">
          {!edit ? (
            <>
              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                onClick={() => {
                  void load();
                }}
              >
                Refrescar
              </Button>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                onClick={() => setEdit(true)}
              >
                Editar
              </Button>
            </>
          ) : (
            <>
              <Button
                startIcon={<CloseIcon />}
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                startIcon={<SaveIcon />}
                variant="contained"
                onClick={handleSave}
                disabled={saving}
              >
                Guardar
              </Button>
            </>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}
