import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BannedUser } from "./banned-user.entity";
import { ChatRoomMember } from "./chat-room-member.entity";
import { Message } from "./message.entity";

@Entity("chat_room")
export class ChatRoom {
  @PrimaryGeneratedColumn({ type: "int", name: "chat_room_id" })
  chatRoomId: number;

  @Column({type: "varchar", nullable: true, length: 100 })
  name: string | null;

  @Column({
    type: "tinyint", 
    name: "is_group",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isGroup: boolean | null;

  @Column({
    type: "timestamp", 
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @OneToMany(() => BannedUser, (bannedUsers) => bannedUsers.chatRoom)
  bannedUsers: BannedUser[];

  @OneToMany(
    () => ChatRoomMember,
    (chatRoomMember) => chatRoomMember.chatRoom
  )
  chatRoomMembers: ChatRoomMember[];

  @OneToMany(() => Message, (messages) => messages.chatRoom)
  messages: Message[];
}
