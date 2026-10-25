import "dotenv/config";
import { config } from "./config/env";
import { app } from "./app";
import { pingDB } from "./db/pool";

pingDB()
  .then(() => initApp())
  .catch((err) => {
    console.log("Application startup failed...");
    process.exit(1);
  });

function initApp() {
  app
    .listen(config.PORT, () => {
      console.log("server is running on 4000");
    })
    .on("error", (err) => {
      console.log(err);
      process.exit(1);
    });
}
