import swaggerJsDoc, { Options } from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

export const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Documentation for your Node.js backend",
    },
    servers: [
      {
        url: "http://localhost:3333",
      },
    ],
  },
  apis: ["./app/src/infra/routers/*.ts", "./app/src/infra/express/*.ts"],
};

export const swaggerDocs = swaggerJsDoc(swaggerOptions);

export const swaggerUiOptions = {
  explorer: true,
};

export const swaggerUiSetup = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocs, swaggerUiOptions)
  );
};
