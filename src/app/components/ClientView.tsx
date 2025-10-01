// src/components/clientView.tsx
"use client";

import { useState, useEffect, useCallback, ChangeEvent } from "react";
import {
  Card, CardHeader, CardContent, CardActions,
  Grid, TextField, Button, Stack, Divider, Switch, FormControlLabel,
  Table, TableHead, TableRow, TableCell, TableBody, MenuItem, Alert
} from "@mui/material";
import { fetcher } from "@/utils/fetcher";

type Role = "admin" | "teacher" | "client";
type Status = "active" | "pending" | "blocked";
type PayStatus = "pending" | "paid" | "failed" | "refunded";

type CourseDTO = { id: number; name: string; price_cents: number };
type PaymentDTO = {
  id: number;
  course_id: number | null;
  course: CourseDTO | null;
  amount_cents: number;
  currency: string;
  status: PayStatus;
  method?: string | null;
  paid_at?: string | null;
  reference?: string | null;
  notes?: string | null;
  createdAt?: string | null;
};

type UserDTO = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  dni?: string | null;
  role: Role;
  isActive: boolean;
  status: Status;
  tutor_id?: number | null;
  createdAt?: string | null;
  tutor?: { id: number; firstName: string; lastName: string; email: string } | null;
  courses?: CourseDTO[];
  payments?: PaymentDTO[];
};

const ROLE_OPTIONS: Role[] = ["admin", "teacher", "client"];
const STATUS_OPTIONS: Status[] = ["active", "pending", "blocked"];

function centsToEUR(cents?: number | null) {
  const n = Number(cents ?? 0);
  return (n / 100).toFixed(2);
}

type Props = {
  id: number | string;
  onSaved?: (u: UserDTO) => void;
  onError?: (msg: string) => void;
};

export default function ClientView({ id, onSaved, onError }: Props) {
  const [data, setData] = useState<UserDTO | null>(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher([`users/${id}`, "GET"]);
      setData(res as UserDTO);
    } catch (e: any) {
      const msg = e?.message ?? "No se pudo cargar el usuario";
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [id, onError]);

  useEffect(() => {
    void load();
  }, [load]);

  const setField =
    <K extends keyof UserDTO>(key: K) =>
    (ev: ChangeEvent<HTMLInputElement>) =>
      setData((d) => (d ? { ...d, [key]: ev.target.value } : d));

  const setBool =
    (key: keyof UserDTO) =>
    (ev: ChangeEvent<HTMLInputElement>) =>
      setData((d) => (d ? { ...d, [key]: ev.target.checked } : d));

  const handleCancel = () => {
    setEdit(false);
    void load();
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
        postalCode: data.postalCode ?? "",
        country: data.country ?? "",
        dni: data.dni ?? "",
        role: data.role,
        isActive: !!data.isActive,
        status: data.status,
        tutor_id: data.tutor_id ?? null,
      };
      const updated = await fetcher([`users/${id}`, "PUT", payload]);
      setData(updated as UserDTO);
      setEdit(false);
      onSaved?.(updated as UserDTO);
    } catch (e: any) {
      const msg = e?.message ?? "Error guardando usuario";
      setError(msg);
      onError?.(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>;

  return (
    <Card sx={{ maxWidth: 1100, mx: "auto" }}>
      <CardHeader title={data ? `Cliente #${data.id}` : "Cliente"} />
      <CardContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Datos personales */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField label="Nombre" fullWidth value={data?.firstName ?? ""} onChange={setField("firstName")} disabled={!edit}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Apellidos" fullWidth value={data?.lastName ?? ""} onChange={setField("lastName")} disabled={!edit}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField label="Email" fullWidth value={data?.email ?? ""} onChange={setField("email")} disabled={!edit}/>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField label="DNI" fullWidth value={data?.dni ?? ""} onChange={setField("dni")} disabled={!edit}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Teléfono" fullWidth value={data?.phone ?? ""} onChange={setField("phone")} disabled={!edit}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="Ciudad" fullWidth value={data?.city ?? ""} onChange={setField("city")} disabled={!edit}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField label="CP" fullWidth value={data?.postalCode ?? ""} onChange={setField("postalCode")} disabled={!edit}/>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Dirección" fullWidth value={data?.address ?? ""} onChange={setField("address")} disabled={!edit}/>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField label="País" fullWidth value={data?.country ?? ""} onChange={setField("country")} disabled={!edit}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Rol"
              select
              fullWidth
              value={data?.role ?? "client"}
              onChange={setField("role")}
              disabled={!edit}
            >
              {ROLE_OPTIONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Status"
              select
              fullWidth
              value={data?.status ?? "active"}
              onChange={setField("status")}
              disabled={!edit}
            >
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={<Switch checked={!!data?.isActive} onChange={setBool("isActive")} disabled={!edit} />}
              label="Activo"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Cursos */}
        <h3>Cursos inscritos</h3>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell align="right">Precio (€)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.courses ?? []).map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell align="right">{centsToEUR(c.price_cents)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Divider sx={{ my: 3 }} />

        {/* Pagos */}
        <h3>Pagos</h3>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Curso</TableCell>
              <TableCell align="right">Importe (€)</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Método</TableCell>
              <TableCell>Fecha pago</TableCell>
              <TableCell>Ref</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.payments ?? []).map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.course?.name ?? "-"}</TableCell>
                <TableCell align="right">{centsToEUR(p.amount_cents)}</TableCell>
                <TableCell>{p.status}</TableCell>
                <TableCell>{p.method ?? "-"}</TableCell>
                <TableCell>{p.paid_at ?? "-"}</TableCell>
                <TableCell>{p.reference ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <CardActions>
        <Stack direction="row" spacing={1} ml="auto">
          {!edit ? (
            <>
              <Button variant="outlined" onClick={() => void load()}>Refrescar</Button>
              <Button variant="contained" onClick={() => setEdit(true)}>Editar</Button>
            </>
          ) : (
            <>
              <Button variant="outlined" onClick={handleCancel} disabled={saving}>Cancelar</Button>
              <Button variant="contained" onClick={handleSave} disabled={saving}>Guardar</Button>
            </>
          )}
        </Stack>
      </CardActions>
    </Card>
  );
}
