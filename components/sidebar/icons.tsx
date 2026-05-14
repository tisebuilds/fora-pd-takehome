import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ExternalLink,
  Folder,
  GraduationCap,
  Home,
  LifeBuoy,
  Mail,
  Megaphone,
  MessagesSquare,
  PanelLeftClose,
  Receipt,
  Rocket,
  Users,
} from "lucide-react";

export type IconName =
  | "home"
  | "bookings"
  | "clients"
  | "partners"
  | "marketing"
  | "training"
  | "resources"
  | "mail"
  | "forum"
  | "help"
  | "spark"
  | "external"
  | "collapse";

const icons: Record<IconName, LucideIcon> = {
  home: Home,
  bookings: Receipt,
  clients: Users,
  partners: Building2,
  marketing: Megaphone,
  training: GraduationCap,
  resources: Folder,
  mail: Mail,
  forum: MessagesSquare,
  help: LifeBuoy,
  spark: Rocket,
  external: ExternalLink,
  collapse: PanelLeftClose,
};

type Props = { name: IconName; className?: string; strokeWidth?: number };

export function Icon({ name, className, strokeWidth = 1 }: Props) {
  const Cmp = icons[name];
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden />;
}
