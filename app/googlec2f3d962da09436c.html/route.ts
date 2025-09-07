import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export function GET() {
  try {
    const filePath = join(process.cwd(), "public", "googlec2f3d962da09436c.html")
    const html = readFileSync(filePath, "utf8")
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch {
    return new NextResponse("Not Found", { status: 404 })
  }
}
