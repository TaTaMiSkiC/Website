import { Instagram } from "lucide-react";

const instagramPosts = [
  {
    id: 1,
    imageUrl: "https://pixabay.com/get/g2bb5d0912f669cb70bc8c4a17328d91713be87139ca8ad8c17e4e801812960dc0a42f4af9df1642ca6d7c2cead233c9251419ff5a44efcb5abe7c23a910a73f4_1280.jpg",
    link: "https://instagram.com"
  },
  {
    id: 2,
    imageUrl: "https://pixabay.com/get/g9f4d99421f497a9b063647f989ef7776472dda849bc1deac936ac4f570f5c6aa80a21190479f9b724cc7f4ad199737e3143a8bb4b218bda9b15a9d8219cf7f37_1280.jpg",
    link: "https://instagram.com"
  },
  {
    id: 3,
    imageUrl: "https://pixabay.com/get/g9a31246a47512f649568c46250a310a57c672d2689f1318455396a6cea00785f9302c8006d0b85aabd1218542d9770cbde095df56dd04dfeabdb7a5e73472b0d_1280.jpg",
    link: "https://instagram.com"
  },
  {
    id: 4,
    imageUrl: "https://pixabay.com/get/gcc66f9d27722611c30fcccffcba90be1d4a6300aa53782370b8eb5829efd2608172c4dbcb95e5826720bf823ab5ce00b06188fcdedcefc19f58f468f28fdc63d_1280.jpg",
    link: "https://instagram.com"
  },
  {
    id: 5,
    imageUrl: "https://pixabay.com/get/g53d9bc22bf0433d1ed453effb5e103169176074432e8cf2af672144f3f8888d2a7913d065ab9833105db2f7510d9d3670ae53ab14bb92d93dfbfdbdaf09272b4_1280.jpg",
    link: "https://instagram.com"
  },
  {
    id: 6,
    imageUrl: "https://pixabay.com/get/g8b379530645ad7bde97e6f91b84b3e3f43c6f9c1f7d4ba1096035f19550f84acc19567f5cb2ca8053ea65c9be2f36ae3c43ac154dc45e2e3a852181b9b99beda_1280.jpg",
    link: "https://instagram.com"
  }
];

export default function InstagramFeed() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading text-3xl md:text-4xl font-bold text-foreground">Pratite nas na Instagramu</h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">@kerzenwelt_by_dani</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <a 
              key={post.id}
              href={post.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative overflow-hidden group aspect-square"
            >
              <img 
                src={post.imageUrl} 
                alt="Instagram post" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="text-white" size={24} />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
