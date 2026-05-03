import { useState } from "react";

const sortOptions = ["Latest", "Most Liked", "Following"];

const communityPets = [
  {
    name: "Sunny",
    species: "Leopard Gecko",
    image: "/community-pets/Communitypet1.jpg",
  },
  {
    name: "Ruby",
    species: "Corn Snake",
    image: "/community-pets/Communitypet2.jpg",
  },
  {
    name: "Mango",
    species: "Crested Gecko",
    image: "/community-pets/Communitypet3.jpg",
  },
];

function makeSeedPosts() {
  return [
    {
      id: "post-sunny",
      author: "Maya",
      avatar: "/avatars/Community1.jpg",
      petName: communityPets[0].name,
      petSpecies: communityPets[0].species,
      image: communityPets[0].image,
      caption: "Morning hide check. Sunny finally came out after a quiet shedding week.",
      time: "12 min ago",
      likes: 24,
      likedByMe: false,
      shares: 4,
      sharedByMe: false,
      following: true,
      comments: [
        { id: "comment-sunny-1", author: "Noah", text: "Great recovery sign. Did you add a warmer hide?", likes: 5, likedByMe: false },
        { id: "comment-sunny-2", author: "Iris", text: "That posture looks much more relaxed today.", likes: 3, likedByMe: false },
      ],
    },
    {
      id: "post-ruby",
      author: "Leo",
      avatar: "/avatars/Community2.jpg",
      petName: communityPets[1].name,
      petSpecies: communityPets[1].species,
      image: communityPets[1].image,
      caption: "Ruby handled calmly during enclosure cleaning. Lock check before feeding is now a habit.",
      time: "48 min ago",
      likes: 18,
      likedByMe: false,
      shares: 2,
      sharedByMe: false,
      following: false,
      comments: [
        { id: "comment-ruby-1", author: "Maya", text: "The lock check habit is so important after handling days.", likes: 4, likedByMe: false },
      ],
    },
    {
      id: "post-mango",
      author: "Ava",
      avatar: "/avatars/Community3.jpg",
      petName: communityPets[2].name,
      petSpecies: communityPets[2].species,
      image: communityPets[2].image,
      caption: "Mango's climbing branch reset looks good. Keeping the evening misting light.",
      time: "2 hr ago",
      likes: 41,
      likedByMe: false,
      shares: 9,
      sharedByMe: false,
      following: true,
      comments: [
        { id: "comment-mango-1", author: "You", text: "The branch setup looks much easier to inspect now.", likes: 8, likedByMe: false },
      ],
    },
  ];
}

function Community({ pets }) {
  const [posts, setPosts] = useState(() => makeSeedPosts());
  const [activeSort, setActiveSort] = useState("Latest");
  const [caption, setCaption] = useState("");
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id || "");
  const [previewImage, setPreviewImage] = useState("");
  const [openComments, setOpenComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) || pets[0];
  const sortedPosts = [...posts].sort((a, b) => {
    if (activeSort === "Most Liked") return b.likes - a.likes;
    if (activeSort === "Following") return Number(b.following) - Number(a.following);
    return 0;
  });

  const updateImageFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreviewImage(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const publishPost = (event) => {
    event.preventDefault();
    if (!caption.trim() && !previewImage) return;

    const nextPost = {
      id: `post-${Date.now()}`,
      author: "You",
      avatar: "/avatars/Vulkan.jpg",
      petName: selectedPet?.name || "My reptile",
      petSpecies: selectedPet?.species || "Reptile",
      image: previewImage || selectedPet?.image || "/pets/bearded-dragon.webp",
      caption: caption.trim() || "Shared a new reptile moment.",
      time: "Just now",
      likes: 0,
      likedByMe: false,
      shares: 0,
      sharedByMe: false,
      following: true,
      comments: [],
    };

    setPosts((currentPosts) => [nextPost, ...currentPosts]);
    setCaption("");
    setPreviewImage("");
  };

  const likePost = (id) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === id
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likes: Math.max(0, post.likes + (post.likedByMe ? -1 : 1)),
            }
          : post,
      ),
    );
  };

  const sharePost = (id) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === id && !post.sharedByMe
          ? { ...post, sharedByMe: true, shares: post.shares + 1 }
          : post,
      ),
    );
  };

  const addComment = (event, postId) => {
    event.preventDefault();
    const text = (commentDrafts[postId] || "").trim();
    if (!text) return;

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                { id: `comment-${Date.now()}`, author: "You", text, likes: 0, likedByMe: false },
              ],
            }
          : post,
      ),
    );
    setCommentDrafts((current) => ({ ...current, [postId]: "" }));
  };

  const likeComment = (postId, commentId) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? {
                      ...comment,
                      likedByMe: !comment.likedByMe,
                      likes: Math.max(0, comment.likes + (comment.likedByMe ? -1 : 1)),
                    }
                  : comment,
              ),
            }
          : post,
      ),
    );
  };

  return (
    <div className="page community-page">
      <section className="panel community-composer">
        <div className="panel-heading">
          <div>
            <p className="section-label">Reptile community</p>
            <h2>Share pet moments</h2>
          </div>
          <span className="pill">Demo feed</span>
        </div>

        <form className="community-form" onSubmit={publishPost}>
          <label>
            Pet
            <select value={selectedPetId} onChange={(event) => setSelectedPetId(event.target.value)}>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} - {pet.species}
                </option>
              ))}
            </select>
          </label>
          <label className="wide-field">
            Caption
            <textarea
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Write a short update for the community..."
              value={caption}
            />
          </label>
          <label className="wide-field image-upload-field">
            Photo
            <input accept="image/*" type="file" onChange={(event) => updateImageFile(event.target.files?.[0])} />
            <span className="file-upload-control">
              <strong>Choose file</strong>
              <em>{previewImage ? "Image selected" : "No file selected"}</em>
            </span>
            <div className="community-preview">
              <img alt="" src={previewImage || selectedPet?.image || "/pets/bearded-dragon.webp"} />
              <span>{previewImage ? "New photo ready" : "Using selected pet photo"}</span>
            </div>
          </label>
          <button className="submit-pet-button" type="submit">Publish post</button>
        </form>
      </section>

      <section className="community-sort-chips" aria-label="Sort community posts">
        {sortOptions.map((option) => (
          <button
            className={activeSort === option ? "active" : ""}
            key={option}
            onClick={() => setActiveSort(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </section>

      <section className="community-feed" aria-label="Community posts">
        {sortedPosts.map((post) => (
          <article className="community-post" key={post.id}>
            <div className="community-post-body">
              <div className="post-author-row">
                <img alt="" src={post.avatar} />
                <div>
                  <strong>{post.author}</strong>
                  <span>{post.time}</span>
                </div>
                <em>{post.petName} - {post.petSpecies}</em>
              </div>
              <p>{post.caption}</p>
              {post.image && <img alt={`${post.petName} shared by ${post.author}`} src={post.image} />}
              <div className="post-stats">
                <button className={post.likedByMe ? "like-button liked" : "like-button"} onClick={() => likePost(post.id)} type="button" aria-label="Like post">
                  <span className="engagement-icon heart">{"\u2665"}</span> {post.likes}
                </button>
                <button onClick={() => setOpenComments((current) => ({ ...current, [post.id]: !current[post.id] }))} type="button" aria-label="Open comments">
                  <span className="engagement-icon">{"\u25CC"}</span> {post.comments.length}
                </button>
                <button className={post.sharedByMe ? "share-button shared" : "share-button"} onClick={() => sharePost(post.id)} type="button" aria-label="Share post">
                  <span className="engagement-icon">{"\u2197"}</span> {post.shares}
                </button>
              </div>
              {openComments[post.id] && (
                <div className="comment-thread">
                  {post.comments.map((comment) => (
                    <article className="comment-row" key={comment.id}>
                      <div>
                        <strong>{comment.author}</strong>
                        <p>{comment.text}</p>
                      </div>
                      <button className={comment.likedByMe ? "like-button liked" : "like-button"} onClick={() => likeComment(post.id, comment.id)} type="button"><span className="engagement-icon heart">{"\u2665"}</span> {comment.likes}</button>
                    </article>
                  ))}
                  <form className="comment-form" onSubmit={(event) => addComment(event, post.id)}>
                    <input
                      aria-label={`Reply to ${post.author}`}
                      onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                      placeholder="Write a reply..."
                      value={commentDrafts[post.id] || ""}
                    />
                    <button disabled={!(commentDrafts[post.id] || "").trim()} type="submit">Reply</button>
                  </form>
                </div>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Community;

