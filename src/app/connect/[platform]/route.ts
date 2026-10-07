import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const destinations: Record<string, string> = {
  whatsapp: `https://api.whatsapp.com/send/?phone=923315543897&text=${encodeURIComponent("Hi SYS Solutions, help me find the right laptop.")}&type=phone_number&app_absent=0`,
  "whatsapp-catalog": "https://www.whatsapp.com/catalog/923315543897/?app_absent=0",
  instagram: "https://www.instagram.com/syssolutionspk/",
  facebook: "https://www.facebook.com/syssolutionspk/",
  tiktok: "https://www.tiktok.com/@sys.solutionspk",
};

type RouteContext = { params: Promise<{ platform: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { platform } = await params;
  let destination = destinations[platform];

  if (!destination) {
    return NextResponse.redirect(new URL("/#social-title", request.url), 307);
  }

  // Facebook's lighter mobile site is more reliable inside mobile webviews.
  if (platform === "facebook" && /Android|iPhone|iPad|Mobile/i.test(request.headers.get("user-agent") || "")) {
    destination = "https://m.facebook.com/syssolutionspk/";
  }

  const response = NextResponse.redirect(destination, 307);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("Cache-Control", "no-store, max-age=0");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
