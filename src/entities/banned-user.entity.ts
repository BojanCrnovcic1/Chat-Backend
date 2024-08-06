import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ChatRoom } from "./chat-room.entity";
import { User } from "./user.entity";

@Index("user_id", ["userId"], {})
@Entity("banned_user")
export class BannedUser {
  @Column({type: "int",  primary: true, name: "chat_room_id" })
  chatRoomId: number;

  @Column({type: "int",  primary: true, name: "user_id" })
  userId: number;

  @Column({
    type: "timestamp", 
    name: "banned_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  bannedAt: Date | null;

  @ManyToOne(() => ChatRoom, (chatRooms) => chatRooms.bannedUsers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "chat_room_id", referencedColumnName: "chatRoomId" }])
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (users) => users.bannedUsers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
