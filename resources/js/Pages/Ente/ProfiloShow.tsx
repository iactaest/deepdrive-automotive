import LayoutEnte from '@/Layouts/LayoutEnte';
import ProfiloContenuto from './ProfiloContenuto';

export default function ProfiloShow({ profilo }: any) {
    return (
        <LayoutEnte>
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4">
                    <ProfiloContenuto profilo={profilo} />
                </div>
            </div>
        </LayoutEnte>
    );
}
