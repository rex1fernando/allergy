



export class MyError {
    constructor (message) {
        this.name = this.constructor.name;
        this.message = message;
        this.stack = (new Error(message)).stack;
    }
}

MyError.prototype = Object.create(Error.prototype);
MyError.prototype.constructor = MyError;


export function handleError(err) {
  
  console.log(err);
  if (err instanceof FirebaseInitializationError) {
    return [{type: 'report_error', title: 'An error occured', text: err.message + "\nTalk to Rex, sorry!"}];
  } else 
    return [{type: 'report_error', title: 'An error occured', text: err.message + "\nTalk to Rex, sorry!"}];
}


export class LocalPersistError extends MyError {
  constructor(err) {
    super("Local persist error: " + err);
    this.err = err
  }
}
export class FirebasePutError extends MyError {
  constructor(err) {
    super("Firebase put error: " + err);
    this.err = err
  }
}
export class PhotoCacheError extends MyError {
  constructor(err) {
    super("Photo cache error: " + err);
    this.err = err
  }
}
export class FirebaseInitializationError extends MyError {
  constructor(err) {
    super("Firebase failed to start: " + err);
    this.err = err
  }
}
