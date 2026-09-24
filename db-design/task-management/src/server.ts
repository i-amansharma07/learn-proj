import "dotenv/config";
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
    .listen(4000, () => {
      console.log("server is running on 4000");
    })
    .on("error", (err) => {
      console.log(err);
      process.exit(1);
    });
}
