import type { ReactNode } from "react";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import AssignmentOutlined from "@mui/icons-material/AssignmentOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";

export type MenuItem = {
  name: string;
  href?: string;
  icon?: ReactNode;
  children?: MenuItem[];
};

export const adminMenu: MenuItem[] = [
  { name: "Dashboard", href: "/", icon: <DashboardOutlined /> },
  {
    name: "Usuarios",
    icon: <PeopleOutline />,
    children: [
      { name: "Clientes", href: "/admin/users/clients" },
      { name: "Miembros", href: "/admin/users/members" },
    ],
  },
  {
    name: "Cursos",
    icon: <SchoolOutlined />,
    children: [
      { name: "Listado", href: "/courses" },
      { name: "Inscripciones", href: "/enrollments" },
    ],
  },
  {
    name: "Contratos",
    icon: <AssignmentOutlined />,
    children: [
      { name: "Plantillas", href: "/contracts/templates" },
      { name: "Firmas", href: "/contracts/signatures" },
    ],
  },
  { name: "Ajustes", href: "/admin/settings", icon: <SettingsOutlined /> },
];
