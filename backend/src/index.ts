import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./common/logger";
import { connectDatabase } from "./config/database";

const startServer = async () => {
  await connectDatabase();
  app.listen(env.port, "0.0.0.0", () => {
    logger.info(`API listening on port ${env.port}`);
  });
};

startServer();
