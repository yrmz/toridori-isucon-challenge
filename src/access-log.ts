import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    response.on("finish", () => {
      const { statusCode } = response;
      this.logger.log(
        `[${statusCode.toString()}] ${ip ?? "unknown"} ${method} ${originalUrl} `,
      );
    });
    next();
  }
}
