import { useEffect } from "react";
import { useTheme } from "@material-ui/core";

export default function Favicon() {
  const theme = useTheme();

  useEffect(() => {
    const svg = `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13 0a3 3 0 010 6l-2-.001V6H6v7a3 3 0 01-6 0V3a3 3 0 015.501-1.657A2.989 2.989 0 018 0h5zM5 11H1v2a2 2 0 001.85 1.995L3 15a2 2 0 001.995-1.85L5 13v-2zm0-5H1v4h4V6zM3 1a2 2 0 00-1.995 1.85L1 3v2h4V3a2 2 0 00-1.85-1.995L3 1zm8.001 0v4H13a2 2 0 001.995-1.85L15 3a2 2 0 00-1.85-1.995L13 1h-1.999zM10 1H8a2 2 0 00-1.995 1.85L6 3v2h4V1z"
        fill="${theme.palette.primary.main}"
        fill-rule="nonzero"
      />
    </svg>`;

    document.getElementById("favicon-svg")?.setAttribute(
      "href",
      `data:image/svg+xml;utf8,${encodeURIComponent(svg)
        .replace(/\n/g, "")
        .replace(/\s{2,}/g, "")}`
    );
  }, [theme.palette.mode, theme.palette.primary.main]);

  return null;
}
