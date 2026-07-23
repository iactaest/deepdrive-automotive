import LayoutEnte from '@/Layouts/LayoutEnte';
import DashboardContenuto, { type DashboardData } from './DashboardContenuto';

export default function DashboardEnte({ dashboard, profilo }: { dashboard: DashboardData; profilo?: { nome_ente?: string | null } }) {
    return (
        <LayoutEnte>
            <DashboardContenuto dashboard={dashboard} profilo={profilo} />
        </LayoutEnte>
    );
}
