import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Post, Story, Notification } from '../backend';
import { Principal } from '@dfinity/principal';

// ─── Profile Queries ───────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetUserProfile(userPrincipal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      return actor.getUserProfile(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, bio, avatarUrl }: { displayName: string; bio: string; avatarUrl: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProfile(displayName, bio, avatarUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

// ─── Post Queries ──────────────────────────────────────────────────────────────

export function useGetHomeFeed() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['homeFeed'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getHomeFeed();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllRecentPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['allRecentPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRecentPosts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPost(postId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post | null>({
    queryKey: ['post', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return null;
      return actor.getPost(postId);
    },
    enabled: !!actor && !actorFetching && postId !== null,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageUrl, caption }: { imageUrl: string; caption: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(imageUrl, caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['allRecentPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['explorePosts'] });
    },
  });
}

export function useGetUserPosts(userPrincipal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['userPosts', userPrincipal],
    queryFn: async () => {
      if (!actor) return [];
      const allPosts = await actor.getAllRecentPosts();
      if (!userPrincipal) return [];
      return allPosts.filter((p) => p.author.toString() === userPrincipal);
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

// ─── Like Queries ──────────────────────────────────────────────────────────────

export function useHasLikedPost(postId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasLiked', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return false;
      return actor.hasLikedPost(postId);
    },
    enabled: !!actor && !actorFetching && postId !== null,
  });
}

export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.likePost(postId);
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['hasLiked', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['allRecentPosts'] });
      queryClient.invalidateQueries({ queryKey: ['explorePosts'] });
    },
  });
}

export function useUnlikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unlikePost(postId);
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['hasLiked', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['allRecentPosts'] });
      queryClient.invalidateQueries({ queryKey: ['explorePosts'] });
    },
  });
}

// ─── Comment Queries ───────────────────────────────────────────────────────────

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, text }: { postId: bigint; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addComment(postId, text);
    },
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['allRecentPosts'] });
    },
  });
}

// ─── Follow Queries ────────────────────────────────────────────────────────────

export function useIsFollowing(userPrincipal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isFollowing', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return false;
      return actor.isFollowing(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

export function useFollow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToFollow: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.follow(Principal.fromText(userToFollow));
    },
    onSuccess: (_data, userToFollow) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userToFollow] });
      queryClient.invalidateQueries({ queryKey: ['followerCount', userToFollow] });
      queryClient.invalidateQueries({ queryKey: ['followingCount'] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
    },
  });
}

export function useUnfollow() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userToUnfollow: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollow(Principal.fromText(userToUnfollow));
    },
    onSuccess: (_data, userToUnfollow) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', userToUnfollow] });
      queryClient.invalidateQueries({ queryKey: ['followerCount', userToUnfollow] });
      queryClient.invalidateQueries({ queryKey: ['followingCount'] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
    },
  });
}

export function useGetFollowerCount(userPrincipal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['followerCount', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return BigInt(0);
      return actor.getFollowerCount(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

export function useGetFollowingCount(userPrincipal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['followingCount', userPrincipal],
    queryFn: async () => {
      if (!actor || !userPrincipal) return BigInt(0);
      return actor.getFollowingCount(Principal.fromText(userPrincipal));
    },
    enabled: !!actor && !actorFetching && !!userPrincipal,
  });
}

// ─── Stories Queries ───────────────────────────────────────────────────────────

export function useGetActiveStories() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[import('@dfinity/principal').Principal, Story[]]>>({
    queryKey: ['activeStories'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveStories() as Promise<Array<[import('@dfinity/principal').Principal, Story[]]>>;
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useGetStoryAvatars() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[import('@dfinity/principal').Principal, string]>>({
    queryKey: ['storyAvatars'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getStoryAvatars() as Promise<Array<[import('@dfinity/principal').Principal, string]>>;
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useCreateStory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUrl: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createStory(imageUrl);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeStories'] });
      queryClient.invalidateQueries({ queryKey: ['storyAvatars'] });
    },
  });
}

// ─── Explore Queries ───────────────────────────────────────────────────────────

export function useSearchUsers(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Array<[import('@dfinity/principal').Principal, import('../backend').UserProfile]>>({
    queryKey: ['searchUsers', searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchUsers(searchTerm) as Promise<Array<[import('@dfinity/principal').Principal, import('../backend').UserProfile]>>;
    },
    enabled: !!actor && !actorFetching && searchTerm.trim().length > 0,
  });
}

export function useGetAllPostsForExplore() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['explorePosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPostsForExplore();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30_000,
  });
}

// ─── Notifications Queries ─────────────────────────────────────────────────────

export function useGetNotifications() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNotifications();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useGetUnreadNotificationCount() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<bigint>({
    queryKey: ['unreadNotificationCount'],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationsRead() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.markNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
    },
  });
}

// ─── Save/Bookmark Queries ─────────────────────────────────────────────────────

export function useGetSavedPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['savedPosts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSavedPosts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useHasSavedPost(postId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['hasSaved', postId?.toString()],
    queryFn: async () => {
      if (!actor || postId === null) return false;
      return actor.hasSavedPost(postId);
    },
    enabled: !!actor && !actorFetching && postId !== null,
  });
}

export function useSavePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.savePost(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['hasSaved', postId.toString()] });
      const previous = queryClient.getQueryData(['hasSaved', postId.toString()]);
      queryClient.setQueryData(['hasSaved', postId.toString()], true);
      return { previous };
    },
    onError: (_err, postId, context) => {
      queryClient.setQueryData(['hasSaved', postId.toString()], context?.previous);
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['hasSaved', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
    },
  });
}

export function useUnsavePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unsavePost(postId);
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['hasSaved', postId.toString()] });
      const previous = queryClient.getQueryData(['hasSaved', postId.toString()]);
      queryClient.setQueryData(['hasSaved', postId.toString()], false);
      return { previous };
    },
    onError: (_err, postId, context) => {
      queryClient.setQueryData(['hasSaved', postId.toString()], context?.previous);
    },
    onSuccess: (_data, postId) => {
      queryClient.invalidateQueries({ queryKey: ['hasSaved', postId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['savedPosts'] });
    },
  });
}
