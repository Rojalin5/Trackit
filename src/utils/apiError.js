class apiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong!",
    error = [],
    stack = ""
  ) {
    super(message)
    this.message=message
    this.statusCode=statusCode
    this.error=error
    this.success=false
    this.data=null
  if(stack){
this.stack = stack
  }
  else{
    Error.captureStackTrace(this,this.constructor)
  }
}
}

export {apiError}