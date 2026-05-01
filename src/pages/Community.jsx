import { useState } from "react";

function makeSeedPosts(pets) {
  const fallbackImage = "/pets/bearded-dragon.webp";

  return [
    {
      id: "post-spike",
      author: "Maya",
      petName: pets[0]?.name || "Spike",
      image: pets[0]?.image || fallbackImage,
      caption: "Morning basking check. Temperature looks stable and appetite is back.",
      time: "12 min ago",
      likes: 24,
      comments: 6,
    },
    {
      id: "post-mochi",
      author: "Leo",
      petName: pets[1]?.name || "Mochi",
      image: pets[1]?.image || "/pets/leopard-gecko.jpg",
      caption: "Fresh moist hide after shedding week. Keeping humidity gentle today.",
      time: "48 min ago",
      likes: 18,
      comments: 3,
    },
    {
      id: "post-noodle",
      author: "Ava",
      petName: pets[2]?.name || "Noodle",
      image: pets[2]?.image || "/pets/ball-python.webp",
      caption: "Community reminder: always check enclosure locks after feeding.",
      time: "2 hr ago",
      likes: 41,
      comments: 11,
    },
  ];
}

function Community({ pets }) {
  const [posts, setPosts] = useState(() => makeSeedPosts(pets));
  const [caption, setCaption] = useState("");
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id || "");
  const [previewImage, setPreviewImage] = useState("");
  const selectedPet = pets.find((pet) => pet.id === selectedPetId) || pets[0];

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
      petName: selectedPet?.name || "My reptile",
      image: previewImage || selectedPet?.image || "/pets/bearded-dragon.webp",
      caption: caption.trim() || "Shared a new reptile moment.",
      time: "Just now",
      likes: 0,
      comments: 0,
    };

    setPosts((currentPosts) => [nextPost, ...currentPosts]);
    setCaption("");
    setPreviewImage("");
  };

  const likePost = (id) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === id ? { ...post, likes: post.likes + 1 } : post)),
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
            <div className="community-preview">
              <img alt="" src={previewImage || selectedPet?.image || "/pets/bearded-dragon.webp"} />
              <span>{previewImage ? "New photo ready" : "Using selected pet photo"}</span>
            </div>
          </label>
          <button className="submit-pet-button" type="submit">Publish post</button>
        </form>
      </section>

      <section className="community-feed" aria-label="Community posts">
        {posts.map((post) => (
          <article className="community-post" key={post.id}>
            <img alt={`${post.petName} shared by ${post.author}`} src={post.image} />
            <div className="community-post-body">
              <div className="post-author-row">
                <div>
                  <strong>{post.author}</strong>
                  <span>{post.petName} - {post.time}</span>
                </div>
                <button onClick={() => likePost(post.id)} type="button">Like</button>
              </div>
              <p>{post.caption}</p>
              <div className="post-stats">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Community;
