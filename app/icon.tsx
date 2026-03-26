import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0f0c09",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 5,
          border: "1px solid #E8560A",
        }}
      >
        <span
          style={{
            fontFamily: "serif",
            fontSize: 13,
            fontWeight: 900,
            color: "#E8560A",
            letterSpacing: -0.5,
          }}
        >
          TBS
        </span>
      </div>
    ),
    { ...size }
  );
}
