export default function UserCard({ user }) {
  const { firstName, lastName, username, email, phone, website, address, company } = user;

  

  return (
    <div className="group flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-purple-600 text-lg font-semibold text-white">
          {firstName}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-gray-900">{firstName} {lastName}</h3>
          <p className="truncate text-sm text-gray-500">@{username}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">✉</span>
          <a href={`mailto:${email}`} className="truncate hover:text-purple-600">
            {email}
          </a>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400">☎</span>
          <span className="truncate">{phone}</span>
        </div>
        
        {address && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">📍</span>
            <span className="truncate">
              {address.street}, {address.city}
            </span>
          </div>
        )}
      </div>

      {company && (
        <div className="mt-1 rounded-xl bg-gray-50 px-3 py-2">
          <p className="text-xs font-medium text-gray-700">{company.name}</p>
        </div>
      )}
    </div>
  );
}
