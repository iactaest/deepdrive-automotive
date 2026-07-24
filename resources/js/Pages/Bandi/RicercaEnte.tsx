import LayoutEnte from '@/Layouts/LayoutEnte';
import RicercaContenuto from './RicercaContenuto';

export default function RicercaEnte({ profilo }: any) {
    return (
        <LayoutEnte>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <RicercaContenuto profilo={profilo} />
                </div>
            </div>
        </LayoutEnte>
    );
}
