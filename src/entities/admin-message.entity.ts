import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Admin } from "./admin.entity";
import { User } from "./user.entity";

@Index("fk_admin_message_admin_id", ["adminId"], {})
@Index("fk_admin_message_user_id", ["userId"], {})
@Index("idx_admin_message_is_global", ["isGlobal"], {})
@Entity("admin_message", { schema: "chat_real" })
export class AdminMessage {
  @PrimaryGeneratedColumn({
    type: "int",
    name: "admin_message_id",
    unsigned: true,
  })
  adminMessageId: number;

  @Column("int", { name: "admin_id", unsigned: true })
  adminId: number;

  @Column("int", { name: "user_id", nullable: true, unsigned: true })
  userId: number | null;

  @Column("text", { name: "content" })
  content: string;

  @Column("tinyint", {
    name: "is_global",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  isGlobal: boolean | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "'now()'",
  })
  createdAt: Date | null;

  @ManyToOne(() => Admin, (admin) => admin.adminMessages, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "admin_id", referencedColumnName: "adminId" }])
  admin: Admin;

  @ManyToOne(() => User, (user) => user.adminMessages, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "userId" }])
  user: User;
}
