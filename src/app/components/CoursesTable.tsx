"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, TextField, Typography, Stack, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Alert, Pagination, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { getClientToken } from "@/lib/auth-client";
import { fetcher } from "@/utils/fetcher";
import { useRouter } from "next/navigation";

type Course = {
  id: number;
  name: string;
  description: string | null;
  price: number | string;
  content: any | null;
  created_at?: string;
  updated_at?: string;
};

type PageData<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

const API = (process.env.NEXT_PUBLIC_API_ROUTE || "").replace(/\/+$/, "");

export default function CoursesTable() {
  const token = getClientToken();
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [loading, setLoading] = useState(false);

  // tabla
  const [items, setItems] = useState<Course[]>([]);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // búsqueda con debounce
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");


  const router = useRouter();
  const goToCourse = (id: number) => router.push(`/admin/courseInfo/${id}`);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // modal crear
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    price: string;
    content: string; // JSON en textarea
  }>({ name: "", description: "", price: "", content: "" });

  const canSubmit = useMemo(
    () => form.name.trim().length > 0 && !creating,
    [form.name, creating]
  );

  const load = async (_page = page, _search = debounced) => {
    if (!token) {
      setErr("No auth token found");
      return;
    }
    try {
      setLoading(true);
      setErr("");
      const data: PageData<Course> = await fetcher(
        `${API}/courses`,
        "GET",
        { page: _page, per_page: perPage, search: _search || undefined },
        token
      );
      setItems(data.data || []);
      setPage(data.current_page || 1);
      setTotalPages(data.last_page || 1);
      setTotal(data.total || 0);
    } catch (e: any) {
      setErr(e?.message || "Error cargando cursos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // reset de página al cambiar búsqueda
  }, [debounced]);

  useEffect(() => {
    load(1, debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  useEffect(() => {
    load(page, debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setErr("No auth token found");
    if (!canSubmit) return;

    try {
      setCreating(true);
      setErr("");
      setOk("");

      // parsear JSON si viene
      let parsedContent: any = null;
      const trimmed = form.content.trim();
      if (trimmed) {
        try {
          parsedContent = JSON.parse(trimmed);
        } catch {
          throw new Error("El contenido debe ser JSON válido");
        }
      }

      // precio opcional (si no se envía, backend usará config.price_course)
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

      const created: Course = await fetcher(`${API}/courses`, "POST", payload, token);

      setOk(`Curso "${created.name}" creado`);
      setOpen(false);
      setForm({ name: "", description: "", price: "", content: "" });
      // recarga primera página (para verlo arriba)
      setPage(1);
      await load(1, debounced);
    } catch (e: any) {
      setErr(e?.message || "No se pudo crear el curso");
    } finally {
      setCreating(false);
    }
  };

  const onDelete = async (c: Course) => {
    if (!token) return setErr("No auth token found");
    const ok = confirm(`¿Eliminar el curso "${c.name}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await fetcher(`${API}/courses/${c.id}`, "DELETE", null, token);
      setOk(`Curso "${c.name}" eliminado`);
      // si borro el último de la página, intento retroceder
      const remains = items.length - 1;
      if (remains <= 0 && page > 1) {
        setPage(page - 1);
      } else {
        await load(page, debounced);
      }
    } catch (e: any) {
      setErr(e?.message || "No se pudo eliminar el curso");
    }
  };

 return (
  <Box>
    {/* Header */}
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mb: 2 }}
    >
      <Typography variant="h5" fontWeight={700} sx={{ color: '#111' }}>
        Cursos
      </Typography>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Buscar por nombre/descr…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{
            width: { xs: 180, sm: 280 },
            '& .MuiOutlinedInput-root': {
              bgcolor: 'common.white',
              borderRadius: 2,
              '& fieldset': { borderColor: 'grey.300' },
              '&:hover fieldset': { borderColor: 'grey.400' },
              '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 },
            },
          }}
        />
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpen(true)}>
          Nuevo curso
        </Button>
      </Stack>
    </Stack>

    {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
    {ok && <Alert severity="success" sx={{ mb: 2 }}>{ok}</Alert>}

    {/* Tabla */}
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        bgcolor: 'common.white',
        borderColor: 'divider',
        overflow: 'hidden',

        // contraste como Users
        '& .MuiTableCell-root': { color: '#111' },
      }}
    >
      <TableContainer sx={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                '& th': {
                  bgcolor: 'grey.200',
                  color: '#111',
                  fontWeight: 700,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  whiteSpace: 'nowrap',
                },
              }}
            >
              <TableCell width={80}>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell width={120} align="right">Precio</TableCell>
              <TableCell width={180}>Actualizado</TableCell>
              <TableCell width={100} align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Sin cursos.
                </TableCell>
              </TableRow>
            )}

            {items.map((c) => (
              <TableRow
                key={c.id}
                hover
                onClick={() => goToCourse(c.id)}
                onKeyDown={(e) => { if (e.key === 'Enter') goToCourse(c.id); }}
                role="link"
                tabIndex={0}
                sx={{
                  cursor: 'pointer',
                  '&:nth-of-type(odd)': { bgcolor: 'grey.50' },
                  '&:hover': { bgcolor: 'grey.100' },
                  '& td, & td *': { color: 'rgba(17,17,17,0.95) !important' },
                  '& td': { borderBottomColor: 'divider' },
                }}
              >
                <TableCell>{c.id}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell sx={{ maxWidth: 360 }}>
                  <Typography variant="body2" noWrap title={c.description || ''}>
                    {c.description || '—'}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {typeof c.price === 'number' ? c.price.toFixed(2) : c.price}
                </TableCell>
                <TableCell>
                  {c.updated_at ? new Date(c.updated_at).toLocaleString() : '—'}
                </TableCell>
                <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                  <Tooltip title="Eliminar">
                    <span>
                      <IconButton
                        color="error"
                        aria-label="Eliminar curso"
                        onClick={(e) => { e.stopPropagation(); onDelete(c); }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}

            {loading && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  Cargando…
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          p: 2,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'grey.50',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {total} resultados
        </Typography>
        <Pagination
          page={page}
          count={totalPages}
          onChange={(_e, p) => setPage(p)}
          size="small"
        />
      </Stack>
    </Paper>

    {/* Modal crear (sin cambios de lógica) */}
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
      <DialogTitle>Nuevo curso</DialogTitle>
      <Box component="form" onSubmit={onCreate}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre*"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Precio (opcional)"
                type="number"
                inputProps={{ step: '0.01', min: 0 }}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                fullWidth
                helperText="Si lo dejas vacío, se usará el precio por defecto de Config."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                fullWidth
                multiline
                minRows={3}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Contenido (JSON opcional)"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                fullWidth
                multiline
                minRows={6}
                placeholder='{"modules":[{"title":"Intro","lessons":["A","B"]}]}'
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={creating}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={!canSubmit}>
            {creating ? 'Creando…' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  </Box>
);

}
