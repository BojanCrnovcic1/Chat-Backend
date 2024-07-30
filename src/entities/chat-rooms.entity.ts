import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { BannedUsers } from "./banned-users.entity";
import { ChatRoomMembers } from "./chat-room-members.entity";
import { Messages } from "./messages.entity";

@Entity("chat_rooms")
export class ChatRooms {
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

  @OneToMany(() => BannedUsers, (bannedUsers) => bannedUsers.chatRoom)
  bannedUsers: BannedUsers[];

  @OneToMany(
    () => ChatRoomMembers,
    (chatRoomMembers) => chatRoomMembers.chatRoom
  )
  chatRoomMembers: ChatRoomMembers[];

  @OneToMany(() => Messages, (messages) => messages.chatRoom)
  messages: Messages[];
}
