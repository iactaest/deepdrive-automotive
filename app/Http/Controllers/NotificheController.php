<?php

namespace App\Http\Controllers;

use App\Models\Notifica;
use Illuminate\Support\Facades\Auth;

class NotificheController extends Controller
{
    public function index()
    {
        return response()->json(
            Notifica::where('user_id', Auth::id())->latest()->limit(20)->get()
        );
    }

    public function nonLetteCount()
    {
        return response()->json([
            'count' => Notifica::where('user_id', Auth::id())->nonLette()->count(),
        ]);
    }

    public function segnaLetta(int $id)
    {
        Notifica::where('user_id', Auth::id())->where('id', $id)->update(['letta_at' => now()]);

        return response()->json(['ok' => true]);
    }

    public function segnaTutteLette()
    {
        Notifica::where('user_id', Auth::id())->nonLette()->update(['letta_at' => now()]);

        return response()->json(['ok' => true]);
    }
}
