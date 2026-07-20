interface Props {
    ammissibile: boolean | null;
}

export default function BadgeAmmissibile({ ammissibile }: Props) {
    if (ammissibile === true) {
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">Ammissibile</span>;
    }
    if (ammissibile === false) {
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">Non ammissibile</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400">Da verificare</span>;
}
