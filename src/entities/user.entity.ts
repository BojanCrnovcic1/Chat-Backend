import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BannedUser } from "./banned-user.entity";
import { ChatRoomMember } from "./chat-room-member.entity";
import { Friend } from "./friend.entity";
import { Message } from "./message.entity";
import { Notification } from "./notification.entity";

@Index("username", ["username"], { unique: true })
@Index("email", ["email"], { unique: true })
@Entity("user")
export class User {
  @PrimaryGeneratedColumn({ type: "int", name: "user_id" })
  userId: number;

  @Column({type: "varchar", unique: true, length: 50 })
  username: string;

  @Column({type: "varchar", unique: true, length: 100 })
  email: string;

  @Column({type: "varchar", name: "password_hash", length: 255 })
  passwordHash: string;

  @Column({type: "varchar",  name: "profile_picture", nullable: true, length: 255 })
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
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt: Date | null;

  @OneToMany(() => BannedUser, (bannedUsers) => bannedUsers.user)
  bannedUsers: BannedUser[];

  @OneToMany(() => ChatRoomMember, (chatRoomMembers) => chatRoomMembers.user)
  chatRoomMembers: ChatRoomMember[];

  @OneToMany(() => Friend, (friends) => friends.user)
  friends: Friend[];

  @OneToMany(() => Friend, (friends) => friends.friend)
  friends2: Friend[];

  @OneToMany(() => Message, (messages) => messages.user)
  messages: Message[];

  @OneToMany(() => Notification, (notifications) => notifications.user)
  notifications: Notification[];
}
