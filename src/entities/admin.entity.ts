import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { AdminMessage } from "./admin-message.entity";

@Index("uq_admin_username", ["username"], { unique: true })
@Index("uq_admin_email", ["email"], { unique: true })
@Entity("admin", { schema: "chat_real" })
export class Admin {
  @PrimaryGeneratedColumn({ type: "int", name: "admin_id", unsigned: true })
  adminId: number;

  @Column("varchar", { name: "username", unique: true, length: 50 })
  username: string;

  @Column("varchar", { name: "email", unique: true, length: 100 })
  email: string;

  @Column("varchar", { name: "password_hash", length: 255 })
  passwordHash: string;

  @OneToMany(() => AdminMessage, (adminMessage) => adminMessage.admin)
  adminMessages: AdminMessage[];
}
