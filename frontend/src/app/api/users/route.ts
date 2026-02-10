export async function GET() {
  return Response.json([
    { id: 1, name: "Alice", email: "alice@test.com" },
    { id: 2, name: "Bob", email: "bob@test.com" },
  ]);
}

export async function POST(req: Request) {
  const body = await req.json();
  return Response.json({ success: true, user: body });
}
