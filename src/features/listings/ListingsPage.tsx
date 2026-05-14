import { Link } from "react-router-dom";

export function ListingsPage() {
  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  // Logged in users see listings
  if (isAuthenticated) {
    return (
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold mb-8">Discover Unique Stays</h1>
          <p className="text-center py-20 text-xl text-gray-500">
            Welcome back! 🎉<br />
            Your listings will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Beautiful Hero Homepage for guests
  return (
    <div className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
         style={{
           backgroundImage: "url('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=2000')"
         }}>
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <p className="text-white uppercase tracking-widest text-sm mb-4">WE ARE #1 ON THE MARKET</p>
        
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
          We're Here To Help You<br />
          <span className="text-emerald-400">Navigate While Traveling</span>
        </h1>

        <p className="text-white/90 text-lg mb-12 max-w-2xl mx-auto">
          You'll get comprehensive results based on the provided location.
        </p>

        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-3 shadow-2xl mb-12">
          <div className="flex flex-col md:flex-row items-center bg-white rounded-3xl">
            <div className="flex-1 px-8 py-5">
              <div className="flex items-center gap-3">
                <span>🔍</span>
                <input 
                  type="text" 
                  placeholder="What are you looking for?" 
                  className="flex-1 focus:outline-none text-lg placeholder-gray-400"
                />
              </div>
            </div>
            <div className="flex-1 px-8 py-5 border-t md:border-t-0 md:border-l">
              <div className="flex items-center gap-3">
                <span>📍</span>
                <p className="text-gray-700">Location</p>
              </div>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-5 rounded-3xl font-semibold mx-3">
              Search places
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/signup"
            className="px-12 py-4 bg-white text-gray-900 font-semibold rounded-2xl text-lg hover:bg-gray-100 transition"
          >
            Sign Up
          </Link>
          <Link 
            to="/login"
            className="px-12 py-4 border-2 border-white text-white font-semibold rounded-2xl text-lg hover:bg-white/10 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}