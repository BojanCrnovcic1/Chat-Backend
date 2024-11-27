import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

@Index("fk_friend_receiver_id", ["receiverId"], {})
@Index("fk_friend_sender_id", ["senderId"], {})
@Entity("friend")
export class Friend {
  @PrimaryGeneratedColumn({ type: "int", name: "friend_id", unsigned: true })
  friendId: number;

  @Column({ type: "int", name: "sender_id", unsigned: true })
  senderId: number;

  @Column({ type: "int", name: "receiver_id", unsigned: true })
  receiverId: number;

  @Column({
    type: "enum", 
    nullable: true,
    enum: ["pending", "accepted", "rejected"],
    default: () => "'pending'",
  })
  status: "pending" | "accepted" | "rejected" | null;

  @Column({
    type: "timestamp", 
    name: "created_at",
    nullable: true,
    default: () => "'now()'",
  })
  createdAt: Date | null;

  @ManyToOne(() => User, (user) => user.friends, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "receiver_id", referencedColumnName: "userId" }])
  receiver: User;

  @ManyToOne(() => User, (user) => user.friends2, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "sender_id", referencedColumnName: "userId" }])
  sender: User;
}
