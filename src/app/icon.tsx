import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070A",
          borderRadius: 6,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: 3,
            background: "#12161D",
            border: "1px solid rgba(242,243,245,0.12)",
            color: "#FFB01A",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "monospace",
          }}
        >
          W
        </div>
      </div>
    ),
    { ...size }
  );
}
