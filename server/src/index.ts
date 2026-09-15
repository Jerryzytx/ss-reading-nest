import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 8787);
createApp().listen(port, () => {
  console.log(`鼠兔和家机的书屋 MCP server: http://localhost:${port}/mcp`);
});
