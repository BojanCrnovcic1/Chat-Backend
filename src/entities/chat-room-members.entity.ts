import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ChatRooms } from "./chat-rooms.entity";
import { Users } from "./users";

@Index("user_id", ["userId"], {})
@Entity("chat_room_members")
export class ChatRoomMembers {
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

  @ManyToOne(() => ChatRooms, (chatRooms) => chatRooms.chatRoomMembers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "chat_room_id", referencedColumnName: "chatRoomId" }])
  chatRoom: ChatRooms;

  @ManyToOne(() => Users, (users) => users.chatRoomMembers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: Users;
}
