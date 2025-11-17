'use client';

import { useEffect, useState } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography, InputAdornment, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Link from 'next/link';
import useUsers from '@/hooks/useUsers';
import { getClientToken } from '@/lib/auth-client';

export default function UsersTable({
  type, title,
}: { type: 'clients' | 'members'; title: string }) {
  // tipo para el API (coincide con tus endpoints)
  const apiType = type === 'clients' ? 'clients' : 'members';

  // token desde storage/cookie
  const token = getClientToken();

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  // debounce búsqueda
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { rows, isLoading, error } = useUsers(token, {
    type: apiType,
    search: debounced,
    page: 1,
    per_page: 50,
  });

  const empty = !isLoading && !error && rows.length === 0;

  return (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      bgcolor: 'common.white',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    {/* Header */}
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 2,
        flexWrap: 'wrap',
      }}
    >
    <Typography
  variant="h6"
  fontWeight={700}
  sx={{
    flex: '1 1 auto',
    color: '#111',         // negro fuerte
    letterSpacing: 0.2,
  }}
>
  {title}
</Typography>

<TextField
  size="small"
  placeholder="Buscar por nombre o email…"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  sx={{
    width: { xs: '100%', sm: 280 },
    '& .MuiOutlinedInput-root': {
      bgcolor: 'common.white',
      borderRadius: 2,
      '& fieldset': {
        borderColor: 'grey.300', // borde claro
      },
      '&:hover fieldset': {
        borderColor: 'grey.400',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'primary.main', // azul/primario al focus
        borderWidth: 2,
      },
    },
  }}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon fontSize="small" sx={{ color: 'grey.600' }} />
      </InputAdornment>
    ),
  }}
/>


      {type === 'clients' && (
        <Link href="/admin/newUser">
          <Button variant="contained">Nuevo cliente</Button>
        </Link>
      )}
    </Box>

    {/* Tabla */}
    <TableContainer
      sx={{
        maxHeight: 540,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'common.white',
      }}
    >
      <Table stickyHeader size="small">
        <TableHead>
         <TableRow
    sx={{
      '& th': {
        bgcolor: '#f5f5f5',            // gris claro uniforme
        color: '#111 !important',      // texto negro forzado
        fontWeight: 700,
        fontSize: '0.9rem',
        borderBottom: '2px solid',
        borderColor: 'divider',
        whiteSpace: 'nowrap',
        px: 2,
        py: 1.5,                       // un poco más de alto
      },
    }}
  >
            <TableCell>Nombre</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Rol</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell>Último acceso</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                  <CircularProgress size={20} /> Cargando…
                </Box>
              </TableCell>
            </TableRow>
          )}

          {!!error && !isLoading && (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography color="error">
                  {(error as any)?.message || 'Error'}
                </Typography>
              </TableCell>
            </TableRow>
          )}

          {empty && (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography color="text.secondary">No hay resultados</Typography>
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !error && rows.map((u) => (
            <TableRow
              key={u.id}
              hover
              sx={{
                '&:nth-of-type(odd)': { bgcolor: 'grey.50' },   // zebra suave
                '&:hover': { bgcolor: 'grey.100' },             // hover claro
                '& td, & td *': {
                  color: 'rgba(17,17,17,0.95) !important',      // fuerza contraste
                },
                '& td': {
                  borderBottomColor: 'divider',
                },
              }}
            >
              <TableCell>
                <Link
                  href={`/admin/userInfo/${u.id}`}
                  style={{ textDecoration: 'none', fontWeight: 500 }}
                >
                  {u.firstName} {u.lastName}
                </Link>
              </TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>{u.isActive ? 'Sí' : 'No'}</TableCell>
              <TableCell>
                {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

}
