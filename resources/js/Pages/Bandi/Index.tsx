import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index() {
    return (
        <AuthenticatedLayout>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-slate-800/50 rounded-xl p-6">
                        <h1 className="text-2xl font-bold text-white">Bandi Finder</h1>
                        <p className="text-slate-400 mt-2">Dashboard bandi in costruzione...</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}