"use client";

import { useEffect, useState } from "react";
import {
  Box, Button, Grid, MenuItem, Stack, TextField, Typography, Alert,
} from "@mui/material";
import { getClientToken } from "@/lib/auth-client";
import { fetcher } from "@/utils/fetcher";

type ConfigDto = {
  price_course: number | "" | null;
  price_session: number | "" | null;
  price_booking: number | "" | null;
  stripe_default_region: "es" | "us";
};

export default function SettingsForm() {
  const API = (process.env.NEXT_PUBLIC_API_ROUTE || "").replace(/\/+$/, "");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [form, setForm] = useState<ConfigDto>({
    price_course: "",
    price_session: "",
    price_booking: "",
    stripe_default_region: "es",
  });

  // Cargar configuración actual
  useEffect(() => {
    const token = getClientToken(); // opcional: el fetcher también lo saca de storage
    if (!token) {
      setErr("No auth token found");
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await fetcher(`${API}/config`, "GET", null, token);
        setForm({
          price_course: data?.price_course ?? "",
          price_session: data?.price_session ?? "",
          price_booking: data?.price_booking ?? "",
          stripe_default_region: (data?.stripe_default_region ?? "es") as "es" | "us",
        });
      } catch (e: any) {
        setErr(e?.message || "Error cargando configuración");
      } finally {
        setLoading(false);
      }
    })();
  }, [API]);

  const onChange =
    (key: keyof ConfigDto) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setErr("");
    setOk("");

    try {
      const token = getClientToken();
      if (!token) throw new Error("No auth token found");
      setSaving(true);

      const payload = {
        ...form,
        price_course: form.price_course === "" ? null : Number(form.price_course),
        price_session: form.price_session === "" ? null : Number(form.price_session),
        price_booking: form.price_booking === "" ? null : Number(form.price_booking),
      };

      await fetcher(`${API}/config`, "PUT", payload, token);

      setOk("Configuración guardada correctamente");
    } catch (e: any) {
      setErr(e?.message || "Error guardando configuración");
    } finally {
      setSaving(false);
    }
  };

  return (
  <Box sx={{ py: 2 }}>
    <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: '#111' }}>
      Configuración (Admin)
    </Typography>

    {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
    {ok && <Alert severity="success" sx={{ mb: 2 }}>{ok}</Alert>}

    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{
        // surface clara como el resto
        bgcolor: 'common.white',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: { xs: 2, sm: 3 },

        // contraste como en tablas
        '& .MuiFormLabel-root': { color: '#111 !important' },
        '& .MuiInputBase-input': { color: '#111 !important' },
        '& .MuiSelect-select': { color: '#111 !important' },
        '& .MuiFormHelperText-root': { color: 'text.secondary !important' },

        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.300' },
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'grey.400' },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 2 },
      }}
    >
      <Stack spacing={3}>
        {/* Precios */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, color: '#111' }}>
            Precios
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                size="small"
                label="Precio curso"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                fullWidth
                value={form.price_course ?? ''}
                onChange={onChange('price_course')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                size="small"
                label="Precio sesión"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                fullWidth
                value={form.price_session ?? ''}
                onChange={onChange('price_session')}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                size="small"
                label="Precio reserva"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                fullWidth
                value={form.price_booking ?? ''}
                onChange={onChange('price_booking')}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Stripe default region */}
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 700, color: '#111' }}>
            Pasarela de pago por defecto
          </Typography>
          <TextField
            size="small"
            select
            label="Stripe predeterminado"
            fullWidth
            value={form.stripe_default_region}
            onChange={onChange('stripe_default_region')}
            disabled={loading}
          >
            <MenuItem value="es">España (Stripe ES)</MenuItem>
            <MenuItem value="us">USA (Stripe US)</MenuItem>
          </TextField>
        </Box>

        <Stack direction="row" justifyContent="flex-end">
          <Button type="submit" variant="contained" disabled={saving || loading}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  </Box>
);

}
