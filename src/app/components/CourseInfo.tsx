"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Stack,
  Button,
  Alert,
} from "@mui/material";
import { fetcher } from "@/utils/fetcher";
import { getClientToken } from "@/lib/auth-client";

type Course = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  content: any | null;
  created_at?: string;
  updated_at?: string;
};

type Props = {
  id: number;
  onSaved?: (course: Course) => void;
  onClose?: () => void;
  readOnly?: boolean;
};

const API = (process.env.NEXT_PUBLIC_API_ROUTE || "").replace(/\/+$/, "");

export default function CourseInfo({ id, onSaved, onClose, readOnly = false }: Props) {
  const token = getClientToken();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: string;      // texto para permitir vacío
    content: string;    // JSON editable en textarea
  }>({ name: "", description: "", price: "", content: "" });

  // Carga curso
  useEffect(() => {
    if (!token) {
      setErr("No auth token found");
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data: Course = await fetcher(`${API}/courses/${id}`, "GET", null, token);
        setForm({
          name: data?.name ?? "",
          description: data?.description ?? "",
          price:
            typeof data?.price === "number"
              ? String(data.price.toFixed(2))
              : data?.price
              ? String(data.price)
              : "",
          content: data?.content ? JSON.stringify(data.content, null, 2) : "",
        });
      } catch (e: any) {
        setErr(e?.message || "No se pudo cargar el curso");
      } finally {
        setLoading(false);
      }
    })();
  }, [API, id, token]);

  const onChange =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const formatJson = () => {
    try {
      if (!form.content.trim()) return;
      const parsed = JSON.parse(form.content);
      setForm((f) => ({ ...f, content: JSON.stringify(parsed, null, 2) }));
      setErr("");
      setOk("Contenido formateado");
    } catch {
      setErr("El contenido no es un JSON válido");
    }
  };

  const clearJson = () => setForm((f) => ({ ...f, content: "" }));

  const reload = async () => {
    // recarga desde API sin cerrar modal
    try {
      setLoading(true);
      setErr("");
      const data: Course = await fetcher(`${API}/courses/${id}`, "GET", null, token!);
      setForm({
        name: data?.name ?? "",
        description: data?.description ?? "",
        price:
          typeof data?.price === "number"
            ? String(data.price.toFixed(2))
            : data?.price
            ? String(data.price)
            : "",
        content: data?.content ? JSON.stringify(data.content, null, 2) : "",
      });
      setOk("Datos recargados");
    } catch (e: any) {
      setErr(e?.message || "No se pudo recargar");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || readOnly) return;
    try {
      setSaving(true);
      setErr("");
      setOk("");

      // Valida JSON si hay contenido
      let parsedContent: any = null;
      const trimmed = form.content.trim();
      if (trimmed) {
        try {
          parsedContent = JSON.parse(trimmed);
        } catch {
          throw new Error("El contenido debe ser JSON válido");
        }
      }

      // Precio opcional
      const payload: any = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        content: parsedContent, // puede ser null
      };
      if (form.price !== "") {
        const n = Number(form.price);
        if (Number.isNaN(n) || n < 0) throw new Error("Precio inválido");
        payload.price = n;
      }

      const updated: Course = await fetcher(
        `${API}/courses/${id}`,
        "PUT",
        payload,
        token!
      );

      setOk("Cambios guardados");
      if (onSaved) onSaved(updated);
    } catch (e: any) {
      setErr(e?.message || "No se pudieron guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ pt: 0.5 }}>
      <Stack spacing={2}>
        {err && <Alert severity="error">{err}</Alert>}
        {ok && <Alert severity="success">{ok}</Alert>}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nombre*"
              value={form.name}
              onChange={onChange("name")}
              fullWidth
              required
              disabled={loading || readOnly}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Precio"
              type="number"
              inputProps={{ step: "0.01", min: 0 }}
              value={form.price}
              onChange={onChange("price")}
              fullWidth
              helperText="Déjalo vacío para mantener el actual."
              disabled={loading || readOnly}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Descripción"
              value={form.description}
              onChange={onChange("description")}
              fullWidth
              multiline
              minRows={3}
              disabled={loading || readOnly}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Contenido (JSON)"
              value={form.content}
              onChange={onChange("content")}
              fullWidth
              multiline
              minRows={8}
              placeholder='{"modules":[{"title":"Intro","lessons":["A","B"]}]}'
              disabled={loading || readOnly}
            />
            {!readOnly && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button onClick={formatJson} size="small" variant="outlined" disabled={loading}>
                  Formatear JSON
                </Button>
                <Button onClick={clearJson} size="small" variant="text" disabled={loading}>
                  Vaciar contenido
                </Button>
                <Button onClick={reload} size="small" variant="text" disabled={loading}>
                  Recargar
                </Button>
              </Stack>
            )}
          </Grid>
        </Grid>

        {!readOnly && (
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            {onClose && (
              <Button onClick={onClose} disabled={saving}>
                Cerrar
              </Button>
            )}
            <Button type="submit" variant="contained" disabled={saving || loading}>
              {saving ? "Guardando…" : "Guardar cambios"}
            </Button>
          </Stack>
        )}

        {readOnly && onClose && (
          <Stack direction="row" justifyContent="flex-end">
            <Button onClick={onClose}>Cerrar</Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
