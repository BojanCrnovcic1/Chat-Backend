import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ChatRoom } from "./chat-room.entity";
import { User } from "./user.entity";

@Index("fk_chat_room_member_user_id", ["userId"], {})
@Entity("chat_room_member")
export class ChatRoomMember {
  @Column({ type: "int", primary: true, name: "chat_room_id", unsigned: true })
  chatRoomId: number;

  @Column({ type: "int", primary: true, name: "user_id", unsigned: true })
  userId: number;

  @Column({
    type: "enum", 
    nullable: true,
    enum: ["member", "admin"],
    default: () => "'member'",
  })
  role: "member" | "admin" | null;

  @Column({
    type: "timestamp", 
    name: "joined_at",
    nullable: true,
    default: () => "'now()'",
  })
  joinedAt: Date | null;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatRoomMembers, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "chat_room_id", referencedColumnName: "chatRoomId" }])
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.chatRoomMembers, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
