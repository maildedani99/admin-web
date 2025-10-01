"use client";

import { AppBar, Toolbar, Typography } from "@mui/material";
import UserMenu from "./UserMenu";
import { useRouter } from "next/navigation";

export default function Navbar() {

  const router = useRouter()
  return (
    <AppBar
      position="fixed"
      color="default"
      sx={{ bgcolor: "grey.900", borderBottom: "1px solid", borderColor: "grey.800" }}
    >
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Admin
        </Typography>
        <div style={{ flex: 1 }} />
        <UserMenu
          name="Dani Andrés"
          email="dani@test.com"
          avatarUrl="/avatar.png"
          onConfig={() => router.push("/settings")}
        />
      </Toolbar>
    </AppBar>
  );
}
