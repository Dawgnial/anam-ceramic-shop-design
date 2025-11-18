const galleryImages = [
  "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1610650876093-a9ec4e8f264b?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1493707553966-283afb8c7aee?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1516886635086-2b3c423c0947?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
];

export const ImageGallery = () => {
  return (
    <section className="w-full">
      <div className="flex w-full">
        {galleryImages.map((image, index) => (
          <div key={index} className="flex-1">
            <img
              src={image}
              alt={`Gallery ${index + 1}`}
              className="w-full h-64 object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
