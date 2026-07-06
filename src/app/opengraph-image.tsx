import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TILE = "WHEELSDOWN";

function Tile({ ch }: { ch: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 84,
        height: 112,
        borderRadius: 8,
        background: "#05070A",
        border: "1px solid rgba(242,243,245,0.1)",
        color: "#FFB01A",
        fontSize: 64,
        fontWeight: 700,
        fontFamily: "monospace",
      }}
    >
      {ch}
    </div>
  );
}

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0C1016",
          gap: 32,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          {TILE.split("").map((ch, i) => (
            <Tile key={i} ch={ch} />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            color: "#8992A3",
            fontSize: 28,
            fontFamily: "monospace",
            letterSpacing: 4,
            textTransform: "uppercase",
          }}
        >
          Know before the airline tells you
        </div>
      </div>
    ),
    { ...size }
  );
}
