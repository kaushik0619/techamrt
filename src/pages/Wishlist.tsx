export function Wishlist() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Wishlist</h1>
        <div className="space-y-4">
          {/* Placeholder for wishlist items */}
          <div className="p-6 border border-gray-200 rounded-xl text-center bg-gray-50">
            <p className="text-gray-600">Your wishlist is currently empty.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
