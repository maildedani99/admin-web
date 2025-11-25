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
import Image from "next/image";

const API = process.env.NEXT_PUBLIC_API_ROUTE;

function setAuthCookies(token: string, role?: string, remember?: boolean) {
  const maxAge = remember ? "; Max-Age=2592000" : "";
  const secure =
    typeof location !== "undefined" && location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `rb.token=${encodeURIComponent(
    token
  )}; Path=/; SameSite=Lax${maxAge}${secure}`;

  if (role) {
    document.cookie = `rb.role=${encodeURIComponent(
      role
    )}; Path=/; SameSite=Lax${maxAge}${secure}`;
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin/users/clients";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErr("");
    setLoading(true);

    try {
      if (!API) throw new Error("Falta NEXT_PUBLIC_API_ROUTE");

      const body = {
        email: email.trim(),
        password,
      };

      // 1) LOGIN
      const loginRes = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });

      const loginJson = await loginRes.json().catch(() => ({} as any));

      if (!loginRes.ok || loginJson?.success === false) {
        throw new Error(loginJson?.message || "Credenciales inválidas");
      }

      const token: string | undefined =
        loginJson?.data?.token ?? loginJson?.token;

      if (!token) {
        throw new Error("Login sin token");
      }

      // 2) ME
      const meRes = await fetch(`${API}/auth/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
      });

      const meJson = await meRes.json().catch(() => ({} as any));

      if (!meRes.ok || meJson?.success === false) {
        throw new Error(meJson?.message || "No se pudo obtener el perfil");
      }

      const user = meJson?.data ?? meJson;

      // 3) storage
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("token", token);
      storage.setItem("user", JSON.stringify(user));

      // 4) cookies
      setAuthCookies(token, user?.role, remember);

      // 5) redirect
      router.replace(redirectTo);
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
        bgcolor: "#f3f3f3", // fondo gris claro como en Campus
        p: 3,
      }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          width: 520,
          maxWidth: "100%",
          p: 4,
          bgcolor: "#ffffff",
          borderRadius: 4,
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          border: "1px solid #e0e0e0",
        }}
      >
        <Grid container spacing={2} alignItems="flex-start">
          {/* Columna izquierda: título + formulario */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Typography
              variant="h6"
              sx={{ mb: 3, fontWeight: 700, color: "#222" }}
            >
              Iniciar sesión
            </Typography>

            {err && (
              <Typography
                sx={{
                  color: "#d0021b",
                  mb: 2,
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                {err}
              </Typography>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Contraseña"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>

              {/* <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      Recordarme
                    </Typography>
                  }
                />
              </Grid> */}

              <Grid size={{ xs: 12 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: "#d0021b",
                    fontWeight: "bold",
                    mt: 1,
                    py: 1.2,
                    "&:hover": {
                      bgcolor: "#b10016",
                    },
                  }}
                >
                  {loading ? "Entrando…" : "ENTRAR"}
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {/* Columna derecha: logo Rebirth */}
          <Grid
            size={{ xs: 12, md: 5 }}
            sx={{
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              alignItems: "flex-start",
              mt: { xs: 3, md: 0 },
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Image
                src="/logo-inverse.png" // ajusta a la ruta real de tu logo
                alt="Rebirth"
                width={96}
                height={96}
              />
         
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
