export class CreateMessageDto {
    content: string;
    contentType: 'text' | 'image' | 'link';
    chatRoomId?: number;
    userId?: number;
    parentMessageId?: number;

}