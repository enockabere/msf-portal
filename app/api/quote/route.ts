export async function GET() {
  try {
    const res = await fetch("https://api.quotable.io/random", {
      cache: "no-store",
    });
    const data = await res.json();
    console.log(data);
    return Response.json(data);
  } catch (error) {
    return Response.json(
      {
        content: "Keep going, you are closer than you think.",
        author: "Unknown",
      },
      { status: 200 }
    );
  }
}
