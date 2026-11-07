import express, { Request, Response } from "express";
import { elasticSearch, postgres } from "./infra/client.js";

const app = express();

app.get("/health", async (_req: Request, res: Response) => {
  try {
    const pg = await postgres.query("SELECT NOW()");
    const es = await elasticSearch.info();

    res.status(200).json({
      success: true,
      services: {
        postgres: {
          status: "connected",
          time: pg.rows[0].now,
        },
        elasticsearch: {
          status: "connected",
          cluster: es.cluster_name,
          version: es.version.number,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "One or more service is down",
    });
  }
});

app.listen(5000, () => {
  console.log("Server is listening on port 5000");
});
