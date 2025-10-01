"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Card, CardHeader, CardContent, CardActions,
  Grid, TextField, MenuItem, Button, Stack, FormControlLabel, Checkbox, Switch
} from "@mui/material";

export const COUNTRIES = ["España", "Argentina", "México", "Chile", "Colombia", "Perú"];

export type ClientFormValues = {
  // Datos básicos (requeridos por BE)
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  password_confirmation: string;

  // Contacto/Dirección (opcionales si no los usas en users)
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;

  // Identificación y control
  dni?: string;

  // Campos de estado/negocio del BE
  role: "client" | "teacher" | "admin";
  isActive: boolean;
  status: "active" | "pending" | "blocked";

  coursePriceCents?: number | null;
  tutor_id?: number | null;

  depositStatus: "pending" | "paid" | "waived";
  finalPayment: "pending" | "paid" | "waived";
  contractSigned: boolean;
};

type Props = {
  title?: string;                          // 👈 título en el Card
  mode: "create" | "update";
  initialData?: Partial<ClientFormValues> | null;
  loading?: boolean;
  onSubmit: (values: ClientFormValues) => Promise<void> | void;
  onCancel: () => void;
};

const ROLE_OPTIONS = ["client", "teacher", "admin"] as const;
const STATUS_OPTIONS = ["active", "pending", "blocked"] as const;
const PAYMENT_OPTIONS = ["pending", "paid", "waived"] as const;

export default function ClientForm({
  title = "Cliente",
  mode,
  initialData,
  loading,
  onSubmit,
  onCancel,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    defaultValues: {
      // requeridos por register
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      password_confirmation: "",

      // opcionales
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      country: "España",
      dni: "",

      // negocio/estado
      role: "client",
      isActive: true,
      status: "active",
      coursePriceCents: 0,
      tutor_id: null,

      depositStatus: "pending",
      finalPayment: "pending",
      contractSigned: false,
    },
  });

  useEffect(() => {
    if (initialData) reset({ ...initialData } as ClientFormValues);
    if (initialData === null) reset();
  }, [initialData, reset]);

  const disabled = loading || isSubmitting;

  return (
    <Card elevation={3} sx={{ maxWidth: 1024, mx: "auto" }} component="form" onSubmit={handleSubmit(onSubmit)}>
      <CardHeader
        title={mode === "create" ? `Nuevo ${title.toLowerCase()}` : `Editar ${title.toLowerCase()}`}
        sx={{ "& .MuiCardHeader-title": { fontSize: 22, fontWeight: 700 }, pb: 1.5 }}
      />

      <CardContent sx={{ pt: 0, px: { xs: 2.5, sm: 3.5 }, pb: 2.5 }}>
        <Grid container spacing={2.5}>
          {/* Identificación */}
          <Grid item xs={12} md={4}>
            <TextField
              label="Nombre"
              fullWidth
              size="small"
              {...register("firstName", { required: "El nombre es obligatorio" })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Apellidos"
              fullWidth
              size="small"
              {...register("lastName", { required: "Los apellidos son obligatorios" })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              size="small"
              {...register("email", {
                required: "El email es obligatorio",
                pattern: { value: /\S+@\S+\.\S+/, message: "Email inválido" },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={disabled}
            />
          </Grid>

          {/* Seguridad */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Contraseña"
              type="password"
              fullWidth
              size="small"
              {...register("password", { required: "La contraseña es obligatoria" })}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Confirmar contraseña"
              type="password"
              fullWidth
              size="small"
              {...register("password_confirmation", { required: "Confirma la contraseña" })}
              error={!!errors.password_confirmation}
              helperText={errors.password_confirmation?.message}
              disabled={disabled}
            />
          </Grid>

          {/* Contacto/Dirección */}
          <Grid item xs={12} md={4}>
            <TextField
              label="Teléfono"
              fullWidth
              size="small"
              {...register("phone")}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="DNI"
              fullWidth
              size="small"
              {...register("dni")}
              error={!!errors.dni}
              helperText={errors.dni?.message}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="País"
              select
              fullWidth
              size="small"
              defaultValue="España"
              {...register("country")}
              error={!!errors.country}
              helperText={errors.country?.message}
              disabled={disabled}
            >
              {COUNTRIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Dirección"
              fullWidth
              size="small"
              {...register("address")}
              error={!!errors.address}
              helperText={errors.address?.message}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Ciudad"
              fullWidth
              size="small"
              {...register("city")}
              error={!!errors.city}
              helperText={errors.city?.message}
              disabled={disabled}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Código Postal"
              fullWidth
              size="small"
              {...register("postalCode")}
              error={!!errors.postalCode}
              helperText={errors.postalCode?.message}
              disabled={disabled}
            />
          </Grid>

          {/* Estado/negocio */}
          <Grid item xs={12} md={4}>
            <TextField
              label="Rol"
              select
              fullWidth
              size="small"
              {...register("role", { required: true })}
              disabled={disabled}
            >
              {ROLE_OPTIONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Status"
              select
              fullWidth
              size="small"
              {...register("status", { required: true })}
              disabled={disabled}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={<Switch size="small" {...register("isActive")} disabled={disabled} />}
              label="Activo"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Precio del curso (céntimos)"
              type="number"
              fullWidth
              size="small"
              {...register("coursePriceCents", {
                setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                min: { value: 0, message: "No puede ser negativo" },
              })}
              error={!!errors.coursePriceCents}
              helperText={errors.coursePriceCents?.message}
              disabled={disabled}
              inputProps={{ step: 100 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Tutor ID"
              type="number"
              fullWidth
              size="small"
              {...register("tutor_id", {
                setValueAs: (v) => (v === "" || v === null ? null : Number(v)),
                min: { value: 1, message: "Debe ser un ID válido o vacío" },
              })}
              error={!!errors.tutor_id}
              helperText={errors.tutor_id?.message || "Opcional"}
              disabled={disabled}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label="Estado del depósito"
              select
              fullWidth
              size="small"
              {...register("depositStatus", { required: true })}
              disabled={disabled}
            >
              {PAYMENT_OPTIONS.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Pago final"
              select
              fullWidth
              size="small"
              {...register("finalPayment", { required: true })}
              disabled={disabled}
            >
              {PAYMENT_OPTIONS.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={<Checkbox {...register("contractSigned")} disabled={disabled} />}
              label="Contrato firmado"
            />
          </Grid>
        </Grid>
      </CardContent>

      <CardActions sx={{ px: { xs: 2.5, sm: 3.5 }, pb: 2.5 }}>
        <Stack direction="row" spacing={1} sx={{ width: "100%", justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={onCancel} disabled={disabled}>
            Cancelar
          </Button>
          <Button variant="contained" type="submit" disabled={disabled}>
            {mode === "create" ? "Crear cliente" : "Actualizar cliente"}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
