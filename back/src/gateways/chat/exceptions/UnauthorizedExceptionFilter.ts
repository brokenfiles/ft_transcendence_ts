import {Catch, ArgumentsHost, Logger} from '@nestjs/common';
import { BaseWsExceptionFilter } from '@nestjs/websockets';
import {Socket} from "socket.io";

@Catch()
export class UnauthorizedExceptionFilter extends BaseWsExceptionFilter {

    private logger: Logger = new Logger('UnauthorizedExceptionFilter')

    catch(exception: any, host: ArgumentsHost) {
        if (exception.status === 401) {
            const client = host.switchToWs().getClient() as Socket
            this.logger.log(`Client with id ${client.id} (${client.handshake.address}) has a unauthorized token`)
            client.send({
                code: exception.status,
                error: exception.response.message,
            })
        } else {
            super.catch(exception, host);
        }
    }
}
