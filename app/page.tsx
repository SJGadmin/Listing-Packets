import Link from "next/link";
import Image from "next/image";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8 relative overflow-hidden">
            {/* Topographic background pattern with opacity */}
            <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                    backgroundImage: 'url(/topographic-pattern.png)',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '600px 600px',
                }}
            />

            {/* Content */}
            <main className="flex flex-col gap-6 items-center text-center relative z-10">
                {/* Logo */}
                <div className="mb-4">
                    <Image
                        src="/logo.png"
                        alt="Stewart & Jane Group Logo"
                        width={200}
                        height={200}
                        priority
                        className="drop-shadow-lg"
                    />
                </div>

                <h1 className="text-4xl font-bold text-primary">Stewart & Jane Group</h1>
                <p className="text-xl text-slate-600">Packet Builder System</p>

                <div className="flex gap-4 mt-8">
                    <Link
                        href="/admin"
                        className="rounded-full bg-primary text-white px-6 py-2 hover:opacity-90 transition-opacity shadow-md hover:shadow-lg transition-all"
                    >
                        Go to Admin
                    </Link>
                </div>
            </main>
        </div>
    );
}
