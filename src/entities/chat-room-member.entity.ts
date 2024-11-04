import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ChatRoom } from "./chat-room.entity";
import { User } from "./user.entity";

@Index("user_id", ["userId"], {})
@Entity("chat_room_member")
export class ChatRoomMember {
  @Column({type: "int", primary: true, name: "chat_room_id" })
  chatRoomId: number;

  @Column({type: "int", primary: true, name: "user_id" })
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
    default: () => "CURRENT_TIMESTAMP",
  })
  joinedAt: Date | null;

  @ManyToOne(() => ChatRoom, (chatRooms) => chatRooms.chatRoomMembers, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "chat_room_id", referencedColumnName: "chatRoomId" }])
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (users) => users.chatRoomMembers, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
