import { logger } from "@/lib/logger";
import { type NextRequest, NextResponse } from "next/server";
import { LogFn } from "pino";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, ...data } = body;

    if (typeof logger[level as keyof typeof logger] === "function") {
      (logger[level as keyof typeof logger] as LogFn)(data);
    } else {
      logger.info(data);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error({ error }, "Failed to process client-side log");
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
