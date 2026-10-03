"""Threaded DB benchmark: python scripts/bench_threads.py [threads]. Mimics runserver (new thread per request).
Run with DB_USE_POOL=0 and DB_USE_POOL=1 to compare. Read-only (one COUNT per 'request')."""
import os, sys, time, threading
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
import django; django.setup()
from django.db import connections
from apps.accounts.models import User
N = int(sys.argv[1]) if len(sys.argv) > 1 else 10
User.objects.count(); connections.close_all()
def one(out, i):
    t = time.perf_counter()
    try:
        User.objects.count(); out[i] = (time.perf_counter() - t) * 1000
    except Exception as e:
        out[i] = f"ERR {type(e).__name__}"
    finally:
        connections.close_all()  # what a finished request thread does
for rounds in range(5):
    out = [None] * N; ts = [threading.Thread(target=one, args=(out, i)) for i in range(N)]
    t0 = time.perf_counter(); [t.start() for t in ts]; [t.join() for t in ts]
    ok = [x for x in out if isinstance(x, float)]
    print(f"round {rounds+1}: {N} parallel wall={(time.perf_counter()-t0)*1000:.0f}ms ok={len(ok)} err={N-len(ok)} avg={sum(ok)/max(1,len(ok)):.0f}ms max={max(ok) if ok else 0:.0f}ms")
