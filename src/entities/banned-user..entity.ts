import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { ChatRoom } from "./chat-room.entity";
import { User } from "./user.entity";

@Index("fk_banned_user_user_id", ["userId"], {})
@Entity("banned_user")
export class BannedUser {
  @Column({type: "int", primary: true, name: "chat_room_id", unsigned: true })
  chatRoomId: number;

  @Column({type: "int", primary: true, name: "user_id", unsigned: true })
  userId: number;

  @Column({type: "timestamp",  name: "banned_at", default: () => "'now()'" })
  bannedAt: Date;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.bannedUsers, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "chat_room_id", referencedColumnName: "chatRoomId" }])
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.bannedUsers, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
