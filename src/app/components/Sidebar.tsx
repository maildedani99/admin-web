"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Toolbar,
  Divider,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";
import type { MenuItem } from "@/config/menu";
import { logout } from "@/lib/auth";

export const DRAWER_WIDTH = 260;

type SidebarProps = {
  menu: MenuItem[];
  permanent?: boolean;
  open?: boolean;
  onClose?: () => void;
};

const isHrefActive = (pathname: string, href?: string) =>
  !!href && (pathname === href || pathname.startsWith(href + "/"));

const isAnyDescendantActive = (pathname: string, item: MenuItem): boolean =>
  isHrefActive(pathname, item.href) ||
  !!item.children?.some((c) => isAnyDescendantActive(pathname, c));

function ItemNode({
  item,
  depth = 0,
  onLeafClick,
}: {
  item: MenuItem;
  depth?: number;
  onLeafClick?: () => void;
}) {
  const pathname = usePathname();
  const hasChildren = !!item.children?.length;
  const active = isHrefActive(pathname ?? "", item.href);
  const defaultOpen = hasChildren && isAnyDescendantActive(pathname ?? "", item);
  const [open, setOpen] = React.useState<boolean>(defaultOpen);

  React.useEffect(() => {
    if (hasChildren) setOpen(isAnyDescendantActive(pathname ?? "", item));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const paddingLeft = 1.5 + depth * 2;

  if (hasChildren) {
    return (
      <>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => setOpen((v) => !v)}
            sx={{
              pl: paddingLeft,
              color: "grey.100",
              "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
            }}
          >
            {item.icon && (
              <ListItemIcon sx={{ minWidth: 36, color: "grey.300" }}>
                {item.icon}
              </ListItemIcon>
            )}
            <ListItemText primary={item.name} />
            {open ? <ExpandLess sx={{ color: "grey.400" }} /> : <ExpandMore sx={{ color: "grey.400" }} />}
          </ListItemButton>
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List disablePadding>
            {item.children!.map((child) => (
              <ItemNode
                key={`${item.name}-${child.name}`}
                item={child}
                depth={depth + 1}
                onLeafClick={onLeafClick}
              />
            ))}
          </List>
        </Collapse>
      </>
    );
  }

  const button = (
    <ListItemButton
      onClick={onLeafClick}
      selected={active}
      aria-current={active ? "page" : undefined}
      sx={{
        pl: paddingLeft,
        color: "grey.100",
        "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" },
        "&.Mui-selected:hover": { bgcolor: "rgba(255,255,255,0.12)" },
        "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
      }}
    >
      {item.icon && (
        <ListItemIcon sx={{ minWidth: 36, color: "grey.300" }}>
          {item.icon}
        </ListItemIcon>
      )}
      <ListItemText primary={item.name} />
    </ListItemButton>
  );

  return (
    <ListItem disablePadding>
      {item.href ? (
        <Link href={item.href} style={{ width: "100%", textDecoration: "none", color: "inherit" }}>
          {button}
        </Link>
      ) : (
        button
      )}
    </ListItem>
  );
}

function SidebarContent({ menu, onLeafClick }: { menu: MenuItem[]; onLeafClick?: () => void }) {
  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "grey.900",
        color: "grey.100",
      }}
    >
    
      {/* LOGO */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 2,
        }}
      >
        <Link href="/" aria-label="Ir al dashboard" style={{ display: "inline-flex" }}>
          <Image
            src="/logo.png"
            alt="Rebirth"
            width={140}           // ⇦ ajusta a tu gusto (entre 120 y 160 va perfecto)
            height={140}
            style={{ height: "auto", width: "auto", maxWidth: 160 }}
            priority
          />
        </Link>
      </Box>

      <Divider sx={{ borderColor: "grey.800" }} />

      {/* Menu */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        <List disablePadding>
          {menu.map((it) => (
            <ItemNode key={it.name} item={it} onLeafClick={onLeafClick} />
          ))}
        </List>
      </Box>

      {/* Logout */}
      <Divider sx={{ borderColor: "grey.800" }} />
      <form action={logout}>
        <List disablePadding>
          <ListItem disablePadding>
            <ListItemButton component="button" type="submit" sx={{ pl: 1.5, color: "grey.100",
              "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}>
              <ListItemIcon sx={{ minWidth: 36, color: "grey.300" }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesión" />
            </ListItemButton>
          </ListItem>
        </List>
      </form>
    </Box>
  );
}

export default function Sidebar({ menu, permanent = true, open = false, onClose }: SidebarProps) {
  const drawerPaperSx = {
    width: DRAWER_WIDTH,
    boxSizing: "border-box",
    bgcolor: "grey.900",
    color: "grey.100",
    borderRightColor: "grey.800",
  };

  return permanent ? (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        display: { xs: "none", md: "block" },
        "& .MuiDrawer-paper": drawerPaperSx,
      }}
    >
      <SidebarContent menu={menu} />
    </Drawer>
  ) : (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": drawerPaperSx,
      }}
    >
      <SidebarContent menu={menu} onLeafClick={onClose} />
    </Drawer>
  );
}
