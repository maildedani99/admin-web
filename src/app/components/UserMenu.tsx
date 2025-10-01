"use client";

import * as React from "react";
import { Avatar, Box, IconButton, Menu, MenuItem, Typography } from "@mui/material";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { logout } from "@/lib/auth";

type UserMenuProps = {
  name?: string;
  email?: string;
  avatarUrl?: string;
  onConfig?: () => void;
};

export default function UserMenu({ name, email, avatarUrl, onConfig }: UserMenuProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton onClick={handleMenu} sx={{ p: 0 }}>
        <Avatar
          src={avatarUrl}
          alt={name || email}
          sx={{ bgcolor: "primary.main", width: 36, height: 36 }}
        >
          {name?.[0] || email?.[0] || "U"}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: "#2d2d2d",
            color: "white",
            minWidth: 200,
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" noWrap>{name}</Typography>
          <Typography variant="caption" sx={{ color: "grey.400" }} noWrap>
            {email}
          </Typography>
        </Box>

        <MenuItem
          onClick={() => {
            handleClose();
            onConfig?.();
          }}
        >
          <Settings fontSize="small" sx={{ mr: 1 }} /> Configuración
        </MenuItem>

        <form action={logout}>
          <MenuItem component="button" type="submit" onClick={handleClose}>
            <Logout fontSize="small" sx={{ mr: 1 }} /> Cerrar sesión
          </MenuItem>
        </form>
      </Menu>
    </Box>
  );
}
