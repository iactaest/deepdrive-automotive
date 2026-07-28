import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    <img src="/images/logo-deepbandi.png" alt="DeepBandi" className="h-20 w-auto" style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,.5)) drop-shadow(0 1px 0 rgba(255,255,255,.15))' }} />
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
