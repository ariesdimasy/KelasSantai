export default function StateCard () { 
    return (
    <div class="bg-white dark:bg-gray-800
                rounded-xl border border-gray-200
                dark:border-gray-700 p-6 w-full">
    <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-medium
                    text-gray-500 dark:text-gray-400">
        Total User
        </span>
        <span class="p-2 bg-blue-50 dark:bg-blue-900/20
                    rounded-lg text-blue-600">👥</span>
    </div>
    <p class="text-3xl font-bold
                text-gray-900 dark:text-white">1,234</p>
    <p class="text-sm text-green-600 mt-1">↑ 12%</p>
    </div>
    )
}