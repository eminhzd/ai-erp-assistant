export type ActionSuccess<T> = {
  data: T;
  error: null;
  success: true;
};

export type ActionError = {
  data: null;
  error: string;
  success: false;
};

export type ActionResult<T> = ActionSuccess<T> | ActionError;
