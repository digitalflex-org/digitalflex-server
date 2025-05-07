import { BaseError } from './BaseError';

export class NotFoundError extends BaseError {
  constructor(message = 'Resource Not Found!') {
    super(message, 404)
  }
}

export class BadRequest extends BaseError {
  constructor(message = 'Bad Request') {
    super(message, 400)
  }

}

export class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}
export class InternalServerError extends BaseError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

export class ResourceConflicts extends BaseError {
  constructor(message = 'Data with similar details already exists!') {
    super(message, 409)
  }
}