"use client"

import { useEffect, useState } from "react"
import LoadingSkeleton from "@/components/LoadingSkeleton"
import UserCard from "@/components/UserCard"
import ErrorMessage from "@/components/ErrorMessage"

export default function Users(){

    const [users, setUsers]     = useState([]);
    const [loading, setLoading] = useState(true);   // ← state 1: loading
    const [error, setError]     = useState(null);   // ← state 2: error
    // data = users itu sendiri                      // ← state 3: data
    const [query, setQuery]    = useState("")

    async function fetchUsers() {
      try {
        const res = await fetch("https://dummyjson.com/users");
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        setError(err.message);          // simpan pesan error
      } finally {
        setLoading(false);              // selalu set false — error atau tidak
      }
    }

    const handleSearch = async () => {
        try {
            const res = await fetch("https://dummyjson.com/users/search?q="+query);
            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            const data = await res.json();
            setUsers(data.users);
        } catch (err) {
            setError(err.message);          // simpan pesan error
        } finally {
            setLoading(false);              // selalu set false — error atau tidak
        }
    }

    useEffect(() => {
        fetchUsers()
    },[])

    if (loading) return <LoadingSkeleton />;   // tampil skeleton
    if (error)   return <ErrorMessage msg={error} />;  // tampil error

    return (<main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-4xl mb-6"> User List</h1>
        <div className="border-blue-600">
         <label> Search : </label>
          <input type="text" name='query' value={query} id="query" 
            onChange={(e) => setQuery(e.target.value)}
            onKeyUp={(e) => e.key == "Enter" ? handleSearch(query) : "" }
          />
          </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users.map(user => <UserCard key={user.id} user={user} />)}
        </div>
    </main>)
}