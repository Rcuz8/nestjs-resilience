import {
	RetryOptions,
	RetryStrategy,
	Strategy,
	TimeoutOptions,
	TimeoutStrategy
} from './strategies';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Type } from '@nestjs/common';
import { ResilienceFactory } from './resilience.factory';
import { Observable } from 'rxjs';

export function ResilienceInterceptor<T>(
	strategy: Type<Strategy<T>>,
	options: T
): Type<NestInterceptor> {
	@Injectable()
	class Interceptor implements NestInterceptor {
		private readonly strategy = this.factory.createStrategy(strategy, options);

		public constructor(private readonly factory: ResilienceFactory) {}

		public intercept(
			context: ExecutionContext,
			next: CallHandler<any>
		): Observable<any> | Promise<Observable<any>> {
			return this.strategy.execute(next.handle());
		}
	}

	return Interceptor;
}

export const TimeoutInterceptor = (options: TimeoutOptions) =>
	ResilienceInterceptor(TimeoutStrategy, options);

export const RetryInterceptor = (options: RetryOptions) =>
	ResilienceInterceptor(RetryStrategy, options);
