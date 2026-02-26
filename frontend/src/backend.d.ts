import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Comment {
    text: string;
    author: Principal;
    timestamp: bigint;
}
export interface Post {
    id: bigint;
    likeCount: bigint;
    author: Principal;
    imageUrl: string;
    timestamp: bigint;
    caption: string;
    comments: Array<Comment>;
}
export interface Notification {
    seen: boolean;
    recipient: Principal;
    timestamp: bigint;
    eventType: NotificationEventType;
    postId?: bigint;
}
export interface Story {
    author: Principal;
    imageUrl: string;
    timestamp: bigint;
}
export interface UserProfile {
    bio: string;
    displayName: string;
    avatarUrl: string;
}
export enum NotificationEventType {
    userFollowed = "userFollowed",
    postLiked = "postLiked",
    postCommented = "postCommented"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: bigint, text: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPost(imageUrl: string, caption: string): Promise<void>;
    createStory(imageUrl: string): Promise<void>;
    follow(userToFollow: Principal): Promise<void>;
    getActiveStories(): Promise<Array<[Principal, Array<Story>]>>;
    getAllPostsForExplore(): Promise<Array<Post>>;
    getAllRecentPosts(): Promise<Array<Post>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFollowerCount(user: Principal): Promise<bigint>;
    getFollowingCount(user: Principal): Promise<bigint>;
    getHomeFeed(): Promise<Array<Post>>;
    getNotifications(): Promise<Array<Notification>>;
    getPost(id: bigint): Promise<Post | null>;
    getSavedPosts(): Promise<Array<Post>>;
    getStoryAvatars(): Promise<Array<[Principal, string]>>;
    getUnreadNotificationCount(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasLikedPost(postId: bigint): Promise<boolean>;
    hasSavedPost(postId: bigint): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    isFollowing(userToCheck: Principal): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    markNotificationsRead(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    savePost(postId: bigint): Promise<void>;
    searchUsers(searchTerm: string): Promise<Array<[Principal, UserProfile]>>;
    unfollow(userToUnfollow: Principal): Promise<void>;
    unlikePost(postId: bigint): Promise<void>;
    unsavePost(postId: bigint): Promise<void>;
    updateProfile(displayName: string, bio: string, avatarUrl: string): Promise<void>;
}
