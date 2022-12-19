import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger();
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isHttp = context.getType() === 'http';
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    if (isHttp) {
      this.logger.log(
        `<Rest request url: ${request.url}, method: ${
          request.method
        }> params: ${JSON.stringify(request.params)}, query: ${JSON.stringify(
          request.query,
        )}, body: ${JSON.stringify(request.body)}`,
      );
    }
    return next.handle().pipe(
      tap((value) => {
        if (isHttp) {
          return this.logger.log(
            `<Rest response url: ${request.url}, method: ${
              request.method
            }> statusCode: ${response.statusCode}, response: ${JSON.stringify(
              value,
            )}`,
          );
        }
      }),
    );
  }
}
