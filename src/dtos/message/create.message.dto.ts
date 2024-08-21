export class CreateMessageDto {
    content: string;
    contentType: 'text' | 'image' | 'link' | 'video' | 'audio';
    chatRoomId?: number;
    userId?: number;
    parentMessageId?: number;

}