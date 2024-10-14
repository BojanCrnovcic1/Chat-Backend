
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Friend } from "./friend.entity";
import { User } from "./user.entity";

@Index("user_id", ["userId"], {})
@Index("fk_notification_friend_id", ["friendId"], {})
@Entity("notification", { schema: "chat" })
export class Notification {
  @PrimaryGeneratedColumn({ type: "int", name: "notification_id" })
  notificationId: number;

  @Column("int", { name: "user_id", nullable: true })
  userId: number | null;

  @Column("int", { name: "friend_id", nullable: true })
  friendId: number | null;

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
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => Friend, (friend) => friend.notifications, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "friend_id", referencedColumnName: "friendId" }])
  friend: Friend;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
