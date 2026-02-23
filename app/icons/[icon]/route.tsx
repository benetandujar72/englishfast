import { ImageResponse } from "next/og";

export const runtime = "edge";

function renderIcon(size: number) {
  const radius = Math.round(size * 0.22);
  const bookWidth = Math.round(size * 0.34);
  const bookHeight = Math.round(size * 0.26);
  const starSize = Math.max(10, Math.round(size * 0.06));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, rgb(14,165,233) 0%, rgb(37,99,235) 58%, rgb(30,64,175) 100%)",
        }}
      >
        <div
          style={{
            width: Math.round(size * 0.72),
            height: Math.round(size * 0.72),
            borderRadius: radius,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 100%)",
            boxShadow: "0 22px 48px rgba(2, 6, 23, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: Math.round(size * 0.02),
              transform: `translateY(${Math.round(size * 0.02)}px)`,
            }}
          >
            <div
              style={{
                width: bookWidth / 2,
                height: bookHeight,
                borderRadius: Math.round(size * 0.02),
                background: "rgba(255,255,255,0.96)",
              }}
            />
            <div
              style={{
                width: bookWidth / 2,
                height: bookHeight,
                borderRadius: Math.round(size * 0.02),
                background: "rgba(255,255,255,0.96)",
              }}
            />
          </div>

          <div
            style={{
              position: "absolute",
              top: Math.round(size * 0.14),
              fontSize: starSize,
              color: "rgba(255,255,255,0.95)",
              lineHeight: 1,
            }}
          >
            ✦
          </div>
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}

export async function GET(
  _request: Request,
  { params }: { params: { icon: string } }
) {
  const icon = params.icon;
  if (icon === "icon-192.png") {
    return renderIcon(192);
  }
  if (icon === "icon-512.png") {
    return renderIcon(512);
  }
  return new Response("Not Found", { status: 404 });
}
