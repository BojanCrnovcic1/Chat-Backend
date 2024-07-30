import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BannedUsers } from "./banned-users.entity";
import { ChatRoomMembers } from "./chat-room-members.entity";
import { Friends } from "./friends.entity";
import { Messages } from "./messages.entity";
import { Notifications } from "./Notifications";

@Index("username", ["username"], { unique: true })
@Index("email", ["email"], { unique: true })
@Entity("users", { schema: "chat" })
export class Users {
  @PrimaryGeneratedColumn({ type: "int", name: "user_id" })
  userId: number;

  @Column("varchar", { name: "username", unique: true, length: 50 })
  username: string;

  @Column("varchar", { name: "email", unique: true, length: 100 })
  email: string;

  @Column("varchar", { name: "password", length: 255 })
  password: string;

  @Column("varchar", { name: "profile_picture", nullable: true, length: 255 })
  profilePicture: string | null;

  @Column("tinyint", {
    name: "online_status",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  onlineStatus: boolean | null;

  @Column("timestamp", {
    name: "created_at",
    nullable: true,
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @OneToMany(() => BannedUsers, (bannedUsers) => bannedUsers.user)
  bannedUsers: BannedUsers[];

  @OneToMany(() => ChatRoomMembers, (chatRoomMembers) => chatRoomMembers.user)
  chatRoomMembers: ChatRoomMembers[];

  @OneToMany(() => Friends, (friends) => friends.user)
  friends: Friends[];

  @OneToMany(() => Friends, (friends) => friends.friend)
  friends2: Friends[];

  @OneToMany(() => Messages, (messages) => messages.user)
  messages: Messages[];

  @OneToMany(() => Notifications, (notifications) => notifications.user)
  notifications: Notifications[];
}
