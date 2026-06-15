import { attachErrorHandler, createApp } from "./server/app.ts";

const app = createApp();
attachErrorHandler(app);

export default app;
