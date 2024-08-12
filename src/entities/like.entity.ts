import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Message } from "./message.entity";
import { User } from "./user.entity";

@Index("fk_like_user_id", ["userId"], {})
@Index("fk_like_message_id", ["messageId"], {})
@Entity("like")
export class Like {
  @PrimaryGeneratedColumn({ type: "int", name: "like_id", unsigned: true })
  likeId: number;

  @Column({type: "int", name: "user_id" })
  userId: number;

  @Column({type: "int", name: "message_id" })
  messageId: number;

  @ManyToOne(() => Message, (message) => message.likes, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "message_id", referencedColumnName: "messageId" }])
  message: Message;

  @ManyToOne(() => User, (user) => user.likes, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
