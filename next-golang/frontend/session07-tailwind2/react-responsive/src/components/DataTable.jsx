export default function DataTable(props){
    return (
<table class="w-full text-sm">
  <thead class="bg-gray-50 dark:bg-gray-900/50">
    <tr>
      {Object.keys(props.data[0]).map((keyItem, index) => (<th key={index} class="px-6 py-3 text-left text-xs
                 font-semibold text-gray-500
                 uppercase tracking-wider">{keyItem}</th>))}
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-200
               dark:divide-gray-700">
    {props.data.map((item , index) => (<tr key={index} class="hover:bg-gray-50
               dark:hover:bg-gray-700/50
               transition">
      {Object.keys(item).map((keyItem, index) => (<td key={index} class="px-6 py-4 font-medium
                 text-gray-900 dark:text-white">
       {item[keyItem]}
      </td>))}
    </tr>))}
  </tbody>
</table>
)
}