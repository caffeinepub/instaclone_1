import Map "mo:core/Map";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";

import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply state migration on upgrade

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type UserProfile = {
    displayName : Text;
    bio : Text;
    avatarUrl : Text;
  };

  type Post = {
    id : Nat;
    author : Principal;
    imageUrl : Text;
    caption : Text;
    timestamp : Int;
    likeCount : Nat;
    comments : [Comment];
  };

  type Comment = {
    author : Principal;
    text : Text;
    timestamp : Int;
  };

  type Story = {
    author : Principal;
    imageUrl : Text;
    timestamp : Int;
  };

  type Notification = {
    recipient : Principal;
    eventType : NotificationEventType;
    postId : ?Nat;
    timestamp : Int;
    seen : Bool;
  };

  type NotificationEventType = {
    #postLiked;
    #postCommented;
    #userFollowed;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let posts = Map.empty<Nat, Post>();
  let followers = Map.empty<Principal, Set.Set<Principal>>();
  let following = Map.empty<Principal, Set.Set<Principal>>();
  let postLikes = Map.empty<Nat, Set.Set<Principal>>();
  var nextPostId = 0;

  let stories = Map.empty<Principal, [Story]>();
  let notifications = Map.empty<Principal, [Notification]>();
  let savedPosts = Map.empty<Principal, Set.Set<Nat>>();

  // Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func updateProfile(displayName : Text, bio : Text, avatarUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };
    let profile : UserProfile = {
      displayName;
      bio;
      avatarUrl;
    };
    userProfiles.add(caller, profile);
  };

  // Post Management
  public shared ({ caller }) func createPost(imageUrl : Text, caption : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };
    let post : Post = {
      id = nextPostId;
      author = caller;
      imageUrl;
      caption;
      timestamp = Time.now();
      likeCount = 0;
      comments = [];
    };
    posts.add(nextPostId, post);
    nextPostId += 1;
  };

  public query ({ caller }) func getPost(id : Nat) : async ?Post {
    posts.get(id);
  };

  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let updatedLikes = switch (postLikes.get(postId)) {
          case (null) {
            let newSet = Set.empty<Principal>();
            newSet.add(caller);
            newSet;
          };
          case (?existingSet) {
            if (existingSet.contains(caller)) {
              Runtime.trap("Already liked this post");
            };
            existingSet.add(caller);
            existingSet;
          };
        };
        postLikes.add(postId, updatedLikes);
        posts.add(postId, { post with likeCount = post.likeCount + 1 });
        createNotification(post.author, #postLiked, ?postId);
      };
    };
  };

  public shared ({ caller }) func unlikePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let updatedLikes = switch (postLikes.get(postId)) {
          case (null) { Runtime.trap("Post has no likes") };
          case (?existingSet) {
            if (not existingSet.contains(caller)) {
              Runtime.trap("User did not like this post");
            };
            existingSet.remove(caller);
            existingSet;
          };
        };
        postLikes.add(postId, updatedLikes);
        posts.add(postId, {
          post with likeCount = if (post.likeCount > 0) { post.likeCount - 1 } else {
            0;
          }
        });
      };
    };
  };

  public shared ({ caller }) func addComment(postId : Nat, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?post) {
        let comment : Comment = {
          author = caller;
          text;
          timestamp = Time.now();
        };
        let updatedComments = post.comments.concat([comment]);
        posts.add(postId, { post with comments = updatedComments });
        createNotification(post.author, #postCommented, ?postId);
      };
    };
  };

  // Follow/Unfollow
  public shared ({ caller }) func follow(userToFollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };
    if (userToFollow == caller) { Runtime.trap("Cannot follow yourself") };

    let currentFollowing = switch (following.get(caller)) {
      case (null) { Set.empty<Principal>() };
      case (?existing) { existing };
    };

    if (currentFollowing.contains(userToFollow)) {
      Runtime.trap("Already following this user");
    };

    currentFollowing.add(userToFollow);

    let userFollowers = switch (followers.get(userToFollow)) {
      case (null) { Set.empty<Principal>() };
      case (?existing) { existing };
    };
    userFollowers.add(caller);

    following.add(caller, currentFollowing);
    followers.add(userToFollow, userFollowers);

    createNotification(userToFollow, #userFollowed, null);
  };

  public shared ({ caller }) func unfollow(userToUnfollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };
    let currentFollowing = switch (following.get(caller)) {
      case (null) { Runtime.trap("Not following this user") };
      case (?existing) { existing };
    };

    if (not currentFollowing.contains(userToUnfollow)) {
      Runtime.trap("Not following this user");
    };

    currentFollowing.remove(userToUnfollow);

    let userFollowers = switch (followers.get(userToUnfollow)) {
      case (null) { Set.empty<Principal>() };
      case (?existing) { existing };
    };
    userFollowers.remove(caller);

    following.add(caller, currentFollowing);
    followers.add(userToUnfollow, userFollowers);
  };

  public query ({ caller }) func getHomeFeed() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their home feed");
    };
    let currentFollowing = switch (following.get(caller)) {
      case (null) { Set.empty<Principal>() };
      case (?existing) { existing };
    };

    let allPosts = posts.values().toArray();

    let feedPosts = allPosts.filter(
      func(post : Post) : Bool {
        currentFollowing.contains(post.author) or post.author == caller;
      }
    );

    let sortedPosts = feedPosts.sort(
      func(a : Post, b : Post) : Order.Order {
        if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) {
          #greater;
        } else { #equal };
      }
    );

    if (sortedPosts.size() == 0) {
      let allSorted = allPosts.sort(
        func(a : Post, b : Post) : Order.Order {
          if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) {
            #greater;
          } else { #equal };
        }
      );
      let limit = if (allSorted.size() < 100) { allSorted.size() } else { 100 };
      allSorted.sliceToArray(0, limit);
    } else {
      sortedPosts;
    };
  };

  public query ({ caller }) func getAllRecentPosts() : async [Post] {
    let allPosts = posts.values().toArray();
    let sortedPosts = allPosts.sort(
      func(a : Post, b : Post) : Order.Order {
        if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) {
          #greater;
        } else { #equal };
      }
    );
    let limit = if (sortedPosts.size() < 100) { sortedPosts.size() } else { 100 };
    sortedPosts.sliceToArray(0, limit);
  };

  public query ({ caller }) func getFollowerCount(user : Principal) : async Nat {
    switch (followers.get(user)) {
      case (null) { 0 };
      case (?set) { set.size() };
    };
  };

  public query ({ caller }) func getFollowingCount(user : Principal) : async Nat {
    switch (following.get(user)) {
      case (null) { 0 };
      case (?set) { set.size() };
    };
  };

  public query ({ caller }) func isFollowing(userToCheck : Principal) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check following status");
    };
    switch (following.get(caller)) {
      case (null) { false };
      case (?set) { set.contains(userToCheck) };
    };
  };

  public query ({ caller }) func hasLikedPost(postId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check like status");
    };
    switch (postLikes.get(postId)) {
      case (null) { false };
      case (?set) { set.contains(caller) };
    };
  };

  // Stories Feature
  public shared ({ caller }) func createStory(imageUrl : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create stories");
    };
    let story : Story = {
      author = caller;
      imageUrl;
      timestamp = Time.now();
    };
    let currentStories = switch (stories.get(caller)) {
      case (null) { [] };
      case (?existing) { existing };
    };
    let updatedStories = currentStories.concat([story]);
    stories.add(caller, updatedStories);
  };

  public query ({ caller }) func getActiveStories() : async [(Principal, [Story])] {
    let now = Time.now();
    let activeStories = stories.toArray().map(
      func((author, authorStories)) {
        let filtered = authorStories.filter(
          func(story) { now - story.timestamp < 24 * 60 * 60 * 1_000_000_000 }
        );
        (author, filtered);
      }
    );
    activeStories.filter(func((_, authorStories)) { authorStories.size() > 0 });
  };

  public query ({ caller }) func getStoryAvatars() : async [(Principal, Text)] {
    stories.toArray().filter(
      func((author, _)) { authorStoriesActive(author) }
    ).map(
      func((author, _)) {
        switch (userProfiles.get(author)) {
          case (null) { (author, "") };
          case (?profile) { (author, profile.avatarUrl) };
        };
      }
    );
  };

  func authorStoriesActive(author : Principal) : Bool {
    switch (stories.get(author)) {
      case (null) { false };
      case (?authorStories) {
        let now = Time.now();
        authorStories.any(func(story) { now - story.timestamp < 24 * 60 * 60 * 1_000_000_000 });
      };
    };
  };

  // Explore/Search Feature
  public query ({ caller }) func searchUsers(searchTerm : Text) : async [(Principal, UserProfile)] {
    let lowerTerm = searchTerm.toLower();
    userProfiles.toArray().filter(
      func((_, profile)) {
        profile.displayName.toLower().contains(#text lowerTerm);
      }
    );
  };

  public query ({ caller }) func getAllPostsForExplore() : async [Post] {
    let allPosts = posts.values().toArray();
    let sortedPosts = allPosts.sort(
      func(a : Post, b : Post) : Order.Order {
        if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) {
          #greater;
        } else { #equal };
      }
    );
    sortedPosts;
  };

  // Notifications Feature
  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get notifications");
    };
    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?userNotifications) {
        let sorted = userNotifications.sort(
          func(a, b) {
            if (a.timestamp > b.timestamp) { #less } else if (a.timestamp < b.timestamp) {
              #greater;
            } else { #equal };
          }
        );
        sorted;
      };
    };
  };

  public shared ({ caller }) func markNotificationsRead() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    switch (notifications.get(caller)) {
      case (null) {};
      case (?userNotifications) {
        let updated = userNotifications.map(
          func(n) { { n with seen = true } }
        );
        notifications.add(caller, updated);
      };
    };
  };

  func createNotification(recipient : Principal, eventType : NotificationEventType, postId : ?Nat) {
    let notification : Notification = {
      recipient;
      eventType;
      postId;
      timestamp = Time.now();
      seen = false;
    };
    let currentNotifications = switch (notifications.get(recipient)) {
      case (null) { [] };
      case (?existing) { existing };
    };
    notifications.add(recipient, currentNotifications.concat([notification]));
  };

  public query ({ caller }) func getUnreadNotificationCount() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get notification count");
    };
    switch (notifications.get(caller)) {
      case (null) { 0 };
      case (?userNotifications) {
        var count = 0;
        for (n in userNotifications.values()) {
          if (not n.seen) { count += 1 };
        };
        count;
      };
    };
  };

  // Save/Bookmark Feature
  public shared ({ caller }) func savePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save posts");
    };
    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?_) {
        let userSaved = switch (savedPosts.get(caller)) {
          case (null) {
            let newSet = Set.empty<Nat>();
            newSet.add(postId);
            newSet;
          };
          case (?existing) {
            if (existing.contains(postId)) {
              Runtime.trap("Post already saved");
            };
            existing.add(postId);
            existing;
          };
        };
        savedPosts.add(caller, userSaved);
      };
    };
  };

  public shared ({ caller }) func unsavePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unsave posts");
    };
    let userSaved = switch (savedPosts.get(caller)) {
      case (null) { Runtime.trap("No saved posts") };
      case (?existing) {
        if (not existing.contains(postId)) {
          Runtime.trap("Post not found in saved list");
        };
        existing.remove(postId);
        existing;
      };
    };
    savedPosts.add(caller, userSaved);
  };

  public query ({ caller }) func getSavedPosts() : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get saved posts");
    };
    switch (savedPosts.get(caller)) {
      case (null) { [] };
      case (?saved) {
        let postArray = saved.toArray();
        postArray.map(func(postId) { posts.get(postId) }).filter(func(opt) { opt != null }).map(
          func(opt) {
            switch (opt) {
              case (null) { Runtime.trap("Unexpected null post"); };
              case (?post) { post };
            };
          }
        );
      };
    };
  };

  public query ({ caller }) func hasSavedPost(postId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check saved posts");
    };
    switch (savedPosts.get(caller)) {
      case (null) { false };
      case (?saved) { saved.contains(postId) };
    };
  };
};
