import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class GameFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {}
}
