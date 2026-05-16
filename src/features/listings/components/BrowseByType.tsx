import { FiHome, FiMapPin, FiTriangle, FiFeather, FiSun, FiStar } from "react-icons/fi";

const categories = [
  { icon: FiSun, label: 'Beach' },
  { icon: FiTriangle, label: 'Mountain' },
  { icon: FiMapPin, label: 'City' },
  { icon: FiHome, label: 'House' },
  { icon: FiFeather, label: 'Countryside' },
  { icon: FiStar, label: 'Luxury' },
];

export function BrowseByType() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-emerald-600 font-medium tracking-widest">BROWSE BY TYPE</p>
        <h2 className="text-4xl font-bold mt-2">Explore Categories</h2>
        <p className="text-gray-600 mt-3">Find the perfect type of accommodation for your trip</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat, index) => {
          const Icon = cat.icon;
          return (
            <div 
              key={index}
              className="group bg-white border border-gray-100 hover:border-emerald-200 rounded-2xl p-6 text-center cursor-pointer transition-all hover:shadow-md"
            >
              <div className="text-5xl mb-4 transition-transform group-hover:scale-110">
                <Icon />
              </div>
              <p className="font-medium text-gray-800">{cat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}