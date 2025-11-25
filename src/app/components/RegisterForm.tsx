'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import {
  Box, Paper, Typography, Alert, Grid, TextField, MenuItem, Button,
} from '@mui/material';
import { fetcher } from '@/utils/fetcher';
// usa tu fetcher centralizado

type Role = 'admin' | 'teacher' | 'client';

type RegisterFormState = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  password: string;
  repeatPassword: string;
  phone: string;
  dni: string;
  birthDate: string;   // yyyy-mm-dd
  province: string;
  postalCode: string;
  address: string;
  city: string;
  country: string;
};

type FieldErrors = Partial<Record<keyof RegisterFormState | 'password_confirmation', string>>;

const COUNTRIES = ['España', 'Argentina', 'México'];

const initialState: RegisterFormState = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'client',
  password: '',
  repeatPassword: '',
  phone: '',
  dni: '',
  birthDate: '',
  province: '',
  postalCode: '',
  address: '',
  city: '',
  country: 'España',
};

export default function AdminCreateUserForm() {
  const [form, setForm] = useState<RegisterFormState>(initialState);
  const [formErrors, setFormErrors] = useState<FieldErrors>({});
  const [topError, setTopError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setForm((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: '' }));
    setTopError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setTopError('');
    setSuccessMsg('');
    setFormErrors({});

    // Validación rápida cliente
    if (form.password !== form.repeatPassword) {
      setFormErrors((p) => ({ ...p, repeatPassword: 'Las contraseñas no coinciden' }));
      return;
    }

    setLoading(true);
    try {
      // ⚠️ Usa snake_case típico de Laravel; ajusta si tu API espera camelCase
      const payload = {
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role,
        password: form.password,
        password_confirmation: form.repeatPassword,
        phone: form.phone.replace(/\s+/g, ''),
        dni: form.dni.trim().toUpperCase(),
        birth_date: form.birthDate,
        province: form.province.trim(),
        postal_code: form.postalCode.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        country: form.country,
        is_active: true,
      };

      // fetcher firma: fetcher(url, method?, body?, auth?)
      await fetcher('/users', 'POST', payload);

      setSuccessMsg('Usuario creado correctamente.');
      setForm(initialState);
    } catch (err: any) {
      // tu fetcher lanza Error con { status, errors }
      if (err?.status === 422 && err?.errors) {
        const fe: FieldErrors = {};
        Object.entries(err.errors).forEach(([k, v]: any) => {
          const msg = Array.isArray(v) ? String(v[0]) : String(v);
          // mapea claves de backend → estado del form
          const map: Record<string, keyof RegisterFormState> = {
            first_name: 'firstName',
            last_name: 'lastName',
            password_confirmation: 'repeatPassword',
            birth_date: 'birthDate',
            postal_code: 'postalCode',
          };
          const key = (map[k] ?? k) as keyof RegisterFormState;
          (fe as any)[key] = msg;
        });
        setFormErrors(fe);
        setTopError('Revisa los campos marcados.');
      } else {
        setTopError(err?.message || 'No se pudo crear el usuario.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ px: 0, py: 0 }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 880,
          mx: 'auto',
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          bgcolor: 'common.white',
          border: '1px solid',
          borderColor: 'divider',

          // Contraste como en tablas
          '& .MuiFormLabel-root': { color: '#111 !important' },
          '& .MuiInputBase-input': { color: '#111 !important' },
          '& .MuiSelect-select': { color: '#111 !important' },
          '& .MuiFormHelperText-root': { color: 'text.secondary !important' },

          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.300' },
          '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'grey.400',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'primary.main',
            borderWidth: 2,
          },

          '& .MuiInputAdornment-root, & .MuiSvgIcon-root': { color: 'grey.700' },
          '& input::placeholder': { color: 'grey.600', opacity: 1 },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111', mb: 2 }}>
          Registro de usuario
        </Typography>

        {topError && <Alert severity="error" sx={{ mb: 2 }}>{topError}</Alert>}
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}

        <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
         <Grid container spacing={2}>
  {/* Fila 1: 3 columnas */}
  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      size="small"
      name="firstName"
      label="Nombre"
      fullWidth
      required
      value={form.firstName}
      onChange={handleChange}
      error={!!formErrors.firstName}
      helperText={formErrors.firstName}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      size="small"
      name="lastName"
      label="Apellidos"
      fullWidth
      required
      value={form.lastName}
      onChange={handleChange}
      error={!!formErrors.lastName}
      helperText={formErrors.lastName}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      size="small"
      name="email"
      label="Correo electrónico"
      type="email"
      fullWidth
      required
      value={form.email}
      onChange={handleChange}
      error={!!formErrors.email}
      helperText={formErrors.email}
    />
  </Grid>

  {/* Fila 2: 4 columnas */}
  <Grid size={{ xs: 12, md: 3 }}>
    <TextField
      size="small"
      name="role"
      label="Rol"
      select
      fullWidth
      required
      value={form.role}
      onChange={handleChange}
      error={!!(formErrors as any).role}
      helperText={(formErrors as any).role}
    >
      <MenuItem value="admin">admin</MenuItem>
      <MenuItem value="teacher">teacher</MenuItem>
      <MenuItem value="client">client</MenuItem>
    </TextField>
  </Grid>

  <Grid size={{ xs: 12, md: 3 }}>
    <TextField
      size="small"
      name="password"
      label="Contraseña"
      type="password"
      fullWidth
      required
      value={form.password}
      onChange={handleChange}
      error={!!formErrors.password}
      helperText={formErrors.password}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 3 }}>
    <TextField
      size="small"
      name="repeatPassword"
      label="Repetir contraseña"
      type="password"
      fullWidth
      required
      value={form.repeatPassword}
      onChange={handleChange}
      error={!!formErrors.repeatPassword}
      helperText={formErrors.repeatPassword}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 3 }}>
    <TextField
      size="small"
      name="birthDate"
      label="Fecha de nacimiento"
      type="date"
      fullWidth
      required
      value={form.birthDate}
      onChange={handleChange}
      error={!!formErrors.birthDate}
      helperText={formErrors.birthDate}
      InputLabelProps={{ shrink: true }}
    />
  </Grid>

  {/* Fila 3 */}
  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      size="small"
      name="phone"
      label="Teléfono"
      fullWidth
      required
      value={form.phone}
      onChange={handleChange}
      error={!!formErrors.phone}
      helperText={formErrors.phone}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      size="small"
      name="dni"
      label="DNI/NIE"
      fullWidth
      required
      value={form.dni}
      onChange={handleChange}
      error={!!formErrors.dni}
      helperText={formErrors.dni}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      size="small"
      name="address"
      label="Dirección"
      fullWidth
      required
      value={form.address}
      onChange={handleChange}
      error={!!formErrors.address}
      helperText={formErrors.address}
    />
  </Grid>

  {/* Fila 4 */}
  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      size="small"
      name="province"
      label="Provincia"
      fullWidth
      required
      value={form.province}
      onChange={handleChange}
      error={!!formErrors.province}
      helperText={formErrors.province}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      size="small"
      name="postalCode"
      label="Código Postal"
      fullWidth
      required
      value={form.postalCode}
      onChange={handleChange}
      error={!!formErrors.postalCode}
      helperText={formErrors.postalCode}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      size="small"
      name="city"
      label="Ciudad"
      fullWidth
      required
      value={form.city}
      onChange={handleChange}
      error={!!formErrors.city}
      helperText={formErrors.city}
    />
  </Grid>

  {/* Fila 5: País */}
  <Grid size={{ xs: 12, md: 4 }}>
    <TextField
      size="small"
      name="country"
      label="País"
      select
      fullWidth
      value={form.country}
      onChange={handleChange}
      error={!!formErrors.country}
      helperText={formErrors.country}
    >
      {COUNTRIES.map((c) => (
        <MenuItem key={c} value={c}>
          {c}
        </MenuItem>
      ))}
    </TextField>
  </Grid>

  <Grid size={{ xs: 12, md: 8 }} />
</Grid>


          {/* Botón */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                px: 3.5,
                py: 1,
                fontWeight: 'bold',
                backgroundColor: '#ef4444',
                ':hover': { backgroundColor: '#dc2626' },
              }}
            >
              {loading ? 'Procesando…' : 'Registrarse'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
