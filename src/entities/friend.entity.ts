import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";

@Index("friend_id", ["friendId"], {})
@Entity("friend")
export class Friend {
  @Column({type: "int",  primary: true, name: "user_id" })
  userId: number;

  @Column({type: "int",  primary: true, name: "friend_id" })
  friendId: number;

  @Column({
    type: "enum", 
    nullable: true,
    enum: ["pending", "accepted", "blocked"],
    default: () => "'pending'",
  })
  status: "pending" | "accepted" | "blocked" | null;

  @Column({
    type: "timestamp", 
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @ManyToOne(() => User, (users) => users.friends, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;

  @ManyToOne(() => User, (users) => users.friends2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "friend_id", referencedColumnName: "userId" }])
  friend: User;
}
