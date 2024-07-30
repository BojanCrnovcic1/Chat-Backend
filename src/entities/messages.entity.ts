import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ChatRooms } from "./chat-rooms.entity";
import { Users } from "./users";

@Index("chat_room_id", ["chatRoomId"], {})
@Index("user_id", ["userId"], {})
@Index("parent_message_id", ["parentMessageId"], {})
@Entity("messages")
export class Messages {
  @PrimaryGeneratedColumn({ type: "int", name: "message_id" })
  messageId: number;

  @Column({type: "int",  name: "chat_room_id", nullable: true })
  chatRoomId: number | null;

  @Column({type: "int",  name: "user_id", nullable: true })
  userId: number | null;

  @Column("text", { name: "content", nullable: true })
  content: string | null;

  @Column({
    type: "enum", 
    name: "content_type",
    nullable: true,
    enum: ["text", "image", "link"],
    default: () => "'text'",
  })
  contentType: "text" | "image" | "link" | null;

  @Column({type: "int",  name: "parent_message_id", nullable: true })
  parentMessageId: number | null;

  @Column({
    type: "timestamp", 
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => ChatRooms, (chatRooms) => chatRooms.messages, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "chat_room_id", referencedColumnName: "chatRoomId" }])
  chatRoom: ChatRooms;

  @ManyToOne(() => Users, (users) => users.messages, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: Users;

  @ManyToOne(() => Messages, (messages) => messages.messages, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([
    { name: "parent_message_id", referencedColumnName: "messageId" },
  ])
  parentMessage: Messages;

  @OneToMany(() => Messages, (messages) => messages.parentMessage)
  messages: Messages[];
}
