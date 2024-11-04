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

@Index("chat_room_id", ["chatRoomId"], {})
@Index("parent_message_id", ["parentMessageId"], {})
@Index("user_id", ["userId"], {})
@Entity("message")
export class Message {
  @PrimaryGeneratedColumn({ type: "int", name: "message_id" })
  messageId: number;

  @Column({ type: "int",  name: "chat_room_id", nullable: true })
  chatRoomId: number | null;

  @Column({ type: "int",  name: "user_id", nullable: true })
  userId: number | null;

  @Column({ type: "int",  name: "content", nullable: true })
  content: string | null;

  @Column({
    type: "enum", 
    name: "content_type",
    nullable: true,
    enum: ["text", "image", "link", "video", "audio"],
    default: () => "'text'",
  })
  contentType: "text" | "image" | "link" | "video" | "audio" | null;

  @Column("int", { name: "parent_message_id", nullable: true })
  parentMessageId: number | null;

  @Column({
    type: "timestamp", 
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @OneToMany(() => Like, (like) => like.message)
  likes: Like[];

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.messages, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "chat_room_id", referencedColumnName: "chatRoomId" }])
  chatRoom: ChatRoom;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

  @ManyToOne(() => Message, (message) => message.messages, {
    onDelete: "CASCADE",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([
    { name: "parent_message_id", referencedColumnName: "messageId" },
  ])
  parentMessage: Message;

  @OneToMany(() => Message, (message) => message.parentMessage)
  messages: Message[];
}
