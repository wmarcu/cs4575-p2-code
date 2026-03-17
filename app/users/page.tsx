//this is a server side component, thats why this (querying db) works. If this was a "use client" page this would break
import { db } from "@/db";
import { users } from "@/db/schema";

export default async function Home() {
  const allUsers = await db.select().from(users);

  return (
    <ul>
      {allUsers.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}