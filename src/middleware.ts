import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Add a new header x-current-path which passes the path to downstream components
    const headers = new Headers(request.headers);
   headers.set(
        "x-current-path",
        request.nextUrl.pathname + // e.g. "/account"
            request.nextUrl.search // e.g. "?name=foo&action=bar
    );
    return NextResponse.next({ headers });
}

export const config = {
    matcher: [
        // match all routes except static files and APIs
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
