import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Like } from "./like.entity";
import { ChatRoom } from "./chat-room.entity";
import { User } from "./user.entity";
import { Notification } from "./notification.entity";
@Index("fk_message_chat_room_id", ["chatRoomId"], {})
@Index("fk_message_parent_message_id", ["parentMessageId"], {})
@Index("fk_message_user_id", ["userId"], {})
@Entity("message")
export class Message {
  @PrimaryGeneratedColumn({ type: "int", name: "message_id", unsigned: true })
  messageId: number;

  @Column("int", { name: "chat_room_id", nullable: true, unsigned: true })
  chatRoomId: number | null;

  @Column("int", { name: "user_id", nullable: true, unsigned: true })
  userId: number | null;

  @Column("text", { name: "content", nullable: true })
  content: string | null;

  @Column("enum", {
    name: "content_type",
    nullable: true,
    enum: ["text", "image", "link", "video", "audio"],
  })
  contentType: "text" | "image" | "link" | "video" | "audio" | null;

  @Column("int", { name: "parent_message_id", nullable: true, unsigned: true })
  parentMessageId: number | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "'now()'",
  })
  createdAt: Date | null;

  @OneToMany(() => Like, (like) => like.message)
  likes: Like[];

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "chat_room_id", referencedColumnName: "chatRoomId" }])
  chatRoom: ChatRoom;

  @ManyToOne(() => Message, (message) => message.messages, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([
    { name: "parent_message_id", referencedColumnName: "messageId" },
  ])
  parentMessage: Message;

  @OneToMany(() => Message, (message) => message.parentMessage)
  messages: Message[];

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

  @OneToMany(() => Notification, (notification) => notification.message_2)
  notifications: Notification[];

}
