import Link from "next/link";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type View = "posts" | "drafts" | "add";

type Post = {
  id: string;
  title: string;
  content: string | null;
  published: boolean;
  createdAt: Date;
};

const tabs = [
  { label: "Posts", value: "posts" },
  { label: "Drafts", value: "drafts" },
  { label: "Add Post", value: "add" },
] as const;

const prettyDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

async function addPost(formData: FormData) {
  "use server";

  const title = formData.get("title")?.toString().trim();
  const content = formData.get("content")?.toString().trim();
  if (!title) return;

  await prisma.post.create({
    data: {
      title,
      content: content || "No description added yet.",
    },
  });

  revalidatePath("/");
}

async function publishDraft(formData: FormData) {
  "use server";

  const id = formData.get("postId")?.toString();
  if (!id) return;

  await prisma.post.update({
    where: { id },
    data: { published: true },
  });

  revalidatePath("/");
}

async function deleteDraft(formData: FormData) {
  "use server";

  const id = formData.get("postId")?.toString();
  if (!id) return;

  await prisma.post.delete({ where: { id } });
  revalidatePath("/");
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const { view } = (await searchParams) ?? {};
  const selectedView = (view as View) ?? "posts";
  let publishedPosts: Post[] = [];
  let draftPosts: Post[] = [];
  let dbError = false;
  let dbErrorMessage = "";

  try {
    publishedPosts = await prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });

    draftPosts = await prisma.post.findMany({
      where: { published: false },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    dbError = true;
    dbErrorMessage =
      "Cannot connect to the database. Please start your MySQL server and verify your DATABASE_URL.";
  }

  const totalPosts = publishedPosts.length + draftPosts.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-8">
        <header className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.08)] sm:flex sm:items-center sm:justify-between sm:p-8">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600/90">Posts App</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              A clean light dashboard for posts and drafts
            </h1>
          </div>
          <nav className="mt-4 flex flex-wrap gap-3 sm:mt-0">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={`/?view=${tab.value}`}
                className={`rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                  view === tab.value
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600/90">Posts App</p>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  Build and manage posts with a modern light dashboard
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Create drafts, publish posts, and store content with Prisma and MySQL.
                  This app now reads from and writes to your SQL database.
                </p>
              </div>
              {dbError && (
                <div className="rounded-3xl border border-amber-400/30 bg-amber-500/10 p-5 text-amber-100 shadow-[0_10px_30px_-15px_rgba(245,158,11,0.35)]">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">Database connection issue</p>
                  <p className="mt-3 text-sm leading-6 text-amber-100/90">{dbErrorMessage}</p>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-sky-600/80">Published</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{publishedPosts.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Drafts</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{draftPosts.length}</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Total posts</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{totalPosts}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-[28px] bg-gradient-to-br from-sky-50 via-white to-slate-50 p-6 shadow-[0_20px_80px_-40px_rgba(14,165,233,0.12)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600/90">Quick start</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Use the tab controls</h2>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                Switch views to see published posts, drafts, or add a new post directly into your database.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {tabs.map((tab) => (
                  <Link
                    key={tab.value}
                    href={`/?view=${tab.value}`}
                    className={`rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                      selectedView === tab.value
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {selectedView === "posts" && (
              <div className="space-y-6">
                {publishedPosts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                    No published posts found.
                  </div>
                ) : (
                  publishedPosts.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600/80">Published</p>
                          <h2 className="mt-3 text-2xl font-semibold text-slate-950">{post.title}</h2>
                        </div>
                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
                          Live
                        </span>
                      </div>
                      <p className="mt-6 whitespace-pre-wrap text-slate-600">{post.content ?? "No description added yet."}</p>
                    </article>
                  ))
                )}
              </div>
            )}

            {selectedView === "drafts" && (
              <div className="space-y-6">
                {draftPosts.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
                    No drafts yet. Add a new post to begin.
                  </div>
                ) : (
                  draftPosts.map((post) => (
                    <article
                      key={post.id}
                      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.08)]"
                    >
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold text-slate-950">{post.title}</h2>
                          <p className="mt-4 max-w-2xl whitespace-pre-wrap text-slate-600">{post.content ?? "No description added yet."}</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <form action={publishDraft} className="inline-block">
                            <input type="hidden" name="postId" value={post.id} />
                            <button
                              type="submit"
                              className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                            >
                              Publish
                            </button>
                          </form>
                          <form action={deleteDraft} className="inline-block">
                            <input type="hidden" name="postId" value={post.id} />
                            <button
                              type="submit"
                              className="rounded-full border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {selectedView === "add" && (
              <article className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.06)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600/80">Add Post</p>
                    <h2 className="mt-3 text-3xl font-semibold text-slate-950">Create a new draft</h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Draft mode
                  </span>
                </div>
                <form action={addPost} className="mt-8 space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Title</label>
                    <input
                      name="title"
                      type="text"
                      required
                      placeholder="Working with databases in Next.js using Prisma"
                      className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Content</label>
                    <textarea
                      name="content"
                      rows={8}
                      placeholder="Next.js is a database-agnostic web-based framework..."
                      className="w-full rounded-[28px] border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex rounded-full bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    Add Post
                  </button>
                </form>
              </article>
            )}
          </div>

          <aside className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.08)]">
            <div className="rounded-3xl bg-slate-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600/80">Quick tips</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-950">How it works</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Add a post to save a draft. Publish drafts from the Drafts view, or delete them if you want to start fresh.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Sample output</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>Posts view shows published posts.</li>
                <li>Drafts view includes publish/delete actions.</li>
                <li>Add Post opens a clean submission form.</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
