import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BannedUser } from "./banned-user..entity";
import { ChatRoomMember } from "./chat-room-member.entity";
import { Friend } from "./friend.entity";
import { Like } from "./like.entity";
import { Message } from "./message.entity";
import { Notification } from "./notification.entity";

@Index("uq_user_email", ["email"], { unique: true })
@Index("uq_user_username", ["username"], { unique: true })
@Entity("user")
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "user_id", unsigned: true })
  userId: number;

  @Column({ type: "varchar", unique: true, length: 50 })
  username: string;

  @Column({ type: "varchar", unique: true, length: 100 })
  email: string;

  @Column({ type: "varchar", name: "password_hash", length: 255 })
  passwordHash: string;

  @Column({ type: "varchar", name: "profile_picture", nullable: true, length: 255 })
  profilePicture: string | null;

  @Column({
    type: "tinyint", 
    name: "online_status",
    nullable: true,
    width: 1,
    default: () => "'0'",
  })
  onlineStatus: boolean | null;

  @Column({
    type: "timestamp", 
    name: "created_at",
    nullable: true,
    default: () => "'now()'",
  })
  createdAt: Date | null;

  @Column("timestamp", {
    name: "last_active",
    nullable: true,
    default: () => "'now()'",
  })
  lastActive: Date | null;

  @OneToMany(() => BannedUser, (bannedUser) => bannedUser.user)
  bannedUsers: BannedUser[];

  @OneToMany(() => ChatRoomMember, (chatRoomMember) => chatRoomMember.user)
  chatRoomMembers: ChatRoomMember[];

  @OneToMany(() => Friend, (friend) => friend.receiver)
  friends: Friend[];

  @OneToMany(() => Friend, (friend) => friend.sender)
  friends2: Friend[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
