import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatRoom } from "./chat-room.entity";
import { User } from "./user.entity";
import { Message } from "./message.entity";

@Index("fk_notification_chat_room_id", ["chatRoomId"], {})
@Index("fk_notification_message_id", ["messageId"], {})
@Index("fk_notification_user_id", ["userId"], {})
@Entity("notification", { schema: "chat_real" })
export class Notification {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "notification_id",
    unsigned: true,
  })
  notificationId: number;

  @Column("int", { name: "user_id", nullable: true, unsigned: true })
  userId: number | null;

  @Column("int", { name: "chat_room_id", nullable: true, unsigned: true })
  chatRoomId: number | null;

  @Column("int", { name: "message_id", nullable: true, unsigned: true })
  messageId: number | null;

  @Column("varchar", { name: "message", nullable: true, length: 255 })
  message: string | null;

  @Column("tinyint", {
    name: "is_read",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isRead: boolean | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "'now()'",
  })
  createdAt: Date | null;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.notifications, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "chat_room_id", referencedColumnName: "chatRoomId" }])
  chatRoom: ChatRoom;

  @ManyToOne(() => Message, (message) => message.notifications, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "message_id", referencedColumnName: "messageId" }])
  message_2: Message;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

}
