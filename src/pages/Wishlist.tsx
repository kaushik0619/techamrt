export function Wishlist() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">My Wishlist</h1>
      <div className="space-y-4">
        {/* Placeholder for wishlist items */}
        <div className="p-6 border rounded-xl text-center">
          <p className="text-neutral-500">Your wishlist is currently empty.</p>
        </div>
      </div>
    </div>
  );
}
