/**
 * 🎯 ICONS - COMPOSANTS D'ICÔNES SVG INLINE
 * 
 * Composants React pour toutes les icônes nécessaires
 * Solution qui évite les imports npm problématiques sur Vercel
 */

import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
  size?: number | string;
};

const createIcon = (d: string | string[], displayName: string) => {
  const Icon = ({ className = "", size = 24, ...props }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
};

// Export all commonly used icons
export const X = createIcon("M18 6 6 18M6 6l12 12", "X");
export const Check = createIcon("M20 6 9 17l-5-5", "Check");
export const ChevronDown = createIcon("m6 9 6 6 6-6", "ChevronDown");
export const ChevronRight = createIcon("m9 18 6-6-6-6", "ChevronRight");
export const ChevronLeft = createIcon("m15 18-6-6 6-6", "ChevronLeft");
export const ChevronUp = createIcon("m18 15-6-6-6 6", "ChevronUp");
export const ArrowLeft = createIcon(["M19 12H5", "m12 19-7-7 7-7"], "ArrowLeft");
export const ArrowRight = createIcon(["M5 12h14", "m12 5 7 7-7 7"], "ArrowRight");
export const Search = createIcon(["M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"], "Search");
export const Mail = createIcon(["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z", "M22 6l-10 7L2 6"], "Mail");
export const Phone = createIcon("M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z", "Phone");
export const User = createIcon(["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"], "User");
export const Users = createIcon(["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"], "Users");
export const Car = createIcon(["M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2", "M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0", "M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"], "Car");
export const MapPin = createIcon(["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z", "M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"], "MapPin");
export const Navigation = createIcon("m3 11 18-5v12L3 14v-3z", "Navigation");
export const Navigation2 = createIcon("m12 2 7 19-7-4-7 4L12 2z", "Navigation2");
export const Clock = createIcon(["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M12 6v6l4 2"], "Clock");
export const Calendar = createIcon(["M8 2v4", "M16 2v4", "M3 10h18", "M21 8.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.5A2 2 0 0 1 5 6.5h14a2 2 0 0 1 2 2z"], "Calendar");
export const DollarSign = createIcon(["M12 2v20", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"], "DollarSign");
export const CreditCard = createIcon(["M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z", "M2 10h20"], "CreditCard");
export const Star = createIcon("M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", "Star");
export const Heart = createIcon("M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", "Heart");
export const AlertCircle = createIcon(["M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z", "M12 8v4", "M12 16h.01"], "AlertCircle");
export const AlertTriangle = createIcon(["m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z", "M12 9v4", "M12 17h.01"], "AlertTriangle");
export const Info = createIcon(["M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z", "M12 16v-4", "M12 8h.01"], "Info");
export const CheckCircle = createIcon(["M22 11.08V12a10 10 0 1 1-5.93-9.14", "m9 11 3 3L22 4"], "CheckCircle");
export const CheckCircle2 = createIcon(["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "m9 12 2 2 4-4"], "CheckCircle2");
export const XCircle = createIcon(["M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z", "m15 9-6 6", "m9 9 6-6"], "XCircle");
export const Loader2 = createIcon("M21 12a9 9 0 1 1-6.219-8.56", "Loader2");
export const Plus = createIcon(["M12 5v14", "M5 12h14"], "Plus");
export const Minus = createIcon("M5 12h14", "Minus");
export const Download = createIcon(["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M7 10l5 5 5-5", "M12 15V3"], "Download");
export const Upload = createIcon(["M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4", "M17 8l-5-5-5 5", "M12 3v12"], "Upload");
export const Eye = createIcon(["M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z", "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"], "Eye");
export const EyeOff = createIcon(["M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24", "M2 2l20 20"], "EyeOff");
export const Lock = createIcon(["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z", "M7 11V7a5 5 0 0 1 10 0v4"], "Lock");
export const Shield = createIcon("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "Shield");
export const Settings = createIcon(["M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z", "M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"], "Settings");
export const Menu = createIcon(["M3 12h18", "M3 6h18", "M3 18h18"], "Menu");
export const MoreHorizontal = createIcon(["M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"], "MoreHorizontal");
export const Copy = createIcon(["M8 4v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7.242a2 2 0 0 0-.602-1.43L16.083 2.57A2 2 0 0 0 14.685 2H10a2 2 0 0 0-2 2z", "M16 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2"], "Copy");
export const Trash2 = createIcon(["M3 6h18", "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", "M10 11v6", "M14 11v6"], "Trash2");
export const Edit2 = createIcon(["M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"], "Edit2");
export const Edit3 = createIcon(["M12 20h9", "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"], "Edit3");
export const Save = createIcon(["M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z", "M17 21v-8H7v8", "M7 3v5h8"], "Save");
export const RefreshCw = createIcon(["M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", "M21 3v5h-5", "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", "M3 21v-5h5"], "RefreshCw");
export const TrendingUp = createIcon(["m23 6-9.5 9.5-5-5L1 18", "M17 6h6v6"], "TrendingUp");
export const TrendingDown = createIcon(["m23 18-9.5-9.5-5 5L1 6", "M17 18h6v-6"], "TrendingDown");
export const Home = createIcon(["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"], "Home");
export const Briefcase = createIcon(["M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16", "M21 20H3", "M21 12h-4", "M7 12H3", "M16 8h5", "M16 16h5", "M3 8h5", "M3 16h5"], "Briefcase");
export const Package = createIcon(["M16.5 9.4 7.55 4.24", "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z", "M3.29 7 12 12l8.71-5", "M12 22V12"], "Package");
export const Smartphone = createIcon(["M17 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z", "M12 18h.01"], "Smartphone");
export const Wifi = createIcon(["M5 13a10 10 0 0 1 14 0", "M8.5 16.5a5 5 0 0 1 7 0", "M12 20h.01"], "Wifi");
export const WifiOff = createIcon(["M12 20h.01", "M8.5 16.5a5 5 0 0 1 7 0", "M2 2l20 20"], "WifiOff");
export const Send = createIcon(["M22 2 11 13", "M22 2l-7 20-4-9-9-4 20-7z"], "Send");
export const MessageCircle = createIcon(["M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"], "MessageCircle");
export const MessageSquare = createIcon(["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"], "MessageSquare");
export const Bell = createIcon(["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"], "Bell");
export const Activity = createIcon("M22 12h-4l-3 9L9 3l-3 9H2", "Activity");
export const Zap = createIcon("M13 2 3 14h9l-1 8 10-12h-9l1-8z", "Zap");
export const Globe = createIcon(["M21.54 15H17a2 2 0 0 0-2 2v4.54", "M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17", "M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05", "M21.54 9H17a2 2 0 0 1-2-2V2.46", "M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z"], "Globe");
export const Filter = createIcon("M22 3H2l8 9.46V19l4 2v-8.54L22 3z", "Filter");
export const Sparkles = createIcon(["m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z", "M5 3v4", "M19 17v4", "M3 5h4", "M17 19h4"], "Sparkles");
export const Camera = createIcon(["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z", "M12 13m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"], "Camera");
export const Share2 = createIcon(["M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M18 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M8.59 13.51l6.83 3.98", "M15.41 6.51l-6.82 3.98"], "Share2");
export const ExternalLink = createIcon(["M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", "M15 3h6v6", "M10 14 21 3"], "ExternalLink");
export const FileText = createIcon(["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "M16 13H8", "M16 17H8", "M10 9H8"], "FileText");
export const FileCheck = createIcon(["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z", "M14 2v6h6", "m9 15 2 2 4-4"], "FileCheck");
export const Tag = createIcon(["M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2z", "M7 7h.01"], "Tag");
export const Gift = createIcon(["M20 12v10H4V12", "M2 7h20v5H2z", "M12 22V7", "M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z", "M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"], "Gift");
export const Percent = createIcon(["M19 5 5 19", "M8.5 6.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z", "M19.5 17.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"], "Percent");
export const Ban = createIcon(["M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10z", "m4.93 4.93 14.14 14.14"], "Ban");
export const Database = createIcon(["M4 6c0 1.657 3.582 3 8 3s8-1.343 8-3S16.418 3 12 3 4 4.343 4 6z", "M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6", "M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6"], "Database");
export const Wallet = createIcon(["M21 12V7H5a2 2 0 0 1 0-4h14v4", "M3 5v14a2 2 0 0 0 2 2h16v-5", "M18 12a2 2 0 0 0 0 4h4v-4z"], "Wallet");
export const Banknote = createIcon(["M21 8V6H3v2", "M3 16v2h18v-2", "M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M7 12H5", "M19 12h-2"], "Banknote");
export const Calculator = createIcon(["M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z", "M9 7h6", "M9 11h.01", "M13 11h.01", "M9 15h.01", "M13 15h.01"], "Calculator");
export const History = createIcon(["M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", "M3 3v5h5", "M12 7v5l4 2"], "History");
export const Play = createIcon("M5 3l14 9-14 9V3z", "Play");
export const Pause = createIcon(["M10 4H6v16h4V4z", "M18 4h-4v16h4V4z"], "Pause");
export const ShieldCheck = createIcon(["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "m9 12 2 2 4-4"], "ShieldCheck");
export const HelpCircle = createIcon(["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3", "M12 17h.01"], "HelpCircle");
export const Wrench = createIcon(["M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"], "Wrench");
export const Bot = createIcon(["M12 8V4H8", "M16 8V4h-4", "M17 22h-10a2 2 0 0 1-2-2v-10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z", "M9 14h.01", "M15 14h.01"], "Bot");
export const Quote = createIcon(["M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z", "M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"], "Quote");
export const Sun = createIcon(["M12 2v2", "M12 20v2", "m4.93 4.93 1.41 1.41", "m17.66 17.66 1.41 1.41", "M2 12h2", "M20 12h2", "m6.34 17.66-1.41-1.41", "m19.07 4.93-1.41 1.41", "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"], "Sun");
export const Moon = createIcon("M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z", "Moon");
export const Megaphone = createIcon(["M3 11l18-5v12L3 14v-3z", "M11.6 16.8a3 3 0 1 1-5.8-1.6"], "Megaphone");
export const Receipt = createIcon(["M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z", "M16 8h-6", "M16 12h-6", "M16 16h-6"], "Receipt");
export const LogIn = createIcon(["M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4", "M10 17l5-5-5-5", "M15 12H3"], "LogIn");
export const Euro = createIcon(["M18.5 6C16.8 4.8 14.5 4 12 4 7 4 3 8 3 13s4 9 9 9c2.5 0 4.8-.8 6.5-2", "M7 10h8", "M7 14h8"], "Euro");
export const Key = createIcon(["M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"], "Key");
export const Circle = createIcon("M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z", "Circle");
export const GripVertical = createIcon(["M9 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M9 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M9 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M15 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M15 19a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M15 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"], "GripVertical");
export const PanelLeft = createIcon(["M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z", "M10 2v20"], "PanelLeft");

// ✅ ICÔNES MANQUANTES AJOUTÉES
export const Maximize2 = createIcon(["M15 3h6v6", "M9 21H3v-6", "M21 3l-7 7", "M3 21l7-7"], "Maximize2");
export const Award = createIcon(["M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "m8.21 13.89-1.9 6.62a.5.5 0 0 0 .69.59l5-2.38 5 2.38a.5.5 0 0 0 .69-.59l-1.9-6.62"], "Award");
export const Split = createIcon(["M16 3h5v5", "M8 3H3v5", "M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3", "M12 22v-8.3a4 4 0 0 1 1.172-2.872L21 3"], "Split");
export const Edit = createIcon(["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7", "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"], "Edit");
export const LogOut = createIcon(["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"], "LogOut");
export const Twitter = createIcon("M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z", "Twitter");
export const Facebook = createIcon(["M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"], "Facebook");

// ✅ ICÔNES SUPPLÉMENTAIRES AJOUTÉES (v517.161.1)
export const Timer = createIcon(["M10 2h4", "M12 14v-4", "M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6", "M9 17H2v7l2.8-2.8"], "Timer");
export const Bug = createIcon(["m8 2 1.88 1.88", "M14.12 3.88 16 2", "M9 7.13v-1a3.003 3.003 0 1 1 6 0v1", "M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6", "M12 20v-9", "M6.53 9C4.6 8.8 3 7.1 3 5", "M6 13H2", "M3 21c0-2.1 1.7-3.9 3.8-4", "M20.97 5c0 2.1-1.6 3.8-3.5 4", "M22 13h-4", "M17.2 17c2.1.1 3.8 1.9 3.8 4"], "Bug");

// Aliases for compatibility
export const XIcon = X;
export const ChevronDownIcon = ChevronDown;
export const ChevronRightIcon = ChevronRight;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronUpIcon = ChevronUp;
export const SearchIcon = Search;
export const CheckIcon = Check;
export const CheckCircle2Icon = CheckCircle2;
export const XCircleIcon = XCircle;
export const AlertCircleIcon = AlertCircle;
export const InfoIcon = Info;
export const CircleIcon = Circle;
export const GripVerticalIcon = GripVertical;
export const PanelLeftIcon = PanelLeft;
export const MinusIcon = Minus;
export const CalendarIcon = Calendar;
export const NavigationIcon = Navigation;
export const HistoryIcon = History;