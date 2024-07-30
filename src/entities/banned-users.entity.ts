import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ChatRooms } from "./chat-rooms.entity";
import { Users } from "./users";

@Index("user_id", ["userId"], {})
@Entity("banned_users")
export class BannedUsers {
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

  @ManyToOne(() => ChatRooms, (chatRooms) => chatRooms.bannedUsers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "chat_room_id", referencedColumnName: "chatRoomId" }])
  chatRoom: ChatRooms;

  @ManyToOne(() => Users, (users) => users.bannedUsers, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: Users;
}
