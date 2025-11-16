export function MyAccount() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Account</h1>
        <div className="space-y-8">
          {/* Placeholder for account details */}
          <div className="p-6 border border-gray-200 rounded-xl bg-gray-50">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Personal Information</h2>
            <p className="text-gray-600">Account details will be displayed here.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-xl bg-gray-50">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Shipping Addresses</h2>
            <p className="text-gray-600">Saved addresses will be displayed here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
