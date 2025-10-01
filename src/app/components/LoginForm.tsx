"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from "@mui/material";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  const API = process.env.NEXT_PUBLIC_API_ROUTE;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setErr("");
    setLoading(true);

    try {
      if (!API) throw new Error("Falta NEXT_PUBLIC_API_ROUTE");

      // 1) LOGIN → token
      const r = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
        cache: "no-store",
      });

      const loginBody = await r.json().catch(() => ({}));
      if (!r.ok || loginBody?.success === false) {
        throw new Error(loginBody?.message || "Credenciales inválidas");
      }

      const token: string | undefined =
        loginBody?.data?.token ?? loginBody?.token;
      if (!token) throw new Error("Login sin token");

      // 2) ME → user
      const meR = await fetch(`${API}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });
      const meBody = await meR.json().catch(() => ({}));
      if (!meR.ok || meBody?.success === false) {
        throw new Error(meBody?.message || "No se pudo obtener el perfil");
      }
      const user = meBody?.data ?? meBody;

      // 3) Persistencia mínima
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      // --- cookies que middleware usará ---
      document.cookie = `rb.token=${encodeURIComponent(
        token
      )}; Path=/; SameSite=Lax${
        remember ? "; Max-Age=2592000" : ""
      }${location.protocol === "https:" ? "; Secure" : ""}`;

      if (user?.role) {
        document.cookie = `rb.role=${encodeURIComponent(
          user.role
        )}; Path=/; SameSite=Lax${
          remember ? "; Max-Age=2592000" : ""
        }${location.protocol === "https:" ? "; Secure" : ""}`;
      }

      // 4) Redirección
      const to = params.get("redirect") || "/admin/users/clients";
      router.replace(to);
    } catch (e: any) {
      setErr(e?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#121212",
        p: 3,
      }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          width: 420,
          maxWidth: "100%",
          p: 4,
          bgcolor: "#1e1e1e",
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 700, color: "#fff" }}
        >
          Iniciar sesión (Admin)
        </Typography>

        {err && (
          <Typography sx={{ color: "#ff7070", mb: 2, fontWeight: 600 }}>
            {err}
          </Typography>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Correo"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                "& .MuiInputBase-root": { color: "#fff", bgcolor: "#2e2e2e" },
                "& .MuiInputLabel-root": { color: "#ccc" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#3a3a3a",
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                "& .MuiInputBase-root": { color: "#fff", bgcolor: "#2e2e2e" },
                "& .MuiInputLabel-root": { color: "#ccc" },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#3a3a3a",
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  sx={{ color: "#fff" }}
                />
              }
              label={
                <Typography variant="body2" sx={{ color: "#ccc" }}>
                  Recordarme
                </Typography>
              }
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ bgcolor: "#ef4444", fontWeight: "bold" }}
            >
              {loading ? "Entrando…" : "Entrar"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
