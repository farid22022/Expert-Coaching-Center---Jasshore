// Vite dev server on :5174 pointing at the PostgreSQL-backed API on :8001 (verification only).
const { spawn } = require("child_process");
const env = { ...process.env, VITE_API_URL: "http://127.0.0.1:8001/api/v1" };
const child = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5174", "--strictPort"], { stdio: "inherit", env, cwd: __dirname });
child.on("exit", (code) => process.exit(code ?? 0));
