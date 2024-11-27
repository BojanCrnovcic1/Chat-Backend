import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";

@Index("fk_account_deletion_user_id", ["userId"], {})
@Entity("account_deletion_request", { schema: "chat_real" })
export class AccountDeletionRequest {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "account_delete_id",
    unsigned: true,
  })
  accountDeleteId: number;

  @Column("int", { name: "user_id", unsigned: true })
  userId: number;

  @Column("timestamp", {
    name: "requested_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  requestedAt: Date | null;

  @Column("tinyint", {
    name: "is_reviewed",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isReviewed: boolean | null;

  @Column("text", { name: "reason", nullable: true })
  reason: string | null;

  @ManyToOne(() => User, (user) => user.accountDeletionRequests, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
