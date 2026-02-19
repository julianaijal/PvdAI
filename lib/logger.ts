type Level = "info" | "warn" | "error";

interface LogEntry {
  ts: string;
  level: Level;
  path: string;
  msg: string;
  [key: string]: unknown;
}

function log(level: Level, path: string, msg: string, extra?: Record<string, unknown>) {
  const entry: LogEntry = {
    ts: new Date().toISOString(),
    level,
    path,
    msg,
    ...extra,
  };
  // Vercel Functions capture stdout/stderr — structured JSON is searchable in the dashboard
  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

export const logger = {
  info:  (path: string, msg: string, extra?: Record<string, unknown>) => log("info",  path, msg, extra),
  warn:  (path: string, msg: string, extra?: Record<string, unknown>) => log("warn",  path, msg, extra),
  error: (path: string, msg: string, extra?: Record<string, unknown>) => log("error", path, msg, extra),
};
