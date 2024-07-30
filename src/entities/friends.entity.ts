import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./users";

@Index("friend_id", ["friendId"], {})
@Entity("friends")
export class Friends {
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

  @ManyToOne(() => Users, (users) => users.friends, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: Users;

  @ManyToOne(() => Users, (users) => users.friends2, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "friend_id", referencedColumnName: "userId" }])
  friend: Users;
}
