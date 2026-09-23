import "dotenv/config";
import { app } from "./app";

//later make initApp call when services are connected like db
if (true) {
  initApp();
} else {
  process.exit(0);
}

function initApp() {
  app
    .listen(4000, () => {
      console.log("server is running on 4000");
    })
    .on("error", (err) => {
      console.log(err);
      process.exit(0);
    });
}
