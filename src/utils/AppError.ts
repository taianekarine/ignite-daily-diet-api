// eslint-disable-next-line
interface AppErrorProps {
  message: string
  statusCode: number
}

export class AppError {
  message: string
  statusCode: number

  constructor(message: string, statusCode = 400) {
    this.message = message
    this.statusCode = statusCode
  }
}
