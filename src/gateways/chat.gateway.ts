import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    afterInit(server: Server) {
        console.log('WebSocket server initialized');
    }

    handleConnection(client: Socket, ...args: any[]) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('sendMessage')
    handleMessage(client: Socket, payload: { sender: string, message: string }): void {
        this.server.emit('receiveMessage', payload);
    }

    broadcastMessage(event: string, payload: any): void {
        if (this.server) {
            this.server.emit(event, payload);
        } else {
            console.error('WebSocket server is not initialized');
        }
    }

    

    notifyUser(userId: number, message: string): void {
        this.server.to(`user_${userId}`).emit('notification', message);
    }

    @SubscribeMessage('subscribeToNotifications')
    handleSubscription(client: Socket, payload: { userId: number }): void {
        client.join(`user_${payload.userId}`);
    }
}
