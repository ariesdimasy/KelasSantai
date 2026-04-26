export default function Input(){
    return (
<div>
    <div class="space-y-1.5">
    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Email <span class="text-red-500">*</span>
    </label>
    <input
        type="email"
        className="w-full px-3.5 py-2.5
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-lg
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition duration-200"
        placeholder="nama@email.com"
    />
    </div>
    
    
    <input type='text' className="w-full px-3.5 py-2.5 rounded-lg border-red-800 bg-red-50 dark:bg-red-900/20 focus:ring-red-500" placeholder="Email" />
    <p class="text-red-500 text-xs mt-1">⚠ Email tidak valid.</p>

    <input type='text' className="w-full px-3.5 py-2.5 rounded-lg border-green-800 bg-green-50 dark:bg-green-900/20 focus:ring-green-500" />
    <p class="text-green-600 text-xs mt-1">✓ Email tersedia!</p>

    <input type='text' className="w-full px-3.5 py-2.5 rounded-lg border-gray-800 bg-gray-50 text-gray-400 cursor-not-allowed dark:bg-gray-900" disabled />
</div>
)
}