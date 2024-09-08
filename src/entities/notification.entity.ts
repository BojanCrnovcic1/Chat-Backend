import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Friend } from "./friend.entity";

@Index("user_id", ["userId"], {})
@Entity("notification")
export class Notification {
  @PrimaryGeneratedColumn({ type: "int", name: "notification_id" })
  notificationId: number;

  @Column({type: "int",  name: "user_id", nullable: true })
  userId: number | null;

  @Column({type: "varchar", nullable: true, length: 255 })
  message: string | null;

  @Column({
    type: "tinyint", 
    name: "is_read",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isRead: boolean | null;

  @Column({
    type: "timestamp", 
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => User, (users) => users.notifications, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })

  @ManyToOne(() => Friend, friend => friend.notifications )
  @JoinColumn([{ name: "friend_id", referencedColumnName: "friendId" }])
  friend: Friend;
  
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
