import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
            <main className="flex flex-col gap-4 items-center text-center">
                <h1 className="text-4xl font-bold text-primary">Stewart & Jane Group</h1>
                <p className="text-xl text-slate-600">Packet Builder System</p>

                <div className="flex gap-4 mt-8">
                    <Link
                        href="/admin"
                        className="rounded-full bg-primary text-white px-6 py-2 hover:opacity-90 transition-opacity"
                    >
                        Go to Admin
                    </Link>
                </div>
            </main>
        </div>
    );
}
