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